'use client';

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
import { ActivityLevel, Gender, PrimaryGoal } from '@/services/auth.service';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RegisterPage() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [age, setAge] = useState('');
	const [weight, setWeight] = useState('');
	const [height, setHeight] = useState('');
	const [gender, setGender] = useState('');
	const [activityLevel, setActivityLevel] = useState('');
	const [primaryGoal, setPrimaryGoal] = useState('');
	const [dietaryRestrictions, setDietaryRestrictions] = useState('');
	const [loading, setLoading] = useState(false);
	const { register } = useAuth();
	const { toast } = useToast();
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			await register({
				email,
				password,
				firstName: firstName || undefined,
				lastName: lastName || undefined,
				age: age ? parseInt(age) : undefined,
				weight: weight ? parseFloat(weight) : undefined,
				height: height ? parseFloat(height) : undefined,
				gender: gender as Gender,
				activityLevel: activityLevel as ActivityLevel,
				primaryGoal: primaryGoal as PrimaryGoal,
				dietaryRestrictions: dietaryRestrictions || undefined,
			});
			toast({
				title: 'Success',
				description: 'Account created successfully',
			});
			router.push('/');
		} catch (error) {
			console.error(error);
			toast({
				title: 'Error',
				description: 'Registration failed. Try a different email.',
				variant: 'destructive',
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='flex min-h-screen items-center justify-center bg-slate-50 p-4'>
			<Card className='w-full max-w-md'>
				<CardHeader>
					<CardTitle className='text-center text-2xl font-bold text-slate-900'>
						Create an Account
					</CardTitle>
					<CardDescription className='text-center text-slate-500'>
						Enter your details to get started
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='email'>Email</Label>
							<Input
								id='email'
								type='email'
								placeholder='you@example.com'
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>

						<div className='grid grid-cols-2 gap-4'>
							<div className='space-y-2'>
								<Label htmlFor='firstName'>First Name</Label>
								<Input
									id='firstName'
									type='text'
									placeholder='John'
									value={firstName}
									onChange={(e) => setFirstName(e.target.value)}
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='lastName'>Last Name</Label>
								<Input
									id='lastName'
									type='text'
									placeholder='Doe'
									value={lastName}
									onChange={(e) => setLastName(e.target.value)}
								/>
							</div>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='password'>Password</Label>
							<Input
								id='password'
								type='password'
								placeholder='••••••••'
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>
						<div className='grid grid-cols-2 gap-4'>
							<div className='space-y-2'>
								<Label htmlFor='age'>Age</Label>
								<Input
									id='age'
									type='number'
									placeholder='25'
									value={age}
									onChange={(e) => setAge(e.target.value)}
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='gender'>Gender</Label>
								<Select value={gender} onValueChange={setGender}>
									<SelectTrigger>
										<SelectValue placeholder='Select' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='MALE'>Male</SelectItem>
										<SelectItem value='FEMALE'>Female</SelectItem>
										<SelectItem value='OTHER'>Other</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
						<div className='grid grid-cols-2 gap-4'>
							<div className='space-y-2'>
								<Label htmlFor='weight'>Weight (kg)</Label>
								<Input
									id='weight'
									type='number'
									placeholder='70'
									value={weight}
									onChange={(e) => setWeight(e.target.value)}
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='height'>Height (cm)</Label>
								<Input
									id='height'
									type='number'
									placeholder='175'
									value={height}
									onChange={(e) => setHeight(e.target.value)}
								/>
							</div>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='activityLevel'>Activity Level</Label>
							<Select value={activityLevel} onValueChange={setActivityLevel}>
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
							<Select value={primaryGoal} onValueChange={setPrimaryGoal}>
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
							<Label htmlFor='dietaryRestrictions'>Dietary Restrictions (Optional)</Label>
							<Input
								id='dietaryRestrictions'
								placeholder='e.g., Vegetarian, no dairy, gluten-free'
								value={dietaryRestrictions}
								onChange={(e) => setDietaryRestrictions(e.target.value)}
							/>
						</div>
						<Button
							type='submit'
							className='w-full bg-emerald-600 hover:bg-emerald-700'
							disabled={loading}
						>
							{loading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : 'Register'}
						</Button>
					</form>
					<div className='mt-4 text-center text-sm text-slate-500'>
						Already have an account?{' '}
						<Link href='/login' className='font-medium text-emerald-600 hover:underline'>
							Login
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
