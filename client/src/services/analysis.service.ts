import api from '@/lib/api';

export interface AnalysisResult {
	id: string;
	userId: string;
	startDate: string;
	endDate: string;
	summary: string;
	triggerPatterns: {
		emotional_pattern: string | null;
	};
	recommendations: string[];
	riskLevel: string;
	generatedAt: string;
}

export const analysisService = {
	async generateAnalysis(date: string): Promise<AnalysisResult> {
		const response = await api.post<AnalysisResult>('/analysis/generate', { date });
		return response.data;
	},

	async getHistory(): Promise<AnalysisResult[]> {
		const response = await api.get<AnalysisResult[]>('/analysis/history');
		return response.data;
	},
};
