import { GoogleGenAI, Type, SchemaType } from "@google/genai";
import { AnalysisResult } from "../types";

const processFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      let encoded = reader.result as string;
      // Remove data:application/pdf;base64, prefix
      encoded = encoded.split(',')[1];
      resolve(encoded);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const analyzeThesis = async (file: File): Promise<AnalysisResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key tidak dijumpai.");

  const ai = new GoogleGenAI({ apiKey });
  const base64Data = await processFileToBase64(file);

  const systemInstruction = `
    Anda adalah Pakar Penilai Tesis Akademik yang tegas untuk universiti di Malaysia.
    Tugas anda adalah membaca tesis PDF yang diberikan dan melakukan perkara berikut:
    
    1.  **Semakan Ejaan & Tatabahasa**: Cari kesalahan ejaan Bahasa Melayu dan tatabahasa.
    2.  **Format APA 7**: Semak jika gaya penulisan, sitasi, dan rujukan mengikut format APA Edisi ke-7.
    3.  **Analisis Data**: Semak penerangan data (graf, jadual, statistik). Adakah interpretasi data logik dan tepat?
    
    Output anda MESTI dalam format JSON yang ketat mengikut skema yang diberikan.
    
    PENTING:
    - "criticalComment" mestilah satu perenggan yang tegas, berwarna merah (dalam konteks UI), dan merumuskan kesalahan utama tesis ini.
    - "correctedFullText" mestilah teks penuh (atau bahagian utama yang dianalisis) yang telah DIBETULKAN sepenuhnya menjadi versi yang sempurna.
  `;

  // We define a strict schema to ensure the UI can render the results perfectly.
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      overallGrade: { type: Type.STRING, description: "Gred anggaran (contoh: A-, B+, C)" },
      criticalComment: { type: Type.STRING, description: "Komen kritikal utama yang akan dipaparkan dengan warna merah di muka depan." },
      corrections: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ["EJAAN", "APA7", "DATA", "LAIN-LAIN"] },
            originalText: { type: Type.STRING, description: "Teks asal yang salah (pendek)" },
            suggestion: { type: Type.STRING, description: "Cadangan pembetulan" },
            explanation: { type: Type.STRING, description: "Kenapa ia salah" },
            pageReference: { type: Type.NUMBER, description: "Anggaran nombor muka surat jika ada" }
          },
          required: ["type", "originalText", "suggestion", "explanation"]
        }
      },
      correctedFullText: { type: Type.STRING, description: "Versi teks penuh tesis yang telah dibetulkan sepenuhnya." }
    },
    required: ["overallGrade", "criticalComment", "corrections", "correctedFullText"]
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", // Using Pro model for better reasoning on large documents
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type, // 'application/pdf'
              data: base64Data
            }
          },
          {
            text: "Sila analisa tesis ini. Fokus kepada kesalahan Ejaan Bahasa Melayu, Format APA 7, dan Kesalahan Penerangan Data."
          }
        ]
      },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        thinkingConfig: { thinkingBudget: 4096 } // Give it some budget to think about complex APA rules
      }
    });

    const textResponse = response.text;
    if (!textResponse) throw new Error("Tiada respon dari AI.");
    
    return JSON.parse(textResponse) as AnalysisResult;

  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};
