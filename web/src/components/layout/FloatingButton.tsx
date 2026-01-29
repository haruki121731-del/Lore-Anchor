'use client';

import Link from 'next/link';
import { Radar } from 'lucide-react';

interface FloatingButtonProps {
  href: string;
  label: string;
  className?: string;
}

export default function FloatingButton({
  href,
  label,
  className = '',
}: FloatingButtonProps) {
  return (
    <Link
      href={href}
      className={`fixed bottom-6 right-6 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-shadow z-40 ${className}`}
    >
      <Radar className="w-5 h-5" />
      <span>{label}</span>
    </Link>
  );
}
