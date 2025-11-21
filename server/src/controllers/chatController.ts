
import { Request, Response } from 'express';
import { generateResponse } from '../services/gemini';

export const chat = async (req: Request, res: Response) => {
  const { history, message, language } = (req as any).body;

  try {
    const responseText = await generateResponse(history || [], message, language || 'en');
    (res as any).json({ text: responseText });
  } catch (err) {
    console.error(err);
    (res as any).status(500).json({ error: 'AI Service unavailable' });
  }
};
