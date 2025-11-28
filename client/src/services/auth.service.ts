import { User } from '@/context/auth-context';
import api from '@/lib/api';

// Enum types matching the backend
export enum Gender {
	MALE = 'MALE',
	FEMALE = 'FEMALE',
	OTHER = 'OTHER',
	PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
}

export enum ActivityLevel {
	SEDENTARY = 'SEDENTARY',
	LIGHTLY_ACTIVE = 'LIGHTLY_ACTIVE',
	MODERATELY_ACTIVE = 'MODERATELY_ACTIVE',
	VERY_ACTIVE = 'VERY_ACTIVE',
	EXTRA_ACTIVE = 'EXTRA_ACTIVE',
}

export enum PrimaryGoal {
	WEIGHT_LOSS = 'WEIGHT_LOSS',
	MUSCLE_GAIN = 'MUSCLE_GAIN',
	MAINTENANCE = 'MAINTENANCE',
	IMPROVED_HEALTH = 'IMPROVED_HEALTH',
	ATHLETIC_PERFORMANCE = 'ATHLETIC_PERFORMANCE',
}

export interface LoginDto {
	email: string;
	password: string;
}

export interface RegisterDto {
	email: string;
	password: string;
	firstName?: string;
	lastName?: string;
	age?: number;
	weight?: number;
	height?: number;
	gender?: Gender;
	activityLevel?: ActivityLevel;
	primaryGoal?: PrimaryGoal;
	dietaryRestrictions?: string;
}

export interface AuthResponse {
	message: string;
}

export const authService = {
	async login(data: LoginDto): Promise<AuthResponse> {
		const response = await api.post<AuthResponse>('/auth/login', data);
		return response.data;
	},

	async register(data: {
		email: string;
		password: string;
		age?: number;
		weight?: number;
		height?: number;
		gender?: Gender;
		activityLevel?: ActivityLevel;
		primaryGoal?: PrimaryGoal;
	}): Promise<AuthResponse> {
		const response = await api.post('/auth/register', data);
		return response.data;
	},

	async logout(): Promise<void> {
		// If backend has a logout endpoint, call it here.
		// For now, we might just need to clear client state, but usually we want to clear the cookie.
		// Since the cookie is HttpOnly, we can't clear it from JS. We need an endpoint.
		// If no endpoint exists, we can't strictly "logout" on the server side without it.
		// Let's assume for now we just clear client state, but ideally we add a logout endpoint later.
		// Or we can try to expire the cookie by setting it with a past date if it wasn't HttpOnly, but it is.
		// We will implement a simple client-side logout for now.
	},

	async getProfile(): Promise<User> {
		const response = await api.get<User>('/user/me');
		return response.data;
	},

	async updateProfile(data: Partial<RegisterDto>): Promise<User> {
		const response = await api.patch<User>('/user/me', data);
		return response.data;
	},
};
