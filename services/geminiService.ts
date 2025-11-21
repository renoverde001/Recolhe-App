import { GoogleGenAI } from "@google/genai";
import { Language } from '../types';
import { aiChat } from './api';

// Initialize Client SDK (Fallback only)
// In production, this key should be hidden or restricted.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

export const generateChatResponse = async (
  history: { role: 'user' | 'model'; text: string }[],
  newMessage: string,
  language: Language = 'en'
): Promise<string> => {
  
  try {
    // 1. Try Backend API First (Secure)
    console.log("Attempting to use Backend Chat API...");
    const response = await aiChat.sendMessage(history, newMessage, language);
    return response;
  } catch (apiError) {
    console.warn("Backend Chat API unreachable, falling back to Client SDK...", apiError);

    // 2. Fallback to Client SDK
    const langName = language === 'pt' ? 'Portuguese' : language === 'fr' ? 'French' : 'English';
    const SYSTEM_INSTRUCTION = `
You are the Recolhe+ Assistant, a helpful and friendly AI for a waste collection and recycling platform.
Your goal is to help users identify recyclable materials, schedule pickups, and understand their environmental impact.
You must respond in ${langName}.
Keep responses concise, encouraging, and formatted nicely.
If a user asks about EcoCoins, explain that they earn 10 coins per kg of recycled material.
`;

    try {
      const chat = ai.chats.create({
        model: MODEL_NAME,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
        history: history.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.text }],
        })),
      });

      const result = await chat.sendMessage({ message: newMessage });
      return result.text || "I'm sorry, I couldn't generate a response at this time.";
    } catch (clientError) {
      console.error("Gemini Client SDK Error:", clientError);
      return "I'm having trouble connecting to the recycling knowledge base right now. Please try again later.";
    }
  }
};

export const analyzeWasteFromDescription = async (description: string): Promise<string> => {
    // For simple tasks, we might still use client SDK or add a backend endpoint later.
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `Analyze this waste description: "${description}". Categorize it (Plastic, Glass, Paper, Metal, Organic, E-waste) and estimate a rough weight if possible. Return a short JSON summary.`,
        });
        return response.text || "Could not analyze.";
    } catch (e) {
        return "Analysis failed.";
    }
}