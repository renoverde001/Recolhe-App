import { GoogleGenAI } from "@google/genai";

// Fix: Initialize with process.env.API_KEY as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateResponse = async (history: any[], message: string, language: string) => {
  const langName = language === 'pt' ? 'Portuguese (Guinea-Bissau context)' : language === 'fr' ? 'French' : 'English';

  const systemInstruction = `
    You are the Recolhe+ Assistant, powered by Renoverde, for a smart waste collection platform in Guinea-Bissau.
    Your goal is to help users recycle, schedule pickups, and understand their impact.
    User location: Bissau. Currency: XOF (CFA Franc).
    EcoCoin Rate: 1 Coin = 10 XOF.
    
    Current Language: ${langName}.
    Always respond in ${langName}.
    Keep responses concise and friendly.
  `;

  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction,
    },
    history: history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    })),
  });

  const result = await chat.sendMessage({ message });
  return result.text;
};