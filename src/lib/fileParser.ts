// Robust resume file parser supporting PDF, DOCX, and plain text.
import * as pdfjsLib from "pdfjs-dist";
// Vite worker import
// @ts-ignore
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import mammoth from "mammoth";

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = pdfWorker;

async function parsePdf(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const pdf = await (pdfjsLib as any).getDocument({ data: buf }).promise;
  let out = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((it: any) => ("str" in it ? it.str : "")).filter(Boolean);
    out += strings.join(" ") + "\n";
  }
  return out;
}

async function parseDocx(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const res = await mammoth.extractRawText({ arrayBuffer: buf });
  return res.value || "";
}

export async function extractResumeText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  try {
    if (name.endsWith(".pdf")) return await parsePdf(file);
    if (name.endsWith(".docx")) return await parseDocx(file);
    return await file.text();
  } catch (e) {
    console.error("Resume parse failed", e);
    try { return await file.text(); } catch { return ""; }
  }
}
