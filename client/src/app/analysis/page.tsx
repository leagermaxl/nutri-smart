'use client';

import { AnalysisCard, AnalysisResult } from '@/components/analysis-card';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { analysisService } from '@/services/analysis.service';
import { Calendar, FileText, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AnalysisPage() {
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const { toast } = useToast();
	const router = useRouter();
	const [isGenerating, setIsGenerating] = useState(false);
	const [isLoadingHistory, setIsLoadingHistory] = useState(true);
	const [allAnalyses, setAllAnalyses] = useState<AnalysisResult[]>([]);

	// Helper function to format date in local timezone (YYYY-MM-DD)
	const formatDateLocal = (date: Date): string => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	};

	const [selectedDate, setSelectedDate] = useState(formatDateLocal(new Date()));

	useEffect(() => {
		if (!authLoading && !isAuthenticated) {
			router.push('/login');
		} else if (isAuthenticated) {
			loadHistory();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isAuthenticated, authLoading]);

	const loadHistory = async () => {
		try {
			setIsLoadingHistory(true);
			const history = await analysisService.getHistory();
			setAllAnalyses(history);
		} catch (error) {
			console.error('Failed to load analysis history', error);
			toast({
				title: 'Error',
				description: 'Failed to load analysis history',
				variant: 'destructive',
			});
		} finally {
			setIsLoadingHistory(false);
		}
	};

	// Filter analyses based on selected date (using local timezone to avoid date shifting)
	const filteredAnalyses = allAnalyses.filter((analysis) => {
		const analysisDate = new Date(analysis.startDate);
		const analysisLocalDate = `${analysisDate.getFullYear()}-${String(
			analysisDate.getMonth() + 1
		).padStart(2, '0')}-${String(analysisDate.getDate()).padStart(2, '0')}`;
		return analysisLocalDate === selectedDate;
	});

	const handleGenerateAnalysis = async () => {
		setIsGenerating(true);

		try {
			const result = await analysisService.generateAnalysis(selectedDate);

			// Add new analysis to the list
			setAllAnalyses((prev) => [result, ...prev]);

			toast({
				title: 'Analysis Generated',
				description: 'Your behavioral analysis has been generated successfully.',
			});
		} catch (error: any) {
			console.error('Failed to generate analysis', error);
			const errorMessage =
				error?.response?.data?.message ||
				'Failed to generate analysis. Make sure you have food logs for the selected date.';
			toast({
				title: 'Error',
				description: errorMessage,
				variant: 'destructive',
			});
		} finally {
			setIsGenerating(false);
		}
	};

	if (authLoading || !isAuthenticated) {
		return null;
	}

	return (
		<DashboardShell>
			<div className='space-y-8'>
				<div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
					<div>
						<h1 className='text-3xl font-bold text-slate-900'>Behavioral Analysis</h1>
						<p className='text-slate-500'>AI-driven insights based on your eating patterns.</p>
					</div>
					<div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
						<div className='flex items-center gap-2'>
							<Calendar className='h-4 w-4 text-slate-400' />
							<input
								type='date'
								value={selectedDate}
								onChange={(e) => setSelectedDate(e.target.value)}
								max={formatDateLocal(new Date())}
								className='rounded-md border border-slate-200 px-3 py-1.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20'
							/>
						</div>
						<Button
							onClick={handleGenerateAnalysis}
							disabled={isGenerating}
							className='bg-emerald-600 hover:bg-emerald-700'
						>
							{isGenerating ? (
								<>
									<Sparkles className='mr-2 h-4 w-4 animate-spin' />
									Analyzing...
								</>
							) : (
								<>
									<Sparkles className='mr-2 h-4 w-4' />
									Generate Analysis
								</>
							)}
						</Button>
					</div>
				</div>

				{/* Loading State */}
				{isLoadingHistory && (
					<div className='space-y-6'>
						<div className='space-y-4'>
							<Skeleton className='h-8 w-48' />
							<Skeleton className='h-[200px] w-full rounded-xl' />
						</div>
						<div className='grid gap-6 md:grid-cols-2'>
							<Skeleton className='h-[200px] w-full rounded-xl' />
							<Skeleton className='h-[200px] w-full rounded-xl' />
						</div>
					</div>
				)}

				{/* No Analyses State */}
				{!isLoadingHistory && filteredAnalyses.length === 0 && (
					<div className='flex h-[400px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50'>
						<div className='flex h-16 w-16 items-center justify-center rounded-full bg-slate-100'>
							<FileText className='h-8 w-8 text-slate-400' />
						</div>
						<h3 className='mt-4 text-lg font-medium text-slate-900'>
							{allAnalyses.length === 0
								? 'No Analysis Generated Yet'
								: `No Analysis for ${new Date(selectedDate).toLocaleDateString('en-US', {
										month: 'short',
										day: 'numeric',
										year: 'numeric',
								  })}`}
						</h3>
						<p className='mt-2 max-w-sm text-center text-sm text-slate-500'>
							{allAnalyses.length === 0
								? 'Select a date above and click "Generate Analysis" to create your first behavioral analysis report.'
								: 'No analysis found for this date. Select a different date or generate a new analysis.'}
						</p>
					</div>
				)}

				{/* Analyses Display */}
				{!isLoadingHistory && filteredAnalyses.length > 0 && (
					<div className='space-y-12'>
						{/* Featured Latest Analysis */}
						<div>
							<AnalysisCard result={filteredAnalyses[0]} featured={true} />
						</div>

						{/* Previous Analyses */}
						{filteredAnalyses.length > 1 && (
							<div className='space-y-6'>
								<h2 className='text-xl font-semibold text-slate-900'>Previous Analyses</h2>
								<div className='space-y-8'>
									{filteredAnalyses.slice(1).map((analysis) => (
										<div key={analysis.id} className='pb-8 border-b border-slate-200 last:border-0'>
											<AnalysisCard result={analysis} featured={false} />
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				)}
			</div>
		</DashboardShell>
	);
}
