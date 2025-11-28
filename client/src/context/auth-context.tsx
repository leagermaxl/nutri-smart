'use client';

import { authService, LoginDto, RegisterDto } from '@/services/auth.service';
import { createContext, useContext, useEffect, useState } from 'react';

// User interface matching the backend response from /user/me
export interface User {
	id: string;
	email: string;
	firstName?: string;
	lastName?: string;
	age?: number;
	weight?: number;
	height?: number;
	gender?: string;
	activityLevel?: string;
	primaryGoal?: string;
	dietaryRestrictions?: string;
	recommendedCalories?: number;
	createdAt: string;
	updatedAt: string;
}

interface AuthContextType {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	login: (data: LoginDto) => Promise<void>;
	register: (data: RegisterDto) => Promise<void>;
	logout: () => Promise<void>;
	checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	const checkAuth = async () => {
		try {
			const userData = await authService.getProfile();
			setUser(userData);
			setIsAuthenticated(true);
		} catch {
			// Not authenticated
			setUser(null);
			setIsAuthenticated(false);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		checkAuth();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const login = async (data: LoginDto) => {
		await authService.login(data);
		await checkAuth();
	};

	const register = async (data: RegisterDto) => {
		await authService.register(data);
		await checkAuth();
	};

	const logout = async () => {
		await authService.logout();
		setUser(null);
		setIsAuthenticated(false);
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				isAuthenticated,
				isLoading,
				login,
				register,
				logout,
				checkAuth,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
}
