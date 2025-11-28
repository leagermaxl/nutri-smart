'use client';

import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { ActivityLevel, authService, Gender, PrimaryGoal } from '@/services/auth.service';
import { Loader2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SettingsPage() {
	const { user, isAuthenticated, isLoading: authLoading, checkAuth } = useAuth();
	const { toast } = useToast();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		age: '',
		weight: '',
		height: '',
		gender: '',
		activityLevel: '',
		primaryGoal: '',
		dietaryRestrictions: '',
	});

	useEffect(() => {
		if (!authLoading && !isAuthenticated) {
			router.push('/login');
		} else if (user) {
			setFormData({
				firstName: user.firstName || '',
				lastName: user.lastName || '',
				age: user.age?.toString() || '',
				weight: user.weight?.toString() || '',
				height: user.height?.toString() || '',
				gender: user.gender || '',
				activityLevel: user.activityLevel || '',
				primaryGoal: user.primaryGoal || '',
				dietaryRestrictions: user.dietaryRestrictions || '',
			});
		}
		console.log(user);
		// console.log(formData);
	}, [isAuthenticated, authLoading, router, user]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSelectChange = (name: string, value: string) => {
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const payload = {
				firstName: formData.firstName || undefined,
				lastName: formData.lastName || undefined,
				age: formData.age ? parseInt(formData.age) : undefined,
				weight: formData.weight ? parseFloat(formData.weight) : undefined,
				height: formData.height ? parseFloat(formData.height) : undefined,
				gender: (formData.gender as Gender) || undefined,
				activityLevel: (formData.activityLevel as ActivityLevel) || undefined,
				primaryGoal: (formData.primaryGoal as PrimaryGoal) || undefined,
				dietaryRestrictions: formData.dietaryRestrictions || undefined,
			};

			await authService.updateProfile(payload);
			await checkAuth(); // Refresh user data in context

			toast({
				title: 'Profile Updated',
				description: 'Your settings have been saved successfully.',
			});
		} catch (error) {
			console.error('Failed to update profile', error);
			toast({
				title: 'Error',
				description: 'Failed to update profile. Please try again.',
				variant: 'destructive',
			});
		} finally {
			setIsLoading(false);
		}
	};

	if (authLoading || !isAuthenticated) {
		return null;
	}

	return (
		<DashboardShell>
			<div className='max-w-2xl mx-auto space-y-8'>
				<div>
					<h1 className='text-3xl font-bold text-slate-900'>Settings</h1>
					<p className='text-slate-500'>Manage your profile and preferences.</p>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Profile Information</CardTitle>
						<CardDescription>
							Update your physical attributes and goals to get better recommendations.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className='space-y-6'>
							<div className='grid gap-4 md:grid-cols-2'>
								<div className='space-y-2'>
									<Label htmlFor='firstName'>First Name</Label>
									<Input
										id='firstName'
										name='firstName'
										type='text'
										placeholder='John'
										value={formData.firstName}
										onChange={handleChange}
									/>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='lastName'>Last Name</Label>
									<Input
										id='lastName'
										name='lastName'
										type='text'
										placeholder='Doe'
										value={formData.lastName}
										onChange={handleChange}
									/>
								</div>
							</div>

							<div className='grid gap-4 md:grid-cols-2'>
								<div className='space-y-2'>
									<Label htmlFor='age'>Age</Label>
									<Input
										id='age'
										name='age'
										type='number'
										placeholder='25'
										value={formData.age}
										onChange={handleChange}
									/>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='gender'>Gender</Label>
									<Select
										value={formData.gender || undefined}
										onValueChange={(value) => handleSelectChange('gender', value)}
									>
										<SelectTrigger>
											<SelectValue placeholder='Select gender' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='MALE'>Male</SelectItem>
											<SelectItem value='FEMALE'>Female</SelectItem>
											<SelectItem value='OTHER'>Other</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='weight'>Weight (kg)</Label>
									<Input
										id='weight'
										name='weight'
										type='number'
										step='0.1'
										placeholder='70.5'
										value={formData.weight}
										onChange={handleChange}
									/>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='height'>Height (cm)</Label>
									<Input
										id='height'
										name='height'
										type='number'
										placeholder='175'
										value={formData.height}
										onChange={handleChange}
									/>
								</div>
							</div>

							<div className='space-y-2'>
								<Label htmlFor='activityLevel'>Activity Level</Label>
								<Select
									value={formData.activityLevel || undefined}
									onValueChange={(value) => handleSelectChange('activityLevel', value)}
								>
									<SelectTrigger>
										<SelectValue placeholder='Select activity level' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='SEDENTARY'>Sedentary (little or no exercise)</SelectItem>
										<SelectItem value='LIGHTLY_ACTIVE'>Light (exercise 1-3 days/week)</SelectItem>
										<SelectItem value='MODERATELY_ACTIVE'>
											Moderate (exercise 3-5 days/week)
										</SelectItem>
										<SelectItem value='VERY_ACTIVE'>Active (exercise 6-7 days/week)</SelectItem>
										<SelectItem value='EXTRA_ACTIVE'>
											Very Active (hard exercise/physical job)
										</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className='space-y-2'>
								<Label htmlFor='primaryGoal'>Primary Goal</Label>
								<Select
									value={formData.primaryGoal || undefined}
									onValueChange={(value) => handleSelectChange('primaryGoal', value)}
								>
									<SelectTrigger>
										<SelectValue placeholder='Select your primary goal' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='WEIGHT_LOSS'>Weight Loss</SelectItem>
										<SelectItem value='MUSCLE_GAIN'>Muscle Gain</SelectItem>
										<SelectItem value='MAINTENANCE'>Maintenance</SelectItem>
										<SelectItem value='IMPROVED_HEALTH'>Improved Health</SelectItem>
										<SelectItem value='ATHLETIC_PERFORMANCE'>Athletic Performance</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className='space-y-2'>
								<Label htmlFor='dietaryRestrictions'>Dietary Restrictions</Label>
								<Input
									id='dietaryRestrictions'
									name='dietaryRestrictions'
									placeholder='e.g., Vegetarian, no dairy, gluten-free'
									value={formData.dietaryRestrictions}
									onChange={handleChange}
								/>
							</div>

							<div className='flex justify-end'>
								<Button type='submit' disabled={isLoading}>
									{isLoading ? (
										<>
											<Loader2 className='mr-2 h-4 w-4 animate-spin' />
											Saving...
										</>
									) : (
										<>
											<Save className='mr-2 h-4 w-4' />
											Save Changes
										</>
									)}
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			</div>
		</DashboardShell>
	);
}
