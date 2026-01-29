'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Upload, AlertTriangle, Radar, User } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { useAppStore } from '@/lib/store';

export default function Navigation() {
  const pathname = usePathname();
  const { user, getInfringementStats } = useAppStore();
  const stats = getInfringementStats();

  const navItems = [
    {
      href: '/',
      label: 'IP登録',
      icon: Upload,
      description: '作品を登録',
    },
    {
      href: '/infringements',
      label: '侵害検知',
      icon: AlertTriangle,
      description: '結果を確認',
      badge: stats.pending > 0 ? stats.pending : undefined,
    },
    {
      href: '/monitor',
      label: '自動監視',
      icon: Radar,
      description: 'Pro機能',
      isPro: true,
    },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Lore-Anchor</span>
          </Link>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.isPro && (
                    <Badge variant="pro" size="sm">
                      PRO
                    </Badge>
                  )}
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            {user?.plan === 'pro' && (
              <Badge variant="pro">PRO</Badge>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
              <User className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {user?.name || 'Guest'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200">
        <div className="flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium ${
                  isActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="absolute top-1 right-1/4 flex items-center justify-center w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
