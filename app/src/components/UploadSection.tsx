import { useState, useCallback, useRef } from 'react';
import { Upload, FileImage, FileAudio, FileVideo, Shield, Zap, Check, Loader2, Radar } from 'lucide-react';
import { useAppStore } from '@/store';
import { motion, AnimatePresence } from 'framer-motion';
import type { Work } from '@/types';

const acceptedTypes = {
  'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
  'audio/*': ['.mp3', '.wav', '.flac'],
  'video/*': ['.mp4', '.mov', '.webm'],
};

const maxFileSize = 500 * 1024 * 1024; // 500MB

export function UploadSection() {
  const { 
    uploadFile, 
    uploadPreview, 
    isUploading, 
    autoMonitor, 
    setUploadFile, 
    setAutoMonitor,
    setCurrentView,
    addWork,
  } = useAppStore();
  
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  
  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize) {
      return 'ファイルサイズは500MB以下にしてください';
    }
    
    const validExtensions = Object.values(acceptedTypes).flat();
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!validExtensions.includes(fileExt)) {
      return '対応していないファイル形式です';
    }
    
    return null;
  };
  
  const handleFile = (file: File) => {
    setError(null);
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    // プレビューURL作成
    const previewUrl = URL.createObjectURL(file);
    setUploadFile(file, previewUrl);
  };
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, []);
  
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };
  
  const handleScan = () => {
    if (!uploadFile) return;
    
    // モック作品作成
    const workType: Work['type'] = uploadFile.type.startsWith('image/') ? 'illustration' : 
                                    uploadFile.type.startsWith('audio/') ? 'music' : 'video';
    
    const newWork: Work = {
      id: `work-${Date.now()}`,
      userId: 'user-001',
      title: uploadFile.name.replace(/\.[^/.]+$/, ''),
      type: workType,
      fileUrl: uploadPreview || '',
      thumbnailUrl: (uploadFile.type.startsWith('image/') ? uploadPreview : 
        'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop') || undefined,
      autoMonitor,
      status: 'scanning',
      createdAt: new Date().toISOString(),
      infringementCount: 0,
    };
    
    addWork(newWork);
    
    // 3秒後に結果画面へ
    setTimeout(() => {
      setCurrentView('results');
    }, 1500);
  };
  
  const getFileIcon = () => {
    if (!uploadFile) return <FileImage className="w-12 h-12" />;
    
    if (uploadFile.type.startsWith('image/')) {
      return <FileImage className="w-12 h-12" />;
    } else if (uploadFile.type.startsWith('audio/')) {
      return <FileAudio className="w-12 h-12" />;
    } else {
      return <FileVideo className="w-12 h-12" />;
    }
  };
  
  return (
    <div className="section-lg">
      <div className="container-custom">
        {/* Hero */}
        <div className="mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-7xl font-black tracking-tighter leading-tight mb-6"
          >
            作品を<br />
            <span className="text-terracotta">保護</span>する
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-ink-faded max-w-xl leading-relaxed"
          >
            あなたの作品を登録し、インターネット上の無断転載を自動検知。
            DMCA削除要請を効率化します。
          </motion.p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Upload Zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                upload-zone cursor-pointer p-12 md:p-16 relative overflow-hidden
                ${isDragging ? 'border-ink bg-paper shadow-solid' : ''}
                ${uploadFile ? 'border-ink bg-paper' : ''}
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={Object.keys(acceptedTypes).join(',')}
                onChange={handleFileInput}
                className="hidden"
              />
              
              <AnimatePresence mode="wait">
                {uploadFile ? (
                  <motion.div
                    key="file-selected"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="text-center"
                  >
                    {uploadFile.type.startsWith('image/') && uploadPreview ? (
                      <img 
                        src={uploadPreview} 
                        alt="Preview" 
                        className="w-32 h-32 object-cover mx-auto mb-4 border-2 border-ink"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-paper-aged border-2 border-ink flex items-center justify-center mx-auto mb-4">
                        {getFileIcon()}
                      </div>
                    )}
                    <p className="font-bold tracking-tight text-lg">{uploadFile.name}</p>
                    <p className="text-ink-faded text-sm">
                      {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadFile(null, null);
                      }}
                      className="mt-4 text-terracotta text-sm font-bold hover:underline"
                    >
                      削除してやり直す
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="upload-prompt"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="text-center"
                  >
                    <div className="w-20 h-20 bg-ink text-paper flex items-center justify-center mx-auto mb-6">
                      <Upload className="w-10 h-10" />
                    </div>
                    <p className="font-bold tracking-tight text-xl mb-2">
                      ファイルをドラッグ＆ドロップ
                    </p>
                    <p className="text-ink-faded mb-6">
                      またはクリックして選択
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 text-micro text-ink-pale">
                      <span className="px-2 py-1 bg-paper-aged">PNG</span>
                      <span className="px-2 py-1 bg-paper-aged">JPG</span>
                      <span className="px-2 py-1 bg-paper-aged">GIF</span>
                      <span className="px-2 py-1 bg-paper-aged">WEBP</span>
                      <span className="px-2 py-1 bg-paper-aged">MP3</span>
                      <span className="px-2 py-1 bg-paper-aged">WAV</span>
                      <span className="px-2 py-1 bg-paper-aged">MP4</span>
                      <span className="px-2 py-1 bg-paper-aged">MOV</span>
                    </div>
                    <p className="text-micro text-ink-pale mt-4">
                      最大ファイルサイズ: 500MB
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 text-terracotta font-bold"
              >
                {error}
              </motion.p>
            )}
            
            {/* Auto Monitor Toggle */}
            <div className="mt-8 flex items-center justify-between p-6 border-2 border-ink bg-paper">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-forest/10 flex items-center justify-center">
                  <Radar className="w-5 h-5 text-forest" />
                </div>
                <div>
                  <p className="font-bold tracking-tight">自動監視を有効化</p>
                  <p className="text-sm text-ink-faded">24時間体制で侵害を検知</p>
                </div>
              </div>
              <button
                onClick={() => setAutoMonitor(!autoMonitor)}
                className={`
                  w-14 h-8 relative transition-colors duration-200
                  ${autoMonitor ? 'bg-forest' : 'bg-ink-pale'}
                `}
              >
                <span className={`
                  absolute top-1 w-6 h-6 bg-paper transition-transform duration-200
                  ${autoMonitor ? 'left-7' : 'left-1'}
                `} />
              </button>
            </div>
            
            {/* Scan Button */}
            <motion.button
              onClick={handleScan}
              disabled={!uploadFile || isUploading}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`
                w-full mt-8 py-5 font-black tracking-tight text-xl transition-all duration-200
                ${uploadFile && !isUploading
                  ? 'bg-ink text-paper hover:bg-ink-faded shadow-solid hover:shadow-solid-lg'
                  : 'bg-ink-pale text-paper cursor-not-allowed'
                }
              `}
            >
              {isUploading ? (
                <span className="flex items-center justify-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  スキャン中...
                </span>
              ) : (
                '侵害スキャンを開始'
              )}
            </motion.button>
          </motion.div>
          
          {/* Info Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Story Protocol Card */}
            <div className="card p-6 hover-lift">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gold/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight mb-2">
                    Story Protocol連携
                  </h3>
                  <p className="text-ink-faded text-sm leading-relaxed">
                    ブロックチェーン上に権利証明を発行し、改ざん不可能な証拠を残します。
                    将来の法的手続きで強力な証拠となります。
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-micro text-gold">
                    <Check className="w-4 h-4" />
                    <span>準備中</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              <div className="card p-5">
                <Zap className="w-6 h-6 text-terracotta mb-3" />
                <h4 className="font-bold tracking-tight mb-1">高速スキャン</h4>
                <p className="text-xs text-ink-faded">数分で世界中のサイトを検索</p>
              </div>
              <div className="card p-5">
                <Shield className="w-6 h-6 text-forest mb-3" />
                <h4 className="font-bold tracking-tight mb-1">法的対応</h4>
                <p className="text-xs text-ink-faded">DMCA削除要請テンプレート自動生成</p>
              </div>
            </div>
            
            {/* Stats Preview */}
            <div className="bg-ink text-paper p-6">
              <p className="text-micro text-paper/60 mb-4">これまでの保護実績</p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-3xl font-black tracking-tighter">12.5K</p>
                  <p className="text-xs text-paper/60">登録作品</p>
                </div>
                <div>
                  <p className="text-3xl font-black tracking-tighter text-terracotta">89K</p>
                  <p className="text-xs text-paper/60">検知侵害</p>
                </div>
                <div>
                  <p className="text-3xl font-black tracking-tighter text-forest">72%</p>
                  <p className="text-xs text-paper/60">削除率</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
