import fs from "fs";
import path from "path";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const DATA_DIR = "data";

interface Segment {
  id: number;
  start: number;
  end: number;
  text: string;
}

interface Transcription {
  text?: string;
  segments: Segment[];
}

async function main() {
  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".mp3"));
  for (const file of files) {
    await transcribeMp3(file);
  }
}

async function transcribeMp3(filename: string) {
  const baseName = path.basename(filename, ".mp3");
  const jsonPath = path.join(DATA_DIR, `${baseName}.json`);
  const srtPath = path.join(DATA_DIR, `${baseName}.srt`);
  const txtPath = path.join(DATA_DIR, `${baseName}.txt`);

  const transcription = fs.existsSync(jsonPath)
    ? loadTranscription(jsonPath)
    : await transcribe(filename, jsonPath);

  saveOutputs(transcription, srtPath, txtPath);
}

function loadTranscription(jsonPath: string): Transcription {
  console.log(`Loading existing: ${jsonPath}`);
  return JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as Transcription;
}

async function transcribe(filename: string, jsonPath: string): Promise<Transcription> {
  console.log(`Transcribing: ${filename}`);
  const filePath = path.join(DATA_DIR, filename);
  const result = (await groq.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: "whisper-large-v3-turbo",
    response_format: "verbose_json",
    timestamp_granularities: ["segment"],
  })) as unknown as Transcription;

  fs.writeFileSync(jsonPath, JSON.stringify(result));
  console.log(`Saved: ${jsonPath}`);
  return result;
}

function saveOutputs(transcription: Transcription, srtPath: string, txtPath: string) {
  const srtContent = generateSrt(transcription.segments);
  fs.writeFileSync(srtPath, srtContent);
  console.log(`Saved: ${srtPath}`);

  if (transcription.text) {
    fs.writeFileSync(txtPath, transcription.text.trim());
    console.log(`Saved: ${txtPath}`);
  }
}

function generateSrt(segments: Segment[]): string {
  return segments
    .map(
      (seg) =>
        `${seg.id}\n${formatSrtTime(seg.start)} --> ${formatSrtTime(seg.end)}\n${seg.text.trim()}\n`,
    )
    .join("\n");
}

function formatSrtTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
}

main();
