import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image as ImageIcon, X, ChevronDown, Plus, Check, Shield, ShieldCheck, LayoutGrid } from 'lucide-react';
import type { WhitelistItem } from '@/types';

interface UploadViewProps {
  onScan: (file: File, plan: 'normal' | 'pro', whitelist: WhitelistItem[]) => Promise<void>;
  onSkipToGallery: () => void;
}

// ① サーフェス - 背景レイヤー
const Surface: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-cream-50 relative overflow-hidden">
    <div className="absolute inset-0 bg-pattern-dots opacity-50" />
    {children}
  </div>
);

// ② ファイルアップローダー（チャットUI風横長）
const FileUploader: React.FC<{
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
}> = ({ selectedFile, onFileSelect }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) {
      onFileSelect(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }, [onFileSelect]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleClear = () => {
    onFileSelect(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  return (
    <div className="w-full max-w-2xl">
      {!selectedFile ? (
        <motion.label
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            flex items-center gap-4 px-6 py-5 
            rounded-3xl border-2 border-dashed cursor-pointer
            transition-all duration-300
            ${isDragOver
              ? 'border-sage-400 bg-sage-50/50 shadow-soft-lg'
              : 'border-sand-300 bg-white/80 hover:border-sage-300 hover:bg-sage-50/30'
            }
          `}
        >
          <input type="file" accept="image/*" onChange={handleFileInput} className="hidden" />
          <motion.div
            animate={{ y: isDragOver ? -4 : 0 }}
            className="w-12 h-12 rounded-2xl bg-sage-100 flex items-center justify-center flex-shrink-0"
          >
            <Upload className="w-5 h-5 text-sage-600" />
          </motion.div>
          <div className="flex-1">
            <p className="text-sm font-medium text-stone-700">作品をアップロード</p>
            <p className="text-xs text-stone-400 mt-0.5">ドラッグ＆ドロップまたはクリック</p>
          </div>
          <ImageIcon className="w-5 h-5 text-stone-300" />
        </motion.label>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-4 px-6 py-4 rounded-3xl bg-white shadow-soft"
        >
          <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0">
            {previewUrl && <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-stone-700 truncate">{selectedFile.name}</p>
            <p className="text-xs text-stone-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <button onClick={handleClear} className="w-8 h-8 rounded-full bg-cream-100 flex items-center justify-center hover:bg-warm-danger/20">
            <X className="w-4 h-4 text-stone-400" />
          </button>
        </motion.div>
      )}
    </div>
  );
};

// ③ トグルスイッチ（②の右端に配置）
const PlanToggle: React.FC<{
  plan: 'normal' | 'pro';
  onPlanChange: (plan: 'normal' | 'pro') => void;
}> = ({ plan, onPlanChange }) => {
  const isPro = plan === 'pro';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-2 bg-cream-100 rounded-full px-2 py-2"
    >
      <button
        onClick={() => onPlanChange('normal')}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${!isPro ? 'bg-white text-stone-700 shadow-soft' : 'text-stone-400'
          }`}
      >
        <Shield className="w-4 h-4" />
        <span>ノーマル</span>
      </button>

      <button
        onClick={() => onPlanChange(isPro ? 'normal' : 'pro')}
        className="relative w-14 h-7 rounded-full bg-sand-200 transition-colors"
      >
        <motion.div
          animate={{ x: isPro ? 28 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={`absolute top-1 w-5 h-5 rounded-full shadow-soft ${isPro ? 'bg-sage-500' : 'bg-white'}`}
        />
      </button>

      <button
        onClick={() => onPlanChange('pro')}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${isPro ? 'bg-sage-500 text-white shadow-soft' : 'text-stone-400'
          }`}
      >
        <ShieldCheck className="w-4 h-4" />
        <span>Pro</span>
      </button>
    </motion.div>
  );
};

// ④ ホワイトリスト（アコーディオン付き動的リスト）
const WhitelistAccordion: React.FC<{
  items: WhitelistItem[];
  onItemsChange: (items: WhitelistItem[]) => void;
}> = ({ items, onItemsChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const enabledCount = items.filter(i => i.enabled).length;

  const handleToggle = (id: string) => {
    onItemsChange(items.map(item =>
      item.id === id ? { ...item, enabled: !item.enabled } : item
    ));
  };

  const handleAdd = () => {
    if (newDomain.trim()) {
      onItemsChange([...items, { id: Date.now().toString(), domain: newDomain.trim(), enabled: true }]);
      setNewDomain('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl bg-cream-100 overflow-hidden"
    >
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sage-100 flex items-center justify-center">
            <span className="text-sage-600 text-sm font-bold">WL</span>
          </div>
          <div>
            <p className="text-sm font-medium text-stone-700">ホワイトリスト</p>
            <p className="text-xs text-stone-400">{enabledCount}件のドメインを許可</p>
          </div>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <ChevronDown className="w-5 h-5 text-stone-400" />
        </motion.div>
      </button>

      {isOpen && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          className="px-5 pb-4 space-y-3"
        >
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {items.map(item => (
              <div key={item.id} className="flex items-center gap-3">
                <button
                  onClick={() => handleToggle(item.id)}
                  className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${item.enabled ? 'bg-sage-400 border-sage-400' : 'border-sand-300'
                    }`}
                >
                  {item.enabled && <Check className="w-3 h-3 text-white" />}
                </button>
                <span className={`text-sm ${item.enabled ? 'text-stone-700' : 'text-stone-400'}`}>
                  {item.domain}
                </span>
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-2 border-t border-cream-200">
            <input
              type="text"
              value={newDomain}
              onChange={e => setNewDomain(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="ドメインを追加"
              className="flex-1 px-4 py-2.5 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sage-200"
            />
            <button
              onClick={handleAdd}
              disabled={!newDomain.trim()}
              className="w-10 h-10 rounded-xl bg-sage-400 text-white flex items-center justify-center disabled:opacity-40"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// ⑤ CTAボタン（GO）
const CTAButton: React.FC<{
  onClick: () => void;
  isLoading: boolean;
  disabled: boolean;
}> = ({ onClick, isLoading, disabled }) => (
  <motion.button
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled && !isLoading) {
        onClick();
      }
    }}
    disabled={disabled || isLoading}
    whileHover={!disabled && !isLoading ? { scale: 1.03 } : {}}
    whileTap={!disabled && !isLoading ? { scale: 0.97 } : {}}
    className={`
      px-10 py-4 rounded-full font-bold text-lg
      transition-all duration-300
      ${disabled || isLoading
        ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
        : 'bg-gradient-to-r from-sage-500 to-sage-400 text-white shadow-soft-lg hover:shadow-glow cursor-pointer'
      }
    `}
  >
    {isLoading ? (
      <span className="flex items-center gap-2">
        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        スキャン中...
      </span>
    ) : (
      'GO'
    )}
  </motion.button>
);

// ⑥ フローティング・アクション・ボタン（右端中央）- 作品一覧へ
const FloatingActionButton: React.FC<{
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
    className="fixed right-6 top-1/2 -translate-y-1/2 w-14 h-32 rounded-full bg-mist-500 text-white shadow-soft-xl flex flex-col items-center justify-center gap-2 z-[100] cursor-pointer hover:bg-mist-600"
  >
    <LayoutGrid className="w-6 h-6" />
    <span className="text-xs font-medium [writing-mode:vertical-rl]">作品一覧</span>
  </motion.button>
);

// ============ メインコンポーネント ============
export const UploadView: React.FC<UploadViewProps> = ({ onScan, onSkipToGallery }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [plan, setPlan] = useState<'normal' | 'pro'>('normal');
  const [whitelist, setWhitelist] = useState<WhitelistItem[]>([
    { id: '1', domain: 'twitter.com', enabled: true },
    { id: '2', domain: 'pixiv.net', enabled: true },
    { id: '3', domain: 'instagram.com', enabled: true },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleScan = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    try {
      await onScan(selectedFile, plan, whitelist);
    } catch (e) {
      console.error(e);
      setIsLoading(false); // Only set safe if we didn't switch views, but typically it's fine.
    }
  };

  return (
    <Surface>
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative z-10">
        {/* ヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-sage-400 to-sage-500 flex items-center justify-center shadow-soft-lg">
            <svg viewBox="0 0 24 24" className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-stone-700">Lore-Anchor</h1>
          <p className="text-stone-400 mt-1">あなたの作品をやさしく守ります</p>
        </motion.div>

        {/* メインコンテンツエリア */}
        <div className="w-full max-w-2xl space-y-6">
          {/* ② ファイルアップローダー（上部中央） */}
          <FileUploader selectedFile={selectedFile} onFileSelect={setSelectedFile} />

          {/* ③ トグルスイッチ（②の右端に相当する位置） */}
          <div className="flex justify-end">
            <PlanToggle plan={plan} onPlanChange={setPlan} />
          </div>

          {/* 下部レイアウト：④と⑤を横並び */}
          <div className="flex gap-4 items-start">
            {/* ④ ホワイトリスト（左下） */}
            <div className="flex-1">
              <WhitelistAccordion items={whitelist} onItemsChange={setWhitelist} />
            </div>

            {/* ⑤ CTAボタン（右下） */}
            <div className="flex-shrink-0 pt-1">
              <CTAButton
                onClick={handleScan}
                isLoading={isLoading}
                disabled={!selectedFile}
              />
            </div>
          </div>
        </div>

        {/* ヒントテキスト */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 text-xs text-stone-400 text-center"
        >
          右のボタンから作品一覧を確認できます
        </motion.p>
      </div>

      {/* ⑥ フローティング・アクション・ボタン（右端中央）- 常に有効 */}
      <FloatingActionButton onClick={onSkipToGallery} />
    </Surface>
  );
};
