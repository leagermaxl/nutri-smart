import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Brain, CheckCircle, Lightbulb, Sparkles } from 'lucide-react';

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

interface AnalysisCardProps {
	result: AnalysisResult;
	featured?: boolean;
}

export function AnalysisCard({ result, featured = false }: AnalysisCardProps) {
	const isHighRisk = result.riskLevel === 'HIGH';
	const isMediumRisk = result.riskLevel === 'MEDIUM';
	const emotionalPattern =
		result.triggerPatterns.emotional_pattern || 'No significant pattern detected';

	const formattedDate = new Date(result.generatedAt).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});

	return (
		<div className={featured ? 'space-y-6' : 'space-y-4'}>
			{featured && (
				<div className='flex items-center gap-2 text-emerald-600'>
					<Sparkles className='h-5 w-5' />
					<span className='font-semibold'>Latest Analysis</span>
				</div>
			)}

			{/* Summary Card - Only show for featured */}
			{featured && (
				<Card className='border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white'>
					<CardHeader>
						<CardTitle className='text-xl'>Daily Summary</CardTitle>
						<CardDescription className='text-xs text-slate-500'>{formattedDate}</CardDescription>
					</CardHeader>
					<CardContent>
						<p className='text-base leading-relaxed text-slate-700'>{result.summary}</p>
					</CardContent>
				</Card>
			)}

			<div className={`grid gap-${featured ? '6' : '4'} md:grid-cols-2`}>
				{/* Risk & Emotional Pattern */}
				<Card
					className={
						isHighRisk
							? 'border-rose-200 bg-rose-50/30'
							: isMediumRisk
							? 'border-amber-200 bg-amber-50/30'
							: 'border-emerald-200 bg-emerald-50/30'
					}
				>
					<CardHeader>
						<CardTitle
							className={`flex items-center justify-between ${featured ? 'text-lg' : 'text-base'}`}
						>
							<span className='flex items-center gap-2'>
								<Brain className={`${featured ? 'h-5 w-5' : 'h-4 w-4'}`} />
								Emotional Pattern
							</span>
							<Badge
								variant={isHighRisk ? 'destructive' : 'default'}
								className={`${
									isHighRisk
										? 'bg-rose-500 hover:bg-rose-600'
										: isMediumRisk
										? 'bg-amber-500 hover:bg-amber-600'
										: 'bg-emerald-500 hover:bg-emerald-600'
								} ${featured ? 'text-sm' : 'text-xs'}`}
							>
								{result.riskLevel} RISK
							</Badge>
						</CardTitle>
						{!featured && (
							<CardDescription className='text-xs text-slate-500'>{formattedDate}</CardDescription>
						)}
					</CardHeader>
					<CardContent>
						<p className={`${featured ? 'text-base' : 'text-sm'} font-medium text-slate-900`}>
							{emotionalPattern}
						</p>
						{!featured && (
							<p className='mt-2 text-xs text-slate-600 line-clamp-2'>{result.summary}</p>
						)}
						<div
							className={`mt-4 flex items-center gap-2 ${
								featured ? 'text-sm' : 'text-xs'
							} text-slate-500`}
						>
							{isHighRisk ? (
								<AlertTriangle className='h-4 w-4 text-rose-500' />
							) : (
								<CheckCircle className='h-4 w-4 text-emerald-500' />
							)}
							{isHighRisk
								? 'Attention required. Pattern suggests high stress correlation.'
								: 'Good balance maintained. Keep up the positive habits.'}
						</div>
					</CardContent>
				</Card>

				{/* Recommendations */}
				<Card>
					<CardHeader>
						<CardTitle className={`flex items-center gap-2 ${featured ? 'text-lg' : 'text-base'}`}>
							<Lightbulb className={`${featured ? 'h-5 w-5' : 'h-4 w-4'} text-amber-500`} />
							Recommendations
						</CardTitle>
					</CardHeader>
					<CardContent>
						<ul className='space-y-3'>
							{result.recommendations.map((rec, index) => (
								<li key={index} className='flex items-start gap-3'>
									<div
										className={`mt-1 flex ${
											featured ? 'h-5 w-5' : 'h-4 w-4'
										} shrink-0 items-center justify-center rounded-full bg-slate-100 ${
											featured ? 'text-xs' : 'text-[10px]'
										} font-bold text-slate-600`}
									>
										{index + 1}
									</div>
									<span className={`${featured ? 'text-sm' : 'text-xs'} text-slate-700`}>
										{rec}
									</span>
								</li>
							))}
						</ul>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
