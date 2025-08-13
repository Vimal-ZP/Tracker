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
        <div className="card">
            <div className="card-body">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <div className={`w-8 h-8 bg-opacity-20 rounded-md flex items-center justify-center ${colorClasses[color]}`}>
                            <Icon className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                        <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                                {title}
                            </dt>
                            <dd className="flex items-baseline">
                                <div className="text-2xl font-semibold text-gray-900">
                                    {value}
                                </div>
                                {change && (
                                    <div className={`ml-2 flex items-baseline text-sm font-semibold ${changeColorClasses[change.type]}`}>
                                        {change.value}
                                    </div>
                                )}
                            </dd>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
}
