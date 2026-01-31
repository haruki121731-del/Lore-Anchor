import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronDown, Check, Shield, AlertTriangle, Clock, Scan, ExternalLink } from 'lucide-react';
import type { IPWork } from '@/types';

interface GalleryViewProps {
  works: IPWork[];
  onBack: () => void;
  onWorkClick: (work: IPWork) => void;
}

// ① サーフェス - 背景レイヤー
const Surface: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-cream-50 relative overflow-hidden">
    <div className="absolute inset-0 bg-pattern-dots opacity-50" />
    {children}
  </div>
);

// ⑮ ソート・ドロップダウンメニュー（右上に配置）
const SortDropdown: React.FC<{
  value: 'newest' | 'oldest' | 'violations';
  onChange: (value: 'newest' | 'oldest' | 'violations') => void;
}> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const options = [
    { value: 'newest' as const, label: '新しい順' },
    { value: 'oldest' as const, label: '古い順' },
    { value: 'violations' as const, label: '違反が多い順' },
  ];

  const selected = options.find(o => o.value === value);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`
          flex items-center gap-2 px-4 py-2.5 rounded-full
          bg-white shadow-soft text-sm font-medium text-stone-600
          transition-all duration-300 cursor-pointer
          ${isOpen ? 'shadow-soft-lg ring-2 ring-sage-200' : 'hover:shadow-soft-lg'}
        `}
      >
        <span>{selected?.label}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
            className="absolute top-full right-0 mt-2 w-44 bg-white rounded-2xl shadow-soft-xl overflow-hidden z-50"
          >
            <div className="py-2">
              {options.map(option => (
                <button
                  key={option.value}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-sage-50 ${
                    value === option.value ? 'text-sage-600' : 'text-stone-600'
                  }`}
                >
                  <span>{option.label}</span>
                  {value === option.value && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <Check className="w-4 h-4" />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ⑬ 動的ステータスカード・リスト（⑭を内包）
const IpStatusCard: React.FC<{
  work: IPWork;
  onClick: () => void;
  index: number;
}> = ({ work, onClick, index }) => {
  const getStatusConfig = () => {
    switch (work.status) {
      case 'safe':
        return {
          cardBg: 'bg-gradient-to-br from-warm-success/10 to-warm-success/5',
          cardBorder: 'border-warm-success/40',
          badgeBg: 'bg-warm-success',
          badgeText: 'text-white',
          label: '安全',
          icon: Shield,
          iconBg: 'bg-warm-success',
          glowColor: 'shadow-warm-success/20',
        };
      case 'warning':
        return {
          cardBg: 'bg-gradient-to-br from-amber-100 to-amber-50',
          cardBorder: 'border-amber-400',
          badgeBg: 'bg-amber-500',
          badgeText: 'text-white',
          label: '注意',
          icon: AlertTriangle,
          iconBg: 'bg-amber-500',
          glowColor: 'shadow-amber-500/20',
        };
      case 'danger':
        return {
          cardBg: 'bg-gradient-to-br from-rose-100 to-rose-50',
          cardBorder: 'border-rose-400',
          badgeBg: 'bg-rose-500',
          badgeText: 'text-white',
          label: '要対応',
          icon: AlertTriangle,
          iconBg: 'bg-rose-500',
          glowColor: 'shadow-rose-500/30',
        };
    }
  };

  const status = getStatusConfig();
  const StatusIcon = status.icon;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.34, 1.56, 0.64, 1] }}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className={`
        cursor-pointer overflow-hidden
        rounded-3xl ${status.cardBg} border-2 ${status.cardBorder}
        shadow-soft transition-all duration-300
        hover:shadow-soft-lg hover:${status.glowColor}
        ${work.status === 'danger' ? 'ring-2 ring-rose-300/30' : ''}
        ${work.status === 'warning' ? 'ring-2 ring-amber-300/30' : ''}
      `}
    >
      {/* ⑭ サムネイル・ナビゲーター（カード内上部） */}
      <div className="relative aspect-square overflow-hidden">
        <motion.img
          src={work.thumbnail}
          alt={work.title}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.4 }}
        />
        
        {/* オーバーレイ */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
        
        {/* ステータスバッジ */}
        <div className="absolute top-3 right-3">
          <span className={`${status.badgeBg} ${status.badgeText} px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {status.label}
          </span>
        </div>

        {/* 違反カウント */}
        {work.violationCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            {work.violationCount}件の違反
          </motion.div>
        )}

        {/* ホバー時の「詳細を見る」 */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
          <div className="px-4 py-2 rounded-full bg-white/90 text-stone-700 text-sm font-medium shadow-lg flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            詳細を見る
          </div>
        </div>
      </div>

      {/* カード内容 */}
      <div className="p-4">
        <h3 className={`text-sm font-bold truncate mb-3 ${
          work.status === 'danger' ? 'text-rose-800' :
          work.status === 'warning' ? 'text-amber-800' :
          'text-stone-700'
        }`}>
          {work.title}
        </h3>
        
        <div className="flex items-center justify-between text-xs">
          <div className={`flex items-center gap-1.5 ${
            work.status === 'danger' ? 'text-rose-600/70' :
            work.status === 'warning' ? 'text-amber-600/70' :
            'text-stone-400'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{formatDate(work.createdAt)}</span>
          </div>
          <div className={`flex items-center gap-1.5 ${
            work.status === 'danger' ? 'text-rose-600/70' :
            work.status === 'warning' ? 'text-amber-600/70' :
            'text-stone-400'
          }`}>
            <Scan className="w-3.5 h-3.5" />
            <span>{formatDate(work.lastScanned)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ⑦ フローティング・アクション・ボタン（下部中央、No.1へ戻る）
const FloatingActionButtonBottom: React.FC<{
  onClick: () => void;
}> = ({ onClick }) => (
  <motion.button
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
    whileHover={{ scale: 1.05, y: -3 }}
    whileTap={{ scale: 0.95 }}
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick();
    }}
    className="fixed bottom-8 left-1/2 -translate-x-1/2 px-8 py-4 rounded-full bg-sage-500 text-white shadow-soft-xl flex items-center gap-3 z-[100] cursor-pointer hover:bg-sage-600"
  >
    <ArrowLeft className="w-5 h-5" />
    <span className="text-sm font-medium">アップロードに戻る</span>
  </motion.button>
);

// ============ メインコンポーネント ============
export const GalleryView: React.FC<GalleryViewProps> = ({ works, onBack, onWorkClick }) => {
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'violations'>('newest');

  const sortedWorks = useMemo(() => {
    const sorted = [...works];
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      case 'oldest':
        return sorted.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      case 'violations':
        return sorted.sort((a, b) => {
          const statusOrder = { danger: 0, warning: 1, safe: 2 };
          if (statusOrder[a.status] !== statusOrder[b.status]) {
            return statusOrder[a.status] - statusOrder[b.status];
          }
          return b.violationCount - a.violationCount;
        });
      default:
        return sorted;
    }
  }, [works, sortBy]);

  const stats = {
    total: works.length,
    safe: works.filter(w => w.status === 'safe').length,
    warning: works.filter(w => w.status === 'warning').length,
    danger: works.filter(w => w.status === 'danger').length,
  };

  return (
    <Surface>
      <div className="min-h-screen px-6 py-12 pb-32 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* ヘッダー */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
          >
            <div className="flex items-center gap-4">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onBack();
                }}
                className="w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center text-stone-500 hover:shadow-soft-lg transition-shadow cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-stone-700">作品一覧</h1>
                <p className="text-sm text-stone-400">{stats.total}件の作品を監視中</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* 統計サマリー */}
              <div className="hidden sm:flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1.5 rounded-full bg-warm-success text-white font-medium">
                  安全 {stats.safe}
                </span>
                {stats.warning > 0 && (
                  <span className="px-2.5 py-1.5 rounded-full bg-amber-500 text-white font-medium">
                    注意 {stats.warning}
                  </span>
                )}
                {stats.danger > 0 && (
                  <span className="px-2.5 py-1.5 rounded-full bg-rose-500 text-white font-medium">
                    要対応 {stats.danger}
                  </span>
                )}
              </div>

              {/* ⑮ ソート・ドロップダウンメニュー（右上） */}
              <SortDropdown value={sortBy} onChange={setSortBy} />
            </div>
          </motion.div>

          {/* ⑬ 動的ステータスカード・リスト（グリッド配置） */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
          >
            {sortedWorks.map((work, index) => (
              <IpStatusCard
                key={work.id}
                work={work}
                onClick={() => onWorkClick(work)}
                index={index}
              />
            ))}
          </motion.div>

          {/* 空の状態 */}
          {works.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-3xl bg-white shadow-soft p-12 text-center"
            >
              <p className="text-stone-400">作品がありません</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* ⑦ フローティング・アクション・ボタン（下部中央） */}
      <FloatingActionButtonBottom onClick={onBack} />
    </Surface>
  );
};
