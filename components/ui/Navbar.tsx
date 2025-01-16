"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { CalendarIcon, UtensilsCrossed, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();

    const navItems = [
        { href: '/meal-planner', icon: UtensilsCrossed, label: 'Meal Planner' },
        { href: '/', icon: CalendarIcon, label: 'Cycle Calendar' },
    ];

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    if (!user) {
        // If there's no user, render nothing
        return null;
    }

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-black text-white h-16 flex justify-around items-center">
            {navItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={`flex flex-col items-center justify-center h-full w-full ${pathname === item.href ? 'text-blue-400' : ''
                        }`}
                >
                    <item.icon className="w-6 h-6" />
                    <span className="text-xs mt-1">{item.label}</span>
                </Link>
            ))}
            <Button
                variant="ghost"
                className="flex flex-col items-center justify-center h-full w-full text-white hover:bg-transparent hover:text-white"
                onClick={handleLogout}
            >
                <LogOut className="w-6 h-6" />
                <span className="text-xs mt-1">Logout</span>
            </Button>
        </nav>
    );
}