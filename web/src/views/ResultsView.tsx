import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ExternalLink, Copy, Check, AlertTriangle, Shield, HelpCircle } from 'lucide-react';
import type { SearchResult } from '@/types';

interface ResultsViewProps {
  results: SearchResult[];
  originalUrl: string;
  onBack: () => void;
  onNext: () => void;
}

// ① サーフェス - 背景レイヤー
const Surface: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-cream-50 relative overflow-hidden">
    <div className="absolute inset-0 bg-pattern-dots opacity-50" />
    {children}
  </div>
);

// ⑧ カード型リストアイテム（⑨⑩⑪⑫を内包）
const ResultCard: React.FC<{
  result: SearchResult;
  originalUrl: string;
  index: number;
}> = ({ result, originalUrl, index }) => {
  const [copied, setCopied] = useState(false);

  const getStatusConfig = () => {
    switch (result.status) {
      case 'safe':
        return { 
          icon: Shield, 
          badgeClass: 'bg-warm-success text-white', 
          label: '安全', 
          cardBg: 'bg-white',
          cardBorder: 'border-warm-success/30',
          iconBg: 'bg-warm-success/15',
          iconColor: 'text-warm-success'
        };
      case 'suspicious':
        return { 
          icon: AlertTriangle, 
          badgeClass: 'bg-rose-500 text-white', 
          label: '要確認', 
          cardBg: 'bg-gradient-to-br from-rose-50 to-rose-100/50',
          cardBorder: 'border-rose-400',
          iconBg: 'bg-rose-500',
          iconColor: 'text-white'
        };
      default:
        return { 
          icon: HelpCircle, 
          badgeClass: 'bg-amber-400 text-white', 
          label: '不明', 
          cardBg: 'bg-white',
          cardBorder: 'border-amber-300',
          iconBg: 'bg-amber-100',
          iconColor: 'text-amber-600'
        };
    }
  };

  const status = getStatusConfig();
  const StatusIcon = status.icon;

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const text = `【著作権侵害に関する削除要請】\n\n対象URL: ${result.url}\n著作権者の正規投稿先: ${originalUrl}\n\n貴社/貴サイトの運営におかれましては、上記URLにて私の著作物が無断で掲載されていることを確認しました。\nこのコンテンツは私が著作権を有する作品であり、許可なく複製・配布されることは著作権法に違反します。\n\nつきましては、速やかに該当コンテンツの削除をお願い申し上げます。`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: [0.34, 1.56, 0.64, 1] }}
      className={`
        rounded-3xl border-2 ${status.cardBorder} ${status.cardBg} shadow-soft p-5 
        hover:shadow-soft-lg transition-all duration-300
        ${result.status === 'suspicious' ? 'ring-2 ring-rose-300/50' : ''}
      `}
    >
      {/* ⑨ テキストラベル/タイトル */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-xl ${status.iconBg} flex items-center justify-center flex-shrink-0`}>
            <StatusIcon className={`w-5 h-5 ${status.iconColor}`} />
          </div>
          <div className="min-w-0">
            <h4 className={`text-sm font-medium truncate ${result.status === 'suspicious' ? 'text-rose-800' : 'text-stone-700'}`}>
              {result.title}
            </h4>
            <p className={`text-xs truncate ${result.status === 'suspicious' ? 'text-rose-500/70' : 'text-stone-400'}`}>
              {result.domain}
            </p>
          </div>
        </div>
        {/* ⑩ ステータスバッジ付きテキストリンク */}
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.badgeClass}`}>
          {status.label}
        </span>
      </div>

      {/* 類似度バー */}
      {result.similarity !== undefined && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className={result.status === 'suspicious' ? 'text-rose-600/70' : 'text-stone-500'}>類似度</span>
            <span className={`font-bold ${
              result.similarity > 80 ? 'text-rose-600' : 
              result.similarity > 50 ? 'text-amber-600' : 
              'text-warm-success'
            }`}>
              {result.similarity}%
            </span>
          </div>
          <div className="h-2.5 bg-cream-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${result.similarity}%` }}
              transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
              className={`h-full rounded-full ${
                result.similarity > 80 ? 'bg-gradient-to-r from-rose-500 to-rose-600' : 
                result.similarity > 50 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 
                'bg-gradient-to-r from-sage-400 to-sage-500'
              }`}
            />
          </div>
        </div>
      )}

      {/* アクションボタン群 */}
      <div className="flex gap-2">
        {/* ⑫ 外部リンクアイコンボタン */}
        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className={`
            flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors
            ${result.status === 'suspicious' 
              ? 'bg-white/80 text-rose-700 hover:bg-white' 
              : 'bg-cream-100 text-stone-600 hover:bg-cream-200'
            }
          `}
        >
          <ExternalLink className="w-4 h-4" />
          サイトを開く
        </a>
        
        {/* ⑪ コピーアクションボタン */}
        {result.status === 'suspicious' && (
          <button
            onClick={handleCopy}
            className={`
              flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all
              ${copied 
                ? 'bg-warm-success text-white' 
                : 'bg-rose-500 text-white hover:bg-rose-600'
              }
            `}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'コピー完了' : '削除要請文'}
          </button>
        )}
      </div>
    </motion.div>
  );
};

