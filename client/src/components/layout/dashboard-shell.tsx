'use client';

import { useAuth } from '@/context/auth-context';
import { Activity, BookOpen, LayoutDashboard, Settings, User } from 'lucide-react';
import Link from 'next/link';

interface DashboardShellProps {
	children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
	const { user } = useAuth();

	const displayName =
		user?.firstName && user?.lastName
			? `${user.firstName} ${user.lastName}`
			: user?.firstName || user?.email?.split('@')[0] || 'User';

	return (
		<div className='flex min-h-screen bg-slate-50'>
			{/* Sidebar */}
			<aside className='fixed left-0 top-0 z-40 h-screen w-64 border-r bg-white'>
				<div className='flex h-full flex-col'>
					{/* Logo */}
					<div className='flex h-16 items-center border-b px-6'>
						<Link
							href='/'
							className='text-xl font-bold text-slate-900 hover:text-emerald-600 transition-colors'
						>
							NutriSmart
						</Link>
					</div>

					{/* Navigation */}
					<nav className='flex-1 space-y-1 px-3 py-4'>
						<Link
							href='/'
							className='flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900'
						>
							<LayoutDashboard className='h-5 w-5' />
							Dashboard
						</Link>
						<Link
							href='/journal'
							className='flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900'
						>
							<BookOpen className='h-5 w-5' />
							Journal
						</Link>
						<Link
							href='/analysis'
							className='flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900'
						>
							<Activity className='h-5 w-5' />
							Analysis
						</Link>
						<Link
							href='/settings'
							className='flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900'
						>
							<Settings className='h-5 w-5' />
							Settings
						</Link>
					</nav>

					{/* User Profile */}
					<div className='border-t p-4'>
						<div className='flex items-center gap-3'>
							<div className='flex h-9 w-9 items-center justify-center rounded-full bg-slate-100'>
								<User className='h-5 w-5 text-slate-500' />
							</div>
							<div className='flex flex-col overflow-hidden'>
								<span className='text-sm font-medium text-slate-900 truncate'>{displayName}</span>
								<span className='text-xs text-slate-500 truncate'>
									{user?.email || 'user@example.com'}
								</span>
							</div>
						</div>
					</div>
				</div>
			</aside>

			{/* Main Content */}
			<main className='flex-1 pl-64'>
				<div className='container mx-auto p-8'>{children}</div>
			</main>
		</div>
	);
}
