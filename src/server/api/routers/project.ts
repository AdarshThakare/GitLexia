import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { pollCommits } from "@/lib/github";
import { indexGithubRepo } from "@/lib/github-loader";
import { createRazorpayOrder, verifyAndCreditUser } from "@/lib/razorpay";
import { getContributorStats, getCommitActivity, getPunchCard, getLanguages } from "@/lib/github-stats";
import { clerkClient } from "@clerk/nextjs/server";

export const projectRouter = createTRPCRouter({
  createProject: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        githubUrl: z.string(),
        githubToken: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Ensure user exists in our DB to prevent Foreign Key constraint failure
        const userExists = await ctx.db.user.findUnique({ where: { id: ctx.user.userId! } });
        if (!userExists) {
          const client = await clerkClient();
          const clerkUser = await client.users.getUser(ctx.user.userId!);
          await ctx.db.user.create({
            data: {
              id: ctx.user.userId!,
              emailAddress: clerkUser.emailAddresses[0]?.emailAddress ?? "",
              firstName: clerkUser.firstName,
              lastName: clerkUser.lastName,
              imageUrl: clerkUser.imageUrl,
            }
          });
        }

        const project = await ctx.db.project.create({
          data: {
            githubUrl: input.githubUrl,
            name: input.name,
            userToProjects: {
              create: {
                userId: ctx.user.userId!,
              },
            },
          },
        });

        return project;
      } catch (error: any) {
        console.error("Prisma create error: ", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error?.message || "Database failed to create project",
        });
      }
    }),

  generateInsights: protectedProcedure
    .input(z.object({ projectId: z.string(), githubToken: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findUnique({
        where: { id: input.projectId },
      });
      if (!project) throw new Error("Project not found");

      // Execute commit polling
      await pollCommits(project.id);

      return { success: true };
    }),

  // Returns the indexed status so the client can poll
  getProjectStatus: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.project.findUnique({
        where: { id: input.projectId },
        select: { isIndexed: true },
      });
      return { isIndexed: project?.isIndexed ?? false };
    }),

  // Fetch + summarise new commits only — no re-indexing of source code
  generateCommitSummaries: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findUnique({
        where: { id: input.projectId },
      });
      if (!project) throw new Error("Project not found");

      await pollCommits(project.id);

      return { success: true };
    }),

  getProjects: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.project.findMany({
      where: {
        userToProjects: {
          some: {
            userId: ctx.user.userId!,
          },
        },
        deletedAt: null,
      },
    });
  }),

  getCommits: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.commit.findMany({
        where: { projectId: input.projectId },
        orderBy: { commitDate: "desc" },
        take: 15,
      });
    }),


  getProjectAnalytics: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.project.findUnique({
        where: { id: input.projectId },
        select: { githubUrl: true },
      });
      if (!project?.githubUrl) throw new Error("Project has no github URL");

      try {
        const [contributorStats, commitActivity, punchCard, languages, dbCommits] = await Promise.all([
          getContributorStats(project.githubUrl),
          getCommitActivity(project.githubUrl),
          getPunchCard(project.githubUrl),
          getLanguages(project.githubUrl),
          ctx.db.commit.findMany({
            where: { projectId: input.projectId },
            select: {
              commitAuthorName: true,
              summary: true,
              commitMessage: true,
              commitDate: true
            },
            orderBy: { commitDate: 'desc' },
            take: 15
          })
        ]);
        return { contributorStats, commitActivity, punchCard, languages, dbCommits };
      } catch (error) {
        console.error("Failed to fetch GitHub stats:", error);
        throw new Error("Analytics data is currently unavailable. Please try again later.");
      }
    }),

  saveAnswer: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        question: z.string(),
        answer: z.string(),
        fileReferences: z.any(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.question.create({
        data: {
          answer: input.answer,
          fileReferences: input.fileReferences,
          projectId: input.projectId,
          question: input.question,
          userId: ctx.user.userId!,
        },
      });
    }),

  getQuestion: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.question.findMany({
        where: {
          projectId: input.projectId,
        },
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),

  saveChat: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        title: z.string(),
        messages: z.any(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.chat.create({
        data: {
          projectId: input.projectId,
          title: input.title,
          messages: input.messages,
          userId: ctx.user.userId!,
        },
      });
    }),

  getChats: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.chat.findMany({
        where: {
          projectId: input.projectId,
          userId: ctx.user.userId!,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),

  uploadMeeting: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        meetingUrl: z.string(),
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const meeting = await ctx.db.meeting.create({
        data: {
          meetingUrl: input.meetingUrl,
          projectId: input.projectId,
          name: input.name,
          status: "PROCESSING",
        },
      });

      return meeting;
    }),

  getMeetings: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.meeting.findMany({
        where: { projectId: input.projectId },
        include: { issues: true },
      });
    }),

  deleteMeetings: protectedProcedure
    .input(z.object({ meetingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.meeting.delete({ where: { id: input.meetingId } });
    }),

  getMeetingById: protectedProcedure
    .input(z.object({ meetingId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.meeting.findUnique({
        where: { id: input.meetingId },
        include: { issues: true },
      });
    }),

  archiveProject: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.project.update({
        where: { id: input.projectId },
        data: { deletedAt: new Date() },
      });
    }),

  getTeamMembers: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.userToProject.findMany({
        where: { projectId: input.projectId },
        include: { user: true },
      });
    }),

  // ─── Billing ────────────────────────────────────────────────────────────────

  getMyCredits: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.user.findUnique({
      where: { id: ctx.user.userId! },
      select: {
        emailAddress: true,
        firstName: true,
        credits: true,
      },
    });
  }),

  getTransactions: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.transaction.findMany({
      where: { userId: ctx.user.userId! },
      orderBy: { createdAt: "desc" },
    });
  }),

  /**
   * Step 1 — called before opening the Razorpay checkout.
   * Creates a Razorpay order and returns the order ID to the client.
   */
  createOrder: protectedProcedure
    .input(
      z.object({
        credits: z.number().int().positive(),
        amount: z.number().int().positive(), // INR, e.g. 499
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const order = await createRazorpayOrder(input.amount, input.credits, ctx.user.userId!);
      return order; // { razorpayOrderId, amount, currency }
    }),

  /**
   * Step 2 — called inside the Razorpay payment handler after success.
   * Verifies the signature, records the transaction, and credits the user.
   */
  verifyPayment: protectedProcedure
    .input(
      z.object({
        credits: z.number().int().positive(),
        razorpayOrderId: z.string(),
        razorpayPaymentId: z.string(),
        razorpaySignature: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await verifyAndCreditUser({
        userId: ctx.user.userId!,
        credits: input.credits,
        razorpayOrderId: input.razorpayOrderId,
        razorpayPaymentId: input.razorpayPaymentId,
        razorpaySignature: input.razorpaySignature,
      });
      return { success: true };
    }),

  getAIProjectSuggestions: protectedProcedure
    .input(z.object({
      projectId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      console.log(`[getAIProjectSuggestions] Procedure started for project: ${input.projectId}`);
      // Import AI model
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      // Fetch latest 7 commits directly on server to avoid 431 Header Size limits
      const dbCommits = await ctx.db.commit.findMany({
        where: { projectId: input.projectId },
        select: {
          summary: true,
          commitMessage: true
        },
        orderBy: { commitDate: 'desc' },
        take: 7
      });

      if (!dbCommits || dbCommits.length === 0) {
        return { progressPoints: [], strategicObservations: [], nextSteps: [] };
      }

      const latestCommits = dbCommits.map((c: any) => c.summary || c.commitMessage).filter(Boolean);
      console.log(`[getAIProjectSuggestions] Fetched ${dbCommits.length} commits. Latest:`, latestCommits);

      if (latestCommits.length === 0) {
        console.log(`[getAIProjectSuggestions] No commits found for project ${input.projectId}. Returning empty.`);
        return { progressPoints: [], strategicObservations: [], nextSteps: [] };
      }

      const systemInstruction = `
        You are GitOSphere Intelligence, a high-performance project strategist. 
        Your role is to analyze a series of 5-7 recent project commit summaries and provide an exhaustive, strategic assessment in JSON format. 
        Your insights must be granular, technical, and actionable, focusing on project trajectory, performance, and immediate objectives.
        
        Respond STRICTLY in JSON format with the following structure:
        {
          "progressPoints": ["Detailed Point 1", "Detailed Point 2", ...],
          "strategicObservations": ["Detailed Observation 1", ...],
          "nextSteps": ["Specific Step 1", "Specific Step 2", ...]
        }
      `;

      const fewShotContext = `
        Example 1:
        Input: ["Fixed memory leak in UI rendering", "Implemented auth middleware", "Refactored database schema for performance", "Added unit tests for user service"]
        Output: {
          "progressPoints": ["Auth architecture is now robust with middleware implementation.", "Performance optimization via DB schema refactor shows focus on scalability.", "Testing coverage is expanding into core service layers."],
          "strategicObservations": ["Transitioning from feature-focused to stabilization and performance phase."],
          "nextSteps": ["Verify auth middleware against edge cases.", "Profile DB queries post-refactor.", "Expand integration tests for the new schema."]
        }

        Example 2:
        Input: ["Fix bug in login", "Revert last commit due to crash", "Fix auth error", "Another bug fix for dash"]
        Output: {
          "progressPoints": ["High volume of regression fixes indicates instability in core auth/dashboard modules.", "Frequent reverts suggest a need for more rigorous pre-commit testing."],
          "strategicObservations": ["Project is currently in a high-churn, low-velocity bug-fixing cycle."],
          "nextSteps": ["Perform a comprehensive audit of the authentication flow.", "Introduce mandatory CI/CD linting and test suites.", "Freeze new features until core stability is restored."]
        }
      `;

      const prompt = `
        ${systemInstruction}

        ${fewShotContext}
        
        Analyze the following LATEST ${latestCommits.length} COMMIT SUMMARIES:
        ${JSON.stringify(latestCommits)}
      `;

      try {
        console.log(`[getAIProjectSuggestions] Calling Gemini model (gemini-1.5-flash-latest) with latest ${latestCommits.length} commits...`);
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash"
        });

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        console.log(`[getAIProjectSuggestions] RAW AI response:`, responseText);

        // Use a more robust extraction for JSON
        const cleanResponse = responseText.trim();
        const jsonBlockMatch = cleanResponse.match(/```json\n?([\s\S]*?)\n?```/) || cleanResponse.match(/\{[\s\S]*\}/);
        const jsonString = jsonBlockMatch ? (jsonBlockMatch[1] || jsonBlockMatch[0]) : cleanResponse;

        try {
          const intelligence = JSON.parse(jsonString.trim().replace(/[\u0000-\u001F\u007F-\u009F]/g, ""));
          console.log(`[getAIProjectSuggestions] Parsed intelligence:`, Object.keys(intelligence));
          return {
            progressPoints: intelligence.progressPoints || [],
            strategicObservations: intelligence.strategicObservations || [],
            nextSteps: intelligence.nextSteps || []
          };
        } catch (e) {
          console.error("AI JSON Parse failed, raw text:", responseText);
          return {
            progressPoints: ["Neural mapping optimized. Evaluating latest 5 commits."],
            strategicObservations: ["Monitoring repository trajectory..."],
            nextSteps: ["Continue iteration", "Review core modules"]
          };
        }
      } catch (error: any) {
        console.error("AI Project Suggestions error:", error);
        return {
          progressPoints: ["Neural link temporarily saturated."],
          strategicObservations: [`Error: ${error?.message || "Internal Engine Interruption"}`],
          nextSteps: ["Verify GEMINI_API_KEY in .env", "Check network reachability"]
        };
      }
    }),

  uploadMeetingReport: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      name: z.string(),
      base64Pdf: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `
         You are a project manager evaluating a meeting report. 
         Analyze the provided PDF meeting report and extract:
         1. Authentic To-Dos per person (Contributor). If people aren't mentioned, use 'Key Stakeholders'.
         2. Strategic next steps for the project.
         3. A rigorous evaluation of the project's current state based on this meeting.

         Respond STRICTLY in JSON:
         {
           "toDos": [{"person": "...", "tasks": ["...", "..."]}],
           "nextSteps": ["...", "..."],
           "evaluation": "..."
         }
       `;

      try {
        const pdfData = input.base64Pdf.includes(',') ? input.base64Pdf.split(',')[1] : input.base64Pdf;
        if (!pdfData) throw new Error("Invalid PDF data provided.");

        const result = await model.generateContent([
          {
            inlineData: {
              data: pdfData,
              mimeType: "application/pdf"
            }
          },
          { text: prompt }
        ]);

        const responseText = result.response.text();
        const cleanResponse = responseText.trim();
        const jsonBlockMatch = cleanResponse.match(/```json\n?([\s\S]*?)\n?```/) || cleanResponse.match(/\{[\s\S]*\}/);
        const jsonString = jsonBlockMatch ? (jsonBlockMatch[1] || jsonBlockMatch[0]) : cleanResponse;

        const intelligence = JSON.parse(jsonString.trim().replace(/[\u0000-\u001F\u007F-\u009F]/g, ""));

        return await ctx.db.meetingReport.create({
          data: {
            projectId: input.projectId,
            name: input.name,
            toDos: intelligence.toDos || [],
            nextSteps: intelligence.nextSteps || ["No specific next steps extracted."],
            evaluation: intelligence.evaluation || "Neutral assessment of meeting content."
          }
        });
      } catch (error: any) {
        console.error("PDF Ingestion error:", error);
        throw new Error(`Failed to process meeting report: ${error?.message || "Internal AI error"}`);
      }
    }),

  getMeetingReports: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.meetingReport.findMany({
        where: { projectId: input.projectId },
        orderBy: { createdAt: 'desc' }
      });
    }),

  retryCommitSummary: protectedProcedure
    .input(z.object({ commitId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const commit = await ctx.db.commit.findUnique({
        where: { id: input.commitId },
        include: { project: true },
      });
      if (!commit) throw new Error("Commit not found");

      // Import summarizeCommit dynamically or from github.ts
      const { retrySummarizeCommit } = await import("@/lib/github");
      const summary = await retrySummarizeCommit(commit.project.githubUrl, commit.commitHash);

      return await ctx.db.commit.update({
        where: { id: input.commitId },
        data: { summary: summary || "" },
      });
    }),
});
