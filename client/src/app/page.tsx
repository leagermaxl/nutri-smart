'use client';

import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import {
	AnalysisResult,
	EatingContext,
	EmotionalState,
	FoodLog,
	foodService,
} from '@/services/food.service';
import {
	Brain,
	ChevronDown,
	ChevronRight,
	Clock,
	Loader2,
	Plus,
	Sparkles,
	Utensils,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Meal {
	id: string;
	items: FoodLog[];
	totalCalories: number;
	totalProtein: number;
	totalCarbs: number;
	totalFat: number;
	loggedAt: string;
	emotionalState: string;
	eatingContext: string;
}

function MealRow({ meal }: { meal: Meal }) {
	const [isExpanded, setIsExpanded] = useState(false);

	return (
		<>
			<TableRow
				className='cursor-pointer hover:bg-slate-50'
				onClick={() => setIsExpanded(!isExpanded)}
			>
				<TableCell className='font-medium'>
					<div className='flex items-center gap-2'>
						{isExpanded ? (
							<ChevronDown className='h-4 w-4 text-slate-500' />
						) : (
							<ChevronRight className='h-4 w-4 text-slate-500' />
						)}
						{meal.items.map((item: FoodLog) => item.foodName).join(', ')}
					</div>
				</TableCell>
				<TableCell>{Math.round(meal.totalCalories)}</TableCell>
				<TableCell>{Math.round(meal.totalProtein)}g</TableCell>
				<TableCell>{Math.round(meal.totalCarbs)}g</TableCell>
				<TableCell>{Math.round(meal.totalFat)}g</TableCell>
				<TableCell>
					{meal.emotionalState ? (
						<Badge
							variant='outline'
							className={`
								${
									meal.emotionalState === 'HAPPINESS'
										? 'border-emerald-200 text-emerald-700 bg-emerald-50'
										: meal.emotionalState === 'STRESS' || meal.emotionalState === 'SADNESS'
										? 'border-rose-200 text-rose-700 bg-rose-50'
										: 'border-slate-200 text-slate-700 bg-slate-50'
								}
							`}
						>
							{meal.emotionalState}
						</Badge>
					) : (
						'-'
					)}
				</TableCell>
				<TableCell>
					{meal.eatingContext ? <Badge variant='secondary'>{meal.eatingContext}</Badge> : '-'}
				</TableCell>
				<TableCell className='text-right'>
					{new Date(meal.loggedAt).toLocaleTimeString([], {
						hour: '2-digit',
						minute: '2-digit',
					})}
				</TableCell>
			</TableRow>
			{isExpanded &&
				meal.items.map((item: FoodLog) => (
					<TableRow key={item.id} className='bg-slate-50/50'>
						<TableCell className='pl-10 text-sm text-slate-600'>{item.foodName}</TableCell>
						<TableCell className='text-sm text-slate-600'>{item.calories}</TableCell>
						<TableCell className='text-sm text-slate-600'>{item.protein}g</TableCell>
						<TableCell className='text-sm text-slate-600'>{item.carbohydratesTotal}g</TableCell>
						<TableCell className='text-sm text-slate-600'>{item.fatTotal}g</TableCell>
						<TableCell colSpan={3} />
					</TableRow>
				))}
		</>
	);
}

export default function DashboardPage() {
	const { toast } = useToast();

	const { isAuthenticated, isLoading: authLoading, user } = useAuth();
	const router = useRouter();
	const [logs, setLogs] = useState<FoodLog[]>([]);
	const [loading, setLoading] = useState(true);
	const [addFoodLoading, setAddFoodLoading] = useState(false);
	const [analysisLoading, setAnalysisLoading] = useState(false);
	const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
	const [suggestionsLoading, setSuggestionsLoading] = useState(false);
	const [suggestions, setSuggestions] = useState<any>(null);

	// Form State
	const [foodInput, setFoodInput] = useState('');
	const [emotionInput, setEmotionInput] = useState('');
	const [contextInput, setContextInput] = useState('');

	const displayName =
		user?.firstName && user?.lastName
			? `${user.firstName} ${user.lastName}`
			: user?.firstName || user?.email?.split('@')[0] || 'User';

	useEffect(() => {
		if (!authLoading && !isAuthenticated) {
			router.push('/login');
		}
	}, [isAuthenticated, authLoading, router]);

	useEffect(() => {
		if (!isAuthenticated) return;

		const fetchLogs = async () => {
			try {
				const data = await foodService.getDailyLogs();
				setLogs(data);
			} catch (error) {
				console.error('Failed to fetch logs', error);
				toast({
					title: 'Error',
					description: 'Failed to load daily logs. Is the backend running?',
					variant: 'destructive',
				});
			} finally {
				setLoading(false);
			}
		};

		fetchLogs();
	}, [toast, isAuthenticated]);

	if (authLoading || !isAuthenticated) {
		return null; // Or a loading spinner
	}

	const handleAddFood = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!foodInput) return;

		setAddFoodLoading(true);
		try {
			await foodService.addFoodLog({
				foodItem: foodInput,
				mood: emotionInput || EmotionalState.NEUTRAL,
				context: contextInput || EatingContext.HOME,
			});
			toast({
				title: 'Success',
				description: 'Food logged successfully!',
			});
			setFoodInput('');
			setEmotionInput('');
			setContextInput('');
			// Refresh logs
			const data = await foodService.getDailyLogs();
			setLogs(data);
			// await fetchFoodSuggestions();
		} catch (error) {
			console.error('Failed to add food', error);
			toast({
				title: 'Error',
				description: 'Failed to log food.',
				variant: 'destructive',
			});
		} finally {
			setAddFoodLoading(false);
		}
	};

	const fetchFoodSuggestions = async () => {
		setSuggestionsLoading(true);
		try {
			const data = await foodService.getFoodSuggestions();
			setSuggestions(data);
		} catch (error) {
			console.error('Failed to fetch food suggestions', error);
		} finally {
			setSuggestionsLoading(false);
		}
	};

	const handleGenerateAnalysis = async () => {
		setAnalysisLoading(true);
		try {
			const today = new Date().toISOString().split('T')[0];
			const result = await foodService.generateAnalysis(new Date(today));
			setAnalysis(result);
			toast({
				title: 'Analysis Ready',
				description: 'Your behavioral analysis has been generated.',
			});
		} catch (error) {
			console.error('Failed to generate analysis', error);
			toast({
				title: 'Error',
				description: 'Failed to generate analysis.',
				variant: 'destructive',
			});
		} finally {
			setAnalysisLoading(false);
		}
	};

	// Calculations
	const totalCalories = logs.reduce((sum, log) => sum + (log.calories || 0), 0);
	const calorieGoal = user?.recommendedCalories || 2000;
	const caloriePercentage = Math.min((totalCalories / calorieGoal) * 100, 100);

	// Mood Stability Calculation
	const calculateMoodStability = () => {
		if (logs.length === 0) {
			return {
				status: 'No Data',
				risk: 'UNKNOWN',
				description: 'Log meals to track',
			};
		}

		const emotionCounts = logs.reduce((acc, log) => {
			const emotion = log.emotionalState;
			acc[emotion] = (acc[emotion] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		// Count negative emotions (stress, sadness, boredom)
		const negativeCount =
			(emotionCounts['STRESS'] || 0) +
			(emotionCounts['SADNESS'] || 0) +
			(emotionCounts['BOREDOM'] || 0);
		const total = logs.length;

		const negativePercentage = (negativeCount / total) * 100;

		if (negativePercentage >= 60) {
			return {
				status: 'Unstable',
				risk: 'HIGH',
				description: `${Math.round(negativePercentage)}% negative moods`,
			};
		} else if (negativePercentage >= 30) {
			return {
				status: 'Moderate',
				risk: 'MEDIUM',
				description: `${Math.round(negativePercentage)}% negative moods`,
			};
		} else {
			return {
				status: 'Stable',
				risk: 'LOW',
				description: `${Math.round(100 - negativePercentage)}% positive moods`,
			};
		}
	};

	const moodStability = calculateMoodStability();

	// Group logs by mealGroupId
	const meals = logs.reduce((acc, log) => {
		const groupId = log.mealGroupId || log.id;
		if (!acc[groupId]) {
			acc[groupId] = {
				id: groupId,
				items: [],
				totalCalories: 0,
				totalProtein: 0,
				totalCarbs: 0,
				totalFat: 0,
				loggedAt: log.loggedAt,
				emotionalState: log.emotionalState,
				eatingContext: log.eatingContext,
			};
		}
		acc[groupId].items.push(log);
		acc[groupId].totalCalories += log.calories || 0;
		acc[groupId].totalProtein += log.protein || 0;
		acc[groupId].totalCarbs += log.carbohydratesTotal || 0;
		acc[groupId].totalFat += log.fatTotal || 0;
		return acc;
	}, {} as Record<string, Meal>);

	const sortedMeals = Object.values(meals).sort(
		(a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime()
	);
	const latestMeal = sortedMeals[0];

	return (
		<DashboardShell>
			<div className='space-y-8'>
				{/* Welcome Header */}
				<div className='flex items-center justify-between'>
					<div>
						<h1 className='text-3xl font-bold text-slate-900'>Good afternoon, {displayName}</h1>
						<p className='text-slate-500'>
							Here&apos;s your daily nutritional and behavioral overview.
						</p>
					</div>
					<div className='text-right'>
						<p className='text-sm font-medium text-slate-500'>
							{new Date().toLocaleDateString('en-US', {
								weekday: 'long',
								year: 'numeric',
								month: 'long',
								day: 'numeric',
							})}
						</p>
					</div>
				</div>

				{/* Stats Row */}
				<div className='grid gap-4 md:grid-cols-3'>
					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>Calories Today</CardTitle>
							<Utensils className='h-4 w-4 text-slate-500' />
						</CardHeader>
						<CardContent>
							{loading ? (
								<Skeleton className='h-12 w-full' />
							) : (
								<>
									<div className='text-2xl font-bold'>
										{totalCalories.toLocaleString()} / {calorieGoal.toLocaleString()} kcal
									</div>
									<Progress value={caloriePercentage} className='mt-2' />
									<p className='mt-2 text-xs text-slate-500'>
										{Math.round(caloriePercentage)}% of daily goal
									</p>
								</>
							)}
						</CardContent>
					</Card>
					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>Mood Stability</CardTitle>
							<Brain className='h-4 w-4 text-slate-500' />
						</CardHeader>
						<CardContent>
							{loading ? (
								<Skeleton className='h-12 w-full' />
							) : (
								<>
									<div className='text-2xl font-bold'>{moodStability.status}</div>
									<Badge
										className={`mt-2 ${
											moodStability.risk === 'HIGH'
												? 'bg-rose-500 hover:bg-rose-600'
												: moodStability.risk === 'MEDIUM'
												? 'bg-amber-500 hover:bg-amber-600'
												: moodStability.risk === 'LOW'
												? 'bg-emerald-500 hover:bg-emerald-600'
												: 'bg-slate-400 hover:bg-slate-500'
										}`}
									>
										{moodStability.risk === 'HIGH'
											? 'High Risk'
											: moodStability.risk === 'MEDIUM'
											? 'Medium Risk'
											: moodStability.risk === 'LOW'
											? 'Low Risk'
											: 'No Data'}
									</Badge>
									<p className='mt-2 text-xs text-slate-500'>{moodStability.description}</p>
								</>
							)}
						</CardContent>
					</Card>
					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>Last Meal</CardTitle>
							<Clock className='h-4 w-4 text-slate-500' />
						</CardHeader>
						<CardContent>
							{loading ? (
								<Skeleton className='h-12 w-full' />
							) : latestMeal ? (
								<>
									<div className='font-medium'>
										{latestMeal.items.map((item: FoodLog) => item.foodName).join(', ')}
									</div>
									<div className='text-sm text-muted-foreground'>
										{latestMeal.emotionalState && (
											<Badge variant='secondary' className='mr-2 text-xs'>
												{latestMeal.emotionalState}
											</Badge>
										)}
										{new Date(latestMeal.loggedAt).toLocaleTimeString([], {
											hour: '2-digit',
											minute: '2-digit',
										})}
									</div>
								</>
							) : (
								<div className='text-sm text-slate-500'>No meals logged today</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Food Suggestions Card */}
				<Card>
					<CardHeader>
						<CardTitle>Food Suggestions</CardTitle>
						<CardDescription>Personalized recommendations based on your goals</CardDescription>
					</CardHeader>
					<CardContent>
						{suggestionsLoading ? (
							<div className='space-y-2'>
								<Skeleton className='h-4 w-full' />
								<Skeleton className='h-4 w-3/4' />
							</div>
						) : suggestions ? (
							<div className='space-y-4'>
								{suggestions.summary && (
									<p className='text-sm text-slate-600'>{suggestions.summary}</p>
								)}
								<div className='space-y-2'>
									{suggestions.suggestions?.map((item: any, idx: number) => (
										<div
											key={idx}
											className='flex items-start justify-between rounded-lg border p-3'
										>
											<div className='flex-1'>
												<p className='font-medium'>{item.food}</p>
												<p className='text-xs text-slate-500'>{item.portion}</p>
												<p className='mt-1 text-xs text-slate-600'>{item.reason}</p>
											</div>
											<div className='text-right'>
												<p className='font-semibold'>{item.calories}</p>
												<p className='text-xs text-slate-500'>kcal</p>
											</div>
										</div>
									))}
								</div>
								{suggestions.remainingCalories !== undefined && (
									<p className='text-xs text-slate-500'>
										{suggestions.remainingCalories} kcal remaining today
									</p>
								)}
							</div>
						) : (
							<p className='text-sm text-slate-500'>
								Log meals to get personalized food suggestions
							</p>
						)}
					</CardContent>
				</Card>

				{/* Main Section */}
				<div className='grid gap-8 md:grid-cols-3'>
					{/* Left Column: Recent Activity & Quick Add */}
					<div className='space-y-8 md:col-span-2'>
						{/* Quick Add Food Log */}
						<Card>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<Plus className='h-5 w-5 text-emerald-500' />
									Log Meal
								</CardTitle>
							</CardHeader>
							<CardContent>
								<form className='flex gap-4' onSubmit={handleAddFood}>
									<Input
										placeholder='What did you eat?'
										className='flex-1'
										required
										value={foodInput}
										onChange={(e) => setFoodInput(e.target.value)}
										disabled={addFoodLoading}
									/>
									<Select
										value={emotionInput}
										onValueChange={setEmotionInput}
										disabled={addFoodLoading}
									>
										<SelectTrigger className='w-[180px]'>
											<SelectValue placeholder='Emotion' />
										</SelectTrigger>
										<SelectContent>
											{Object.values(EmotionalState).map((state: string) => (
												<SelectItem key={state} value={state}>
													{state.charAt(0) + state.slice(1).toLowerCase()}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<Select
										value={contextInput}
										onValueChange={setContextInput}
										disabled={addFoodLoading}
									>
										<SelectTrigger className='w-[180px]'>
											<SelectValue placeholder='Context' />
										</SelectTrigger>
										<SelectContent>
											{Object.values(EatingContext).map((ctx: string) => (
												<SelectItem key={ctx} value={ctx}>
													{ctx.charAt(0) + ctx.slice(1).toLowerCase()}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<Button type='submit' disabled={addFoodLoading}>
										{addFoodLoading ? <Loader2 className='h-4 w-4 animate-spin' /> : 'Log'}
									</Button>
								</form>
							</CardContent>
						</Card>

						{/* Recent Activity Table */}
						<Card>
							<CardHeader>
								<CardTitle>Recent Activity</CardTitle>
							</CardHeader>
							<CardContent>
								{loading ? (
									<div className='space-y-2'>
										<Skeleton className='h-8 w-full' />
										<Skeleton className='h-8 w-full' />
										<Skeleton className='h-8 w-full' />
									</div>
								) : sortedMeals.length === 0 ? (
									<p className='text-center text-slate-500 py-4'>No activity yet.</p>
								) : (
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Food</TableHead>
												<TableHead>Calories</TableHead>
												<TableHead>Protein</TableHead>
												<TableHead>Carbs</TableHead>
												<TableHead>Fat</TableHead>
												<TableHead>Emotion</TableHead>
												<TableHead>Context</TableHead>
												<TableHead className='text-right'>Time</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{sortedMeals.map((meal: Meal) => (
												<MealRow key={meal.id} meal={meal} />
											))}
										</TableBody>
									</Table>
								)}
							</CardContent>
						</Card>
					</div>

					{/* Right Column: AI Insight */}
					<div className='md:col-span-1'>
						<Card className='h-full border-2 border-emerald-100 bg-gradient-to-b from-white to-emerald-50/30'>
							<CardHeader>
								<CardTitle className='flex items-center gap-2 text-emerald-800'>
									<Sparkles className='h-5 w-5' />
									AI Behavioral Analysis
								</CardTitle>
								<CardDescription>
									Get insights into your eating patterns and emotional connections with food
								</CardDescription>
							</CardHeader>
							<CardContent className='space-y-4'>
								{analysisLoading ? (
									<div className='flex flex-col items-center justify-center py-8 space-y-4'>
										<Loader2 className='h-8 w-8 animate-spin text-emerald-600' />
										<p className='text-sm text-slate-500'>Analyzing your patterns...</p>
									</div>
								) : analysis ? (
									<>
										<p className='text-sm text-slate-600'>
											<strong>Pattern:</strong>{' '}
											{analysis.triggerPatterns?.emotional_pattern ||
												'No specific pattern detected.'}
										</p>
										<div className='rounded-lg bg-white p-4 shadow-sm border border-emerald-100'>
											<h4 className='mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500'>
												Recommendations
											</h4>
											<ul className='list-disc pl-4 space-y-1'>
												{analysis.recommendations && analysis.recommendations.length > 0 ? (
													analysis.recommendations.map((rec, index) => (
														<li key={index} className='text-sm font-medium text-slate-900'>
															{rec}
														</li>
													))
												) : (
													<li className='text-sm font-medium text-slate-900'>
														No recommendations available.
													</li>
												)}
											</ul>
										</div>
										<div className='mt-4 flex items-center justify-between'>
											<span className='text-xs text-slate-500'>Risk Level:</span>
											<Badge
												className={
													analysis.riskLevel === 'HIGH'
														? 'bg-rose-500'
														: analysis.riskLevel === 'MEDIUM'
														? 'bg-yellow-500'
														: 'bg-emerald-500'
												}
											>
												{analysis.riskLevel}
											</Badge>
										</div>
									</>
								) : (
									<div className='flex flex-col items-center justify-center py-8'>
										<p className='mb-4 text-center text-sm text-slate-500'>
											Get personalized food recommendations based on your daily intake and goals
										</p>
										<Button
											onClick={fetchFoodSuggestions}
											disabled={suggestionsLoading}
											className='bg-emerald-600 hover:bg-emerald-700'
										>
											{suggestionsLoading ? (
												<>
													<Loader2 className='mr-2 h-4 w-4 animate-spin' />
													Generating...
												</>
											) : (
												<>
													<Sparkles className='mr-2 h-4 w-4' />
													Get Food Suggestions
												</>
											)}
										</Button>
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</DashboardShell>
	);
}
