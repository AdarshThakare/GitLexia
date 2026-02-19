import { AssemblyAI } from "assemblyai";
import axios from "axios";
import dotenv from "dotenv";
import { generateMeetingSummary } from "./gemini";
dotenv.config();

const client = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY! });

function parseGeminiJson(raw: string) {
  const cleaned = raw
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleaned);
}

function msToTime(ms: number) {
  const seconds = ms / 1000;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, "0")} : ${remainingSeconds.toString().padStart(2, `0`)}`;
}

export const processMeeting = async (MeetingUrl: string) => {
  console.log("🚀 Creating transcript...");

  const transcript = await client.transcripts.create({
    audio_url: MeetingUrl,
    speech_models: ["universal-3-pro", "universal-2"],
  });

  console.log("Transcript ID:", transcript.id);

  let status = transcript.status;

  while (status !== "completed" && status !== "error") {
    await new Promise((res) => setTimeout(res, 3000));

    const polling = await client.transcripts.get(transcript.id);
    status = polling.status;

    console.log("Current status:", status);
  }

  if (status === "error") {
    throw new Error("Transcription failed");
  }

  console.log("✅ Transcript completed");

  const response = await axios.get(
    `https://api.assemblyai.com/v2/transcript/${transcript.id}/paragraphs`,
    {
      headers: {
        Authorization: process.env.ASSEMBLYAI_API_KEY,
      },
    },
  );

  const summaries = response.data.paragraphs?.map((para: any) => ({
    start: msToTime(para.start),
    end: msToTime(para.end),
    text: para.text,
  }));

  const fullText = summaries.map((summary: any) => summary.text).join(" ");
  const aiSummary = await generateMeetingSummary(fullText);

  const parsed = parseGeminiJson(aiSummary);

  console.log(parsed.headline);
  console.log(parsed.summary);

  const summaryArray = parsed.summary
    .split(/\n\s*\n/) // split on empty lines
    .map((s: any) => s.trim()) // clean whitespace
    .filter(Boolean); // remove empty strings

  return {
    summaries,
    summary: summaryArray,
    headline: parsed.headline,
  };
};

// const FILE_URL = "https://assembly.ai/sports_injuries.mp3";
// (async () => {
//   try {
//     const response = await processMeeting(FILE_URL);
//     console.log("✅ Final Output:");
//     console.log(response);
//   } catch (err) {
//     console.error("❌ Script failed:", err);
//   }
// })();
