import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import logger from '../middlewares/logger';

/**
 * AI Service for communicating with LLMs (OpenAI, Gemini)
 */

const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

const genAI = process.env.GEMINI_API_KEY
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;

export interface AIResponse {
    text: string;
    usage?: any;
    provider: 'openai' | 'gemini';
}

export const generateText = async (prompt: string, preferredProvider: 'openai' | 'gemini' = 'openai'): Promise<AIResponse> => {
    try {
        // Try OpenAI
        if (preferredProvider === 'openai' && openai) {
            try {
                const completion = await openai.chat.completions.create({
                    messages: [{ role: "user", content: prompt }],
                    model: "gpt-3.5-turbo", // Cost-effective default
                });

                return {
                    text: completion.choices[0].message.content || '',
                    usage: completion.usage,
                    provider: 'openai'
                };
            } catch (error) {
                logger.warn('OpenAI generation failed, falling back if possible', error);
                // Fallback will happen below if Gemini is available
            }
        }

        // Try Gemini (Primary or Fallback)
        if (genAI) {
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-pro" });
                const result = await model.generateContent(prompt);
                const response = result.response;
                const text = response.text();

                return {
                    text,
                    provider: 'gemini'
                };
            } catch (error) {
                logger.error('Gemini generation failed', error);
                if (preferredProvider === 'gemini' && openai) {
                    // Reverse fallback could go here
                }
            }
        }

        // If we get here, neither worked or was configured
        if (preferredProvider === 'openai' && !openai) {
            throw new Error('OpenAI API key not configured');
        } else if (!genAI) {
            throw new Error('No AI providers configured');
        }

        throw new Error('AI generation failed completely');

    } catch (error: any) {
        logger.error('AI Service Error:', error.message);
        throw error;
    }
};

export const analyzeSentiment = async (text: string): Promise<{ score: number, label: string }> => {
    // Placeholder logic for now, real implementation would use specific prompts or models
    const prompt = `Analyze the sentiment of the following text and return a JSON object with "score" (number -1 to 1) and "label" (string: Positive, Negative, Neutral). Text: "${text}"`;

    try {
        const response = await generateText(prompt);
        // Clean markdown code blocks if any
        const cleaned = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
    } catch (error) {
        logger.error('Sentiment analysis failed', error);
        return { score: 0, label: 'Neutral' }; // Fallback
    }
};
