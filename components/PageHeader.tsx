import React from "react";
import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
    Icon?: LucideIcon; 
    title: string;     
}

export function PageHeader({ Icon, title }: PageHeaderProps) {
    return (
        <div className="flex items-center justify-center space-x-4 mb-8">
            {Icon && <Icon className="w-10 h-10" />}
            <h1 className="text-4xl font-bold text-center">{title}</h1>
        </div>
    );
}