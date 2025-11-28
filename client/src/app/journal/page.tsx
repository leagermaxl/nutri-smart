'use client';

import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { FoodLog, foodService } from '@/services/food.service';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface DayLog {
	date: string;
	meals: MealGroup[];
	totalCalories: number;
	totalProtein: number;
	totalCarbs: number;
	totalFat: number;
}

interface MealGroup {
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

export default function JournalPage() {
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const { toast } = useToast();
	const router = useRouter();
	const [logs, setLogs] = useState<FoodLog[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedDate, setSelectedDate] = useState(new Date());

	// Helper function to format date in local timezone (YYYY-MM-DD)
	const formatDateLocal = (date: Date): string => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	};

	useEffect(() => {
		if (!authLoading && !isAuthenticated) {
			router.push('/login');
		} else if (isAuthenticated) {
			loadLogs();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isAuthenticated, authLoading, selectedDate]); // Added selectedDate dependency

	const loadLogs = async () => {
		try {
			setLoading(true);
			const dateStr = formatDateLocal(selectedDate); // Use local timezone
			const data = await foodService.getLogsByDate(dateStr);
			setLogs(data);
		} catch (error) {
			console.error('Failed to fetch logs', error);
			toast({
				title: 'Error',
				description: 'Failed to load food logs',
				variant: 'destructive',
			});
		} finally {
			setLoading(false);
		}
	};

	if (authLoading || !isAuthenticated) {
		return null;
	}

	// Group logs by date and meal
	const groupLogsByDate = () => {
		// Backend now filters by date, so we don't need to filter here
		const dateMap: Record<string, FoodLog[]> = {};

		logs.forEach((log) => {
			const logDate = new Date(log.loggedAt);
			const dateKey = logDate.toLocaleDateString('en-US', {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
			});

			if (!dateMap[dateKey]) {
				dateMap[dateKey] = [];
			}
			dateMap[dateKey].push(log);
		});

		return Object.entries(dateMap)
			.map(([date, dayLogs]) => {
				// Group by meal within each day
				const mealMap: Record<string, MealGroup> = {};

				dayLogs.forEach((log) => {
					const groupId = log.mealGroupId || log.id;
					if (!mealMap[groupId]) {
						mealMap[groupId] = {
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
					mealMap[groupId].items.push(log);
					mealMap[groupId].totalCalories += log.calories || 0;
					mealMap[groupId].totalProtein += log.protein || 0;
					mealMap[groupId].totalCarbs += log.carbohydratesTotal || 0;
					mealMap[groupId].totalFat += log.fatTotal || 0;
				});

				const meals = Object.values(mealMap).sort(
					(a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime()
				);

				const dayLog: DayLog = {
					date,
					meals,
					totalCalories: meals.reduce((sum, m) => sum + m.totalCalories, 0),
					totalProtein: meals.reduce((sum, m) => sum + m.totalProtein, 0),
					totalCarbs: meals.reduce((sum, m) => sum + m.totalCarbs, 0),
					totalFat: meals.reduce((sum, m) => sum + m.totalFat, 0),
				};

				return dayLog;
			})
			.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
	};

	const dayLogs = groupLogsByDate();

	const goToPreviousDay = () => {
		const newDate = new Date(selectedDate);
		newDate.setDate(newDate.getDate() - 1);
		setSelectedDate(newDate);
	};

	const goToNextDay = () => {
		const newDate = new Date(selectedDate);
		newDate.setDate(newDate.getDate() + 1);
		setSelectedDate(newDate);
	};

	const goToToday = () => {
		setSelectedDate(new Date());
	};

	return (
		<DashboardShell>
			<div className='space-y-8'>
				{/* Header */}
				<div className='flex items-center justify-between'>
					<div>
						<h1 className='text-3xl font-bold text-slate-900'>Food Journal</h1>
						<p className='text-slate-500'>Your complete food tracking history</p>
					</div>
					<div className='flex items-center gap-2'>
						<Button variant='outline' size='icon' onClick={goToPreviousDay}>
							<ChevronLeft className='h-4 w-4' />
						</Button>
						<div className='flex items-center gap-2 px-4 py-2 rounded-md border border-slate-200 bg-white min-w-[200px] justify-center'>
							<Calendar className='h-4 w-4 text-slate-400' />
							<input
								type='date'
								value={formatDateLocal(selectedDate)}
								onChange={(e) => setSelectedDate(new Date(e.target.value))}
								max={formatDateLocal(new Date())}
								className='text-sm font-medium border-none outline-none bg-transparent cursor-pointer'
							/>
						</div>
						<Button
							variant='outline'
							size='icon'
							onClick={goToNextDay}
							disabled={selectedDate.toDateString() === new Date().toDateString()}
						>
							<ChevronRight className='h-4 w-4' />
						</Button>
						<Button
							variant='default'
							size='sm'
							onClick={goToToday}
							className='bg-emerald-600 hover:bg-emerald-700'
						>
							Today
						</Button>
					</div>
				</div>

				{/* Content */}
				{loading ? (
					<div className='space-y-4'>
						{[1, 2, 3].map((i) => (
							<Card key={i}>
								<CardHeader>
									<Skeleton className='h-6 w-32' />
								</CardHeader>
								<CardContent>
									<Skeleton className='h-24 w-full' />
								</CardContent>
							</Card>
						))}
					</div>
				) : dayLogs.length === 0 ? (
					<Card>
						<CardContent className='flex flex-col items-center justify-center py-16'>
							<Calendar className='h-16 w-16 text-slate-300 mb-4' />
							<h3 className='text-lg font-medium text-slate-900 mb-2'>No Entries Yet</h3>
							<p className='text-sm text-slate-500'>Start logging your meals to see them here.</p>
						</CardContent>
					</Card>
				) : (
					<div className='space-y-8'>
						{dayLogs.map((dayLog) => (
							<Card key={dayLog.date}>
								<CardHeader>
									<div className='flex items-center justify-between'>
										<CardTitle className='text-xl'>
											{new Date(dayLog.date).toLocaleDateString('en-US', {
												weekday: 'long',
												month: 'long',
												day: 'numeric',
												year: 'numeric',
											})}
										</CardTitle>
										<div className='flex items-center gap-3'>
											<div className='flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100'>
												<span className='text-lg font-bold text-slate-900'>
													{Math.round(dayLog.totalCalories)}
												</span>
												<span className='text-xs text-slate-600'>kcal</span>
											</div>
											<Badge
												variant='outline'
												className='gap-1.5 border-blue-200 bg-blue-50 text-blue-700'
											>
												<span className='font-bold'>{Math.round(dayLog.totalProtein)}g</span>
												<span className='text-xs opacity-75'>Protein</span>
											</Badge>
											<Badge
												variant='outline'
												className='gap-1.5 border-amber-200 bg-amber-50 text-amber-700'
											>
												<span className='font-bold'>{Math.round(dayLog.totalCarbs)}g</span>
												<span className='text-xs opacity-75'>Carbs</span>
											</Badge>
											<Badge
												variant='outline'
												className='gap-1.5 border-rose-200 bg-rose-50 text-rose-700'
											>
												<span className='font-bold'>{Math.round(dayLog.totalFat)}g</span>
												<span className='text-xs opacity-75'>Fat</span>
											</Badge>
										</div>
									</div>
								</CardHeader>
								<CardContent className='space-y-4'>
									{dayLog.meals.map((meal) => (
										<div
											key={meal.id}
											className='rounded-lg border border-slate-200 bg-slate-50/50 p-4 hover:bg-slate-50'
										>
											<div className='flex items-start justify-between mb-3'>
												<div className='flex-1'>
													<div className='flex items-center gap-2 mb-1'>
														<span className='font-medium text-slate-900'>
															{meal.items.map((item) => item.foodName).join(', ')}
														</span>
													</div>
													<div className='flex items-center gap-2 text-sm text-slate-500'>
														<span>
															{new Date(meal.loggedAt).toLocaleTimeString([], {
																hour: '2-digit',
																minute: '2-digit',
															})}
														</span>
														{meal.emotionalState && (
															<Badge
																variant='outline'
																className={`text-xs ${
																	meal.emotionalState === 'HAPPINESS'
																		? 'border-emerald-200 text-emerald-700 bg-emerald-50'
																		: meal.emotionalState === 'STRESS' ||
																		  meal.emotionalState === 'SADNESS'
																		? 'border-rose-200 text-rose-700 bg-rose-50'
																		: 'border-slate-200 text-slate-700 bg-white'
																}`}
															>
																{meal.emotionalState}
															</Badge>
														)}
														{meal.eatingContext && (
															<Badge variant='secondary' className='text-xs'>
																{meal.eatingContext}
															</Badge>
														)}
													</div>
												</div>
												<div className='flex items-center gap-2'>
													<div className='text-right'>
														<div className='text-xl font-bold text-slate-900'>
															{Math.round(meal.totalCalories)}
														</div>
														<div className='text-xs text-slate-500'>kcal</div>
													</div>
													<div className='flex flex-col gap-1'>
														<div className='flex gap-1.5'>
															<Badge
																variant='outline'
																className='text-xs border-blue-200 bg-blue-50 text-blue-700 px-2 py-0'
															>
																{Math.round(meal.totalProtein)}g P
															</Badge>
															<Badge
																variant='outline'
																className='text-xs border-amber-200 bg-amber-50 text-amber-700 px-2 py-0'
															>
																{Math.round(meal.totalCarbs)}g C
															</Badge>
															<Badge
																variant='outline'
																className='text-xs border-rose-200 bg-rose-50 text-rose-700 px-2 py-0'
															>
																{Math.round(meal.totalFat)}g F
															</Badge>
														</div>
													</div>
												</div>
											</div>

											{/* Individual Items */}
											{meal.items.length > 1 && (
												<div className='mt-3 pt-3 border-t border-slate-200 space-y-2'>
													{meal.items.map((item) => (
														<div
															key={item.id}
															className='flex items-center justify-between text-sm'
														>
															<span className='text-slate-700'>{item.foodName}</span>
															<div className='flex gap-3 text-slate-600'>
																<span>{item.calories} kcal</span>
																<span>{item.protein}g P</span>
																<span>{item.carbohydratesTotal}g C</span>
																<span>{item.fatTotal}g F</span>
															</div>
														</div>
													))}
												</div>
											)}
										</div>
									))}
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>
		</DashboardShell>
	);
}
