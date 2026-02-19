import { processMeeting } from "@/lib/assembly";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
const bodyParser = z.object({
  meetingUrl: z.string(),
  projectId: z.string(),
  meetingId: z.string(),
});

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { meetingUrl, meetingId } = bodyParser.parse(body);
    const { summaries, headline, summary } = await processMeeting(meetingUrl);
    await db.issue.createMany({
      data: summaries.map((sum: any) => ({
        start: sum.start,
        end: sum.end,
        text: sum.text,
        headline: headline,
        summary: summary,
        meetingId,
      })),
    });
    await db.meeting.update({
      where: { id: meetingId },
      data: {
        status: "COMPLETED",
        name: headline,
      },
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { error: "Internal Server Error " },
      { status: 500 },
    );
  }
}