// ⑥ フローティング・アクション・ボタン（右端中央）
const FloatingActionButtonRight: React.FC<{
  onClick: () => void;
}> = ({ onClick }) => (
  <motion.button
    initial={{ opacity: 0, x: 50 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
    whileHover={{ scale: 1.1, x: -5 }}
    whileTap={{ scale: 0.95 }}
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick();
    }}
    className="fixed right-6 top-1/2 -translate-y-1/2 w-14 h-32 rounded-full bg-sage-500 text-white shadow-soft-xl flex flex-col items-center justify-center gap-2 z-[100] cursor-pointer hover:bg-sage-600"
  >
    <ArrowRight className="w-6 h-6" />
    <span className="text-xs font-medium [writing-mode:vertical-rl]">次へ</span>
  </motion.button>
);

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
    className="fixed bottom-8 left-1/2 -translate-x-1/2 px-8 py-4 rounded-full bg-white text-stone-600 shadow-soft-xl flex items-center gap-3 z-[100] cursor-pointer hover:bg-cream-50"
  >
    <ArrowLeft className="w-5 h-5" />
    <span className="text-sm font-medium">アップロードに戻る</span>
  </motion.button>
);

// ============ メインコンポーネント ============
export const ResultsView: React.FC<ResultsViewProps> = ({ results, originalUrl, onBack, onNext }) => {
  const stats = {
    total: results.length,
    safe: results.filter(r => r.status === 'safe').length,
    suspicious: results.filter(r => r.status === 'suspicious').length,
  };

  return (
    <Surface>
      <div className="min-h-screen px-6 py-12 pb-32 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* ヘッダー */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-8"
          >
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
              <h1 className="text-xl font-bold text-stone-700">スキャン結果</h1>
              <p className="text-sm text-stone-400">類似画像の検索が完了しました</p>
            </div>
          </motion.div>

          {/* 統計 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-4 mb-8"
          >
            <div className="rounded-3xl bg-white shadow-soft p-5 text-center">
              <p className="text-2xl font-bold text-stone-700">{stats.total}</p>
              <p className="text-xs text-stone-400 mt-1">検出サイト</p>
            </div>
            <div className="rounded-3xl bg-white shadow-soft p-5 text-center">
              <p className="text-2xl font-bold text-warm-success">{stats.safe}</p>
              <p className="text-xs text-stone-400 mt-1">安全</p>
            </div>
            <div className="rounded-3xl bg-white shadow-soft p-5 text-center border-2 border-rose-200">
              <p className="text-2xl font-bold text-rose-500">{stats.suspicious}</p>
              <p className="text-xs text-rose-400 mt-1">要確認</p>
            </div>
          </motion.div>

          {/* ⑧ カード型リストアイテム（上部に2行相当のグリッド） */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((result, index) => (
              <ResultCard
                key={result.id}
                result={result}
                originalUrl={originalUrl}
                index={index}
              />
            ))}
          </div>

          {/* 空の状態 */}
          {results.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-3xl bg-white shadow-soft p-12 text-center"
            >
              <p className="text-stone-400">検索結果が見つかりませんでした</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* ⑥ フローティング・アクション・ボタン（右端中央） */}
      <FloatingActionButtonRight onClick={onNext} />

      {/* ⑦ フローティング・アクション・ボタン（下部中央） */}
      <FloatingActionButtonBottom onClick={onBack} />
    </Surface>
  );
};
