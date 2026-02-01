
import { GoogleGenAI, Type } from "@google/genai";

export class IntelligenceService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  /**
   * Analyzes recent system events and produces structured summaries.
   */
  async analyzeEvents(events: any[]): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze the following system events and provide a concise, factual JSON summary.
        Events: ${JSON.stringify(events.slice(-10))}
        Rules:
        - Output JSON only.
        - Detect patterns.
        - Recommend process adjustments if needed.
        - No greetings. No conversational text.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              patterns: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
              integrityScore: { type: Type.NUMBER }
            }
          }
        }
      });
      return response.text || "{}";
    } catch (error) {
      console.error("Intelligence failure:", error);
      return "{}";
    }
  }
}

export const intelligence = new IntelligenceService();
