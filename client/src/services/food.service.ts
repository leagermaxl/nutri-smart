import api from '@/lib/api';

export interface FoodLog {
	id: string;
	userId: string;
	foodName: string;
	calories: number;
	servingSize: number;
	protein: number;
	fatTotal: number;
	fatSaturated: number;
	carbohydratesTotal: number;
	fiber: number;
	sugar: number;
	sodium: number;
	potassium: number;
	cholesterol: number;
	emotionalState: string;
	eatingContext: string;
	mealGroupId?: string;
	loggedAt: string;
}

export enum EmotionalState {
	STRESS = 'STRESS',
	BOREDOM = 'BOREDOM',
	HAPPINESS = 'HAPPINESS',
	SADNESS = 'SADNESS',
	NEUTRAL = 'NEUTRAL',
}

export enum EatingContext {
	HOME = 'HOME',
	WORK = 'WORK',
	SOCIAL = 'SOCIAL',
	RESTAURANT = 'RESTAURANT',
}

export interface AnalysisResult {
	id: string;
	userId: string;
	startDate: string;
	endDate: string;
	summary: string;
	triggerPatterns: {
		emotional_pattern?: string;
		// [key: string]: any;
	};
	recommendations: string[];
	riskLevel: string;
	generatedAt: string;
}

export const foodService = {
	async getDailyLogs(): Promise<FoodLog[]> {
		// Backend endpoint is /food-logs/today and uses session user.
		// It currently ignores the date param and returns today's logs.
		const response = await api.get<FoodLog[]>('/food-logs/today');
		return response.data;
	},

	async getLogsByDate(date: string): Promise<FoodLog[]> {
		// New endpoint that accepts a date parameter in YYYY-MM-DD format
		const response = await api.get<FoodLog[]>(`/food-logs?date=${date}`);
		return response.data;
	},

	async addFoodLog(data: {
		foodItem: string;
		calories?: number;
		mood?: string;
		context?: string;
	}): Promise<unknown> {
		const payload = {
			query: data.foodItem,
			emotionalState: data.mood ? data.mood.toUpperCase() : 'NEUTRAL',
			eatingContext: data.context ? data.context.toUpperCase() : 'HOME',
		};
		const response = await api.post('/nutrition/log-meal', payload);
		return response.data;
	},

	async generateAnalysis(date: Date): Promise<AnalysisResult> {
		const response = await api.post<AnalysisResult>('/analysis/generate', {
			date,
		});
		return response.data;
	},

	async getFoodSuggestions() {
		const response = await api.get('/recommendations/food-suggestions');
		return response.data;
	},
};
