import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    change?: {
        value: string;
        type: 'increase' | 'decrease' | 'neutral';
    };
    icon: LucideIcon;
    color?: 'blue' | 'green' | 'purple' | 'red' | 'yellow';
}

export default function StatsCard({
    title,
    value,
    change,
    icon: Icon,
    color = 'blue'
}: StatsCardProps) {
    const colorClasses = {
        blue: 'bg-blue-500 text-blue-600',
        green: 'bg-green-500 text-green-600',
        purple: 'bg-purple-500 text-purple-600',
        red: 'bg-red-500 text-red-600',
        yellow: 'bg-yellow-500 text-yellow-600',
    };

    const changeColorClasses = {
        increase: 'text-green-600',
        decrease: 'text-red-600',
        neutral: 'text-gray-600',
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                    <div className={`w-8 h-8 bg-opacity-20 rounded-md flex items-center justify-center ${colorClasses[color]}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-600 truncate">
                        {title}
                    </p>
                    <div className="flex items-baseline">
                        <p className="text-lg font-semibold text-gray-900">
                            {value}
                        </p>
                        {change && (
                            <span className={`ml-2 text-sm font-medium ${changeColorClasses[change.type]}`}>
                                {change.value}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
