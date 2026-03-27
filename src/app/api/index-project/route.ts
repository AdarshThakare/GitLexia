import { NextResponse } from "next/server";
import { indexGithubRepo } from "@/lib/github-loader";
import { db } from "@/server/db";

export async function POST(req: Request) {
  try {
    const { projectId, githubToken } = await req.json();

    if (!projectId) {
      return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
    }

    const project = await db.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Fire and forget: We don't await this because serverless functions often time out 
    // waiting for long ops, but Next.js will keep processing in the background 
    // (if configured/self-hosted or using edge functions/Cloudflare etc)
    (async () => {
      try {
        console.log(`Starting background indexing for project: ${project.name}`);
        await indexGithubRepo(project.id, project.githubUrl, githubToken);
        
        // Mark as indexed
        await db.project.update({
          where: { id: project.id },
          data: { isIndexed: true },
        });
        console.log(`Background indexing complete for project: ${project.name}`);
      } catch (err) {
        console.error(`Error in background indexing for ${project.name}:`, err);
      }
    })();

    // Acknowledge immediately
    return NextResponse.json({ message: "Indexing started in the background" });
  } catch (error) {
    console.error("Index project API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
