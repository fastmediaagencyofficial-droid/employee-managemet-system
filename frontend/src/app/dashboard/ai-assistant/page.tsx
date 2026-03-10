'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Bot, Send, User, Sparkles, FileText, BarChart3, MessageSquare, Upload } from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export default function AIAssistantPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: 'Hello! I\'m your AI HR Assistant. I can help you with leave policies, performance reviews, employee information, and more. How can I assist you today?',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
    const [resumeText, setResumeText] = useState('');
    const [resumeAnalysis, setResumeAnalysis] = useState<any>(null);
    const [reviewText, setReviewText] = useState('');
    const [reviewSummary, setReviewSummary] = useState('');
    const [performancePrediction, setPerformancePrediction] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage: Message = {
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: input,
                    history: messages.slice(-10)
                })
            });

            const data = await response.json();

            if (data.success) {
                const assistantMessage: Message = {
                    role: 'assistant',
                    content: data.data.message,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, assistantMessage]);
            } else {
                toast.error(data.message || 'Failed to get response');
            }
        } catch (error) {
            toast.error('Failed to connect to AI assistant');
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyzeResume = async () => {
        if (!resumeText.trim()) {
            toast.error('Please enter resume text');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/ai/analyze-resume', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ resumeText })
            });

            const data = await response.json();

            if (data.success) {
                setResumeAnalysis(data.data);
                toast.success('Resume analyzed successfully');
            } else {
                toast.error(data.message || 'Failed to analyze resume');
            }
        } catch (error) {
            toast.error('Failed to analyze resume');
        } finally {
            setLoading(false);
        }
    };

    const handleSummarizeReview = async () => {
        if (!reviewText.trim()) {
            toast.error('Please enter review text');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/ai/summarize-review', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    reviewData: {
                        content: reviewText,
                        strengths: 'Extracted from review',
                        improvements: 'Extracted from review'
                    }
                })
            });

            const data = await response.json();

            if (data.success) {
                setReviewSummary(data.data.summary);
                toast.success('Review summarized successfully');
            } else {
                toast.error(data.message || 'Failed to summarize review');
            }
        } catch (error) {
            toast.error('Failed to summarize review');
        } finally {
            setLoading(false);
        }
    };

    const handlePredictPerformance = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/ai/predict-performance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    employeeHistory: {
                        attendance: '95%',
                        pastRatings: [4, 4.5, 4.2],
                        leavePatterns: 'Normal'
                    }
                })
            });

            const data = await response.json();

            if (data.success) {
                setPerformancePrediction(data.data);
                toast.success('Performance predicted successfully');
            } else {
                toast.error(data.message || 'Failed to predict performance');
            }
        } catch (error) {
            toast.error('Failed to predict performance');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const suggestedQuestions = [
        "How do I request time off?",
        "What is the performance review process?",
        "How can I check my attendance record?",
        "Tell me about company leave policies"
    ];

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div>
                <div className="flex items-center gap-2">
                    <Sparkles className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold tracking-tight">AI Assistant</h1>
                    <Badge variant="secondary" className="ml-2">Beta</Badge>
                </div>
                <p className="text-muted-foreground">Get instant answers to your HR questions powered by AI</p>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
                <Card
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => { }}
                >
                    <CardHeader className="pb-3">
                        <MessageSquare className="h-8 w-8 text-blue-500 mb-2" />
                        <CardTitle className="text-base">HR Chatbot</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Ask questions about policies, leave, and more</p>
                    </CardContent>
                </Card>

                <Card
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedFeature('resume')}
                >
                    <CardHeader className="pb-3">
                        <FileText className="h-8 w-8 text-green-500 mb-2" />
                        <CardTitle className="text-base">Resume Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Parse and analyze candidate resumes</p>
                    </CardContent>
                </Card>

                <Card
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => {
                        setSelectedFeature('performance');
                        handlePredictPerformance();
                    }}
                >
                    <CardHeader className="pb-3">
                        <BarChart3 className="h-8 w-8 text-purple-500 mb-2" />
                        <CardTitle className="text-base">Performance Prediction</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">AI-powered performance insights</p>
                    </CardContent>
                </Card>

                <Card
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedFeature('review')}
                >
                    <CardHeader className="pb-3">
                        <Sparkles className="h-8 w-8 text-orange-500 mb-2" />
                        <CardTitle className="text-base">Review Summarization</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Auto-summarize performance reviews</p>
                    </CardContent>
                </Card>
            </div>

            {/* Chat Interface */}
            <Card className="flex-1 flex flex-col">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Bot className="h-5 w-5" />
                        <CardTitle>Chat with AI Assistant</CardTitle>
                    </div>
                    <CardDescription>Ask me anything about HR policies, procedures, or your employment</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-4">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto space-y-4 min-h-[400px] max-h-[500px] border rounded-lg p-4 bg-muted/20">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {message.role === 'assistant' && (
                                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                        <Bot className="h-4 w-4 text-primary-foreground" />
                                    </div>
                                )}
                                <div
                                    className={`rounded-lg p-3 max-w-[80%] ${message.role === 'user'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-card border'
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                    <p className="text-xs opacity-70 mt-1" suppressHydrationWarning>
                                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                {message.role === 'user' && (
                                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                        <User className="h-4 w-4" />
                                    </div>
                                )}
                            </div>
                        ))}
                        {loading && (
                            <div className="flex gap-3">
                                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                    <Bot className="h-4 w-4 text-primary-foreground animate-pulse" />
                                </div>
                                <div className="bg-card border rounded-lg p-3">
                                    <p className="text-sm text-muted-foreground">Thinking...</p>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggested Questions */}
                    {messages.length === 1 && (
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Suggested questions:</p>
                            <div className="flex flex-wrap gap-2">
                                {suggestedQuestions.map((question, index) => (
                                    <Button
                                        key={index}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setInput(question);
                                            setTimeout(() => handleSendMessage(), 100);
                                        }}
                                        className="text-xs"
                                    >
                                        {question}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input */}
                    <div className="flex gap-2">
                        <Textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Type your message... (Press Enter to send)"
                            className="flex-1 min-h-[60px] max-h-[120px]"
                            disabled={loading}
                        />
                        <Button
                            onClick={handleSendMessage}
                            disabled={!input.trim() || loading}
                            size="icon"
                            className="h-[60px] w-[60px]"
                        >
                            <Send className="h-5 w-5" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Resume Analysis Dialog */}
            <Dialog open={selectedFeature === 'resume'} onOpenChange={() => setSelectedFeature(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Resume Analysis</DialogTitle>
                        <DialogDescription>
                            Paste resume text below to extract key information using AI
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="resume">Resume Text</Label>
                            <Textarea
                                id="resume"
                                value={resumeText}
                                onChange={(e) => setResumeText(e.target.value)}
                                placeholder="Paste resume content here..."
                                rows={10}
                            />
                        </div>
                        <Button onClick={handleAnalyzeResume} disabled={loading}>
                            {loading ? 'Analyzing...' : 'Analyze Resume'}
                        </Button>

                        {resumeAnalysis && (
                            <div className="mt-4 space-y-3 p-4 border rounded-lg bg-muted/50">
                                <h3 className="font-semibold">Analysis Results:</h3>
                                <div>
                                    <p className="text-sm font-medium">Skills:</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {resumeAnalysis.skills?.map((skill: string, i: number) => (
                                            <Badge key={i} variant="secondary">{skill}</Badge>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Experience: {resumeAnalysis.experience} years</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Education: {resumeAnalysis.education}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Recommended Role: {resumeAnalysis.recommendedRole}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Performance Prediction Dialog */}
            <Dialog open={selectedFeature === 'performance'} onOpenChange={() => setSelectedFeature(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Performance Prediction</DialogTitle>
                        <DialogDescription>
                            AI-powered analysis of employee performance trends
                        </DialogDescription>
                    </DialogHeader>
                    {loading ? (
                        <div className="text-center py-8">Analyzing performance data...</div>
                    ) : performancePrediction ? (
                        <div className="space-y-4">
                            <div className="p-4 border rounded-lg">
                                <p className="font-medium mb-2">Burnout Risk</p>
                                <Badge variant={
                                    performancePrediction.burnoutRisk === 'Low' ? 'default' :
                                        performancePrediction.burnoutRisk === 'Medium' ? 'secondary' : 'destructive'
                                }>
                                    {performancePrediction.burnoutRisk || 'Medium'}
                                </Badge>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <p className="font-medium mb-2">Predicted Rating</p>
                                <p className="text-2xl font-bold">{performancePrediction.predictedRating || '4.2'} / 5</p>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <p className="font-medium mb-2">Retention Risk</p>
                                <Badge variant={
                                    performancePrediction.retentionRisk === 'Low' ? 'default' : 'secondary'
                                }>
                                    {performancePrediction.retentionRisk || 'Low'}
                                </Badge>
                            </div>
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>

            {/* Review Summarization Dialog */}
            <Dialog open={selectedFeature === 'review'} onOpenChange={() => setSelectedFeature(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Review Summarization</DialogTitle>
                        <DialogDescription>
                            AI-powered summary of performance reviews
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="review">Performance Review Text</Label>
                            <Textarea
                                id="review"
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                placeholder="Paste performance review content here..."
                                rows={8}
                            />
                        </div>
                        <Button onClick={handleSummarizeReview} disabled={loading}>
                            {loading ? 'Summarizing...' : 'Summarize Review'}
                        </Button>

                        {reviewSummary && (
                            <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                                <h3 className="font-semibold mb-2">Summary:</h3>
                                <p className="text-sm">{reviewSummary}</p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
