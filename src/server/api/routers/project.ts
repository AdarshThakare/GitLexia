import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { pollCommits } from "@/lib/github";
import { indexGithubRepo } from "@/lib/github-loader";
import { esClient } from "@/lib/elastic-search";
import { createRazorpayOrder, verifyAndCreditUser } from "@/lib/razorpay";

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
      await indexGithubRepo(project.id, input.githubUrl, input.githubToken);
      await pollCommits(project.id);
      return project;
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
      pollCommits(input.projectId).then().catch(console.error);
      return await ctx.db.commit.findMany({
        where: { projectId: input.projectId },
      });
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

  search: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        query: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!input.query.trim()) return [];

      const result = await esClient.search({
        index: "global_search",
        size: 10,
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query: input.query,
                  fields: ["title^3", "content", "author"],
                  fuzziness: "AUTO",
                },
              },
            ],
            filter: [{ term: { projectId: input.projectId } }],
          },
        },
        highlight: {
          fields: {
            title: {},
            content: {},
          },
        },
        sort: [{ createdAt: "desc" }],
      });

      return result.hits.hits.map((hit: any) => ({
        id: hit._id,
        ...hit._source,
        highlight: hit.highlight || null,
      }));
    }),

  // ─── Billing ────────────────────────────────────────────────────────────────

  getMyCredits: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.user.findUnique({
      where: { id: ctx.user.userId! },
      select: {
        emailAddress: true,
        firstName: true,
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
    .mutation(async ({ input }) => {
      const order = await createRazorpayOrder(input.amount, input.credits);
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
});
