import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import logger from '../middlewares/logger';
// ...existing imports
import { generateText, analyzeSentiment } from '../services/aiService';

/**
 * Generate generic AI insights
 */
export const getInsights = async (req: AuthRequest, res: Response) => {
    try {
        const { prompt, context } = req.body;

        if (!prompt) {
            return res.status(400).json({
                success: false,
                message: 'Prompt is required'
            });
        }

        const fullPrompt = `Context: ${JSON.stringify(context || {})}\n\nTask: ${prompt}`;

        const result = await generateText(fullPrompt);

        res.json({
            success: true,
            data: result
        });

    } catch (error: any) {
        logger.error('Get insights error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to generate insights'
        });
    }
};

/**
 * HR Chatbot
 */
export const chat = async (req: AuthRequest, res: Response) => {
    try {
        const { message, history } = req.body;

        // Construct system prompt for HR context
        const systemPrompt = `You are a helpful HR Assistant for the Employee Management System.
        Answer queries about leave policies, performance reviews, and general HR tasks.
        Be professional, concise, and friendly.
        Previous conversation: ${JSON.stringify(history || [])}
        User: ${message}`;

        const result = await generateText(systemPrompt);

        res.json({
            success: true,
            data: { message: result.text }
        });
    } catch (error: any) {
        logger.error('Chat error:', error);
        res.status(500).json({ success: false, message: 'Chat failed' });
    }
};

/**
 * Parse and Analyze Resume
 */
export const analyzeResume = async (req: AuthRequest, res: Response) => {
    try {
        const { resumeText } = req.body; // In real app, this might start as file upload

        const prompt = `Analyze this resume text and extract:
        1. Key Skills (array)
        2. Years of Experience (number)
        3. Education Level (string)
        4. Recommended Role (string)
        
        Resume Text: "${resumeText.substring(0, 3000)}" 
        
        Return ONLY a JSON object.`;

        const result = await generateText(prompt);
        // Clean markdown
        const cleaned = result.text.replace(/```json/g, '').replace(/```/g, '').trim();

        res.json({
            success: true,
            data: JSON.parse(cleaned)
        });
    } catch (error: any) {
        logger.error('Resume analysis error:', error);
        res.status(500).json({ success: false, message: 'Resume analysis failed' });
    }
};

/**
 * Summarize Performance Review
 */
export const summarizeReview = async (req: AuthRequest, res: Response) => {
    try {
        const { reviewData } = req.body;

        const prompt = `Summarize this employee performance review into a 3-sentence executive summary.
        Highlight key strengths and one area for improvement.
        
        Review: ${JSON.stringify(reviewData)}`;

        const result = await generateText(prompt);

        res.json({
            success: true,
            data: { summary: result.text }
        });
    } catch (error: any) {
        logger.error('Review summary error:', error);
        res.status(500).json({ success: false, message: 'Summarization failed' });
    }
};

/**
 * Predict Performance & Burnout Risk
 */
export const predictPerformance = async (req: AuthRequest, res: Response) => {
    try {
        const { employeeHistory } = req.body; // Attendance, past ratings, leave patterns

        const prompt = `Analyze this employee data to predict:
        1. Burnout Risk (Low/Medium/High) - check for late hours, no leave
        2. Next Review Rating Prediction (1-5)
        3. Retention Risk (Low/Medium/High)
        
        Data: ${JSON.stringify(employeeHistory)}
        
        Return ONLY a JSON object.`;

        const result = await generateText(prompt);
        const cleaned = result.text.replace(/```json/g, '').replace(/```/g, '').trim();

        res.json({
            success: true,
            data: JSON.parse(cleaned)
        });
    } catch (error: any) {
        logger.error('Performance prediction error:', error);
        res.status(500).json({ success: false, message: 'Prediction failed' });
    }
};
