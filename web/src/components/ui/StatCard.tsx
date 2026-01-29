'use client';

import { Card, CardContent } from './Card';

interface StatCardProps {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  variant?: 'default' | 'danger' | 'success' | 'warning' | 'info';
  className?: string;
}

export default function StatCard({
  label,
  value,
  icon,
  variant = 'default',
  className = '',
}: StatCardProps) {
  const variants = {
    default: 'text-gray-600',
    danger: 'text-red-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600',
  };

  const bgVariants = {
    default: 'bg-gray-50',
    danger: 'bg-red-50',
    success: 'bg-green-50',
    warning: 'bg-yellow-50',
    info: 'bg-blue-50',
  };

  return (
    <Card className={className}>
      <CardContent className="flex items-center gap-4">
        {icon && (
          <div className={`p-3 rounded-lg ${bgVariants[variant]}`}>
            <div className={variants[variant]}>{icon}</div>
          </div>
        )}
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className={`text-2xl font-bold ${variants[variant]}`}>{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
