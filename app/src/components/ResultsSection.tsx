import { useState } from 'react';
import { ChevronDown, Copy, Check, ExternalLink, AlertTriangle, Shield, Send, X, CheckCircle, Clock } from 'lucide-react';
import { useAppStore } from '@/store';
import { motion, AnimatePresence } from 'framer-motion';
import type { Infringement, InfringementStatus } from '@/types';

const statusConfig: Record<InfringementStatus, { label: string; icon: typeof Check; color: string; bgColor: string }> = {
  pending: { 
    label: '未対応', 
    icon: AlertTriangle, 
    color: 'text-terracotta',
    bgColor: 'bg-terracotta/10'
  },
  sent: { 
    label: '送信済み', 
    icon: Send, 
    color: 'text-gold',
    bgColor: 'bg-gold/10'
  },
  resolved: { 
    label: '解決済み', 
    icon: CheckCircle, 
    color: 'text-forest',
    bgColor: 'bg-forest/10'
  },
  false_positive: { 
    label: '誤検知', 
    icon: X, 
    color: 'text-ink-pale',
    bgColor: 'bg-ink-pale/10'
  },
};

function InfringementItem({ infringement }: { infringement: Infringement }) {
  const { works, updateInfringementStatus, generateTakedownTemplate } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const work = works.find(w => w.id === infringement.workId);
  const status = statusConfig[infringement.status];
  const StatusIcon = status.icon;
  
  const template = generateTakedownTemplate(infringement.id);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(template);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleStatusChange = (newStatus: InfringementStatus) => {
    updateInfringementStatus(infringement.id, newStatus);
  };
  
  return (
    <div className={`
      accordion-item
      ${infringement.status === 'pending' ? 'bg-terracotta/5' : ''}
    `}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="accordion-trigger px-6"
      >
        <div className="flex items-center gap-4 flex-1">
          <div className={`w-10 h-10 ${status.bgColor} flex items-center justify-center`}>
            <StatusIcon className={`w-5 h-5 ${status.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <p className="font-bold tracking-tight truncate">{infringement.siteName}</p>
              <span className={`text-xs px-2 py-0.5 ${status.bgColor} ${status.color}`}>
                {status.label}
              </span>
            </div>
            <p className="text-sm text-ink-faded truncate">{work?.title}</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-2xl font-black tracking-tighter text-terracotta">
                {infringement.similarityScore.toFixed(1)}%
              </p>
              <p className="text-micro text-ink-faded">一致率</p>
            </div>
            <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6">
              <div className="border-2 border-ink bg-paper-aged/30 p-4 mb-4">
                <p className="text-micro text-ink-faded mb-2">侵害URL</p>
                <div className="flex items-center gap-2">
                  <a 
                    href={infringement.siteUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-mono text-sm text-ink hover:text-terracotta truncate flex-1"
                  >
                    {infringement.siteUrl}
                  </a>
                  <a
                    href={infringement.siteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 bg-ink text-paper flex items-center justify-center hover:bg-ink-faded transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
              
              {/* Takedown Template */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-micro text-ink-faded">削除要請テンプレート</p>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-3 py-1 bg-ink text-paper text-sm font-bold hover:bg-ink-faded transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        コピー済み
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        コピー
                      </>
                    )}
                  </button>
                </div>
                <pre className="bg-ink text-paper p-4 font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap">
                  {template}
                </pre>
              </div>
              
              {/* Status Actions */}
              {infringement.status === 'pending' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleStatusChange('sent')}
                    className="flex-1 py-3 bg-gold text-ink font-bold tracking-tight hover:bg-gold/80 transition-colors"
                  >
                    送信済みにする
                  </button>
                  <button
                    onClick={() => handleStatusChange('false_positive')}
                    className="px-4 py-3 border-2 border-ink text-ink font-bold tracking-tight hover:bg-ink hover:text-paper transition-colors"
                  >
                    誤検知
                  </button>
                </div>
              )}
              
              {infringement.status === 'sent' && (
                <button
                  onClick={() => handleStatusChange('resolved')}
                  className="w-full py-3 bg-forest text-white font-bold tracking-tight hover:bg-forest/80 transition-colors"
                >
                  解決済みにする
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ResultsSection() {
  const { infringements, getStatistics, setCurrentView } = useAppStore();
  const stats = getStatistics();
  
  return (
    <div className="section-lg">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-tight mb-4">
            侵害<span className="text-terracotta">検知</span>結果
          </h1>
          <p className="text-xl text-ink-faded max-w-xl">
            検知された違法アップロードサイトの一覧です。
            削除要請テンプレートをコピーして対応してください。
          </p>
        </motion.div>
        
        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4 md:gap-6 mb-12"
        >
          <div className="card p-6 hover-lift">
            <div className="w-12 h-12 bg-terracotta/10 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-terracotta" />
            </div>
            <p className="text-4xl md:text-5xl font-black tracking-tighter text-terracotta mb-1">
              {stats.pendingInfringements}
            </p>
            <p className="text-micro text-ink-faded">未対応</p>
          </div>
          
          <div className="card p-6 hover-lift">
            <div className="w-12 h-12 bg-gold/10 flex items-center justify-center mb-4">
              <Send className="w-6 h-6 text-gold" />
            </div>
            <p className="text-4xl md:text-5xl font-black tracking-tighter text-gold mb-1">
              {stats.sentInfringements}
            </p>
            <p className="text-micro text-ink-faded">送信済み</p>
          </div>
          
          <div className="card p-6 hover-lift">
            <div className="w-12 h-12 bg-forest/10 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-forest" />
            </div>
            <p className="text-4xl md:text-5xl font-black tracking-tighter text-forest mb-1">
              {stats.resolvedInfringements}
            </p>
            <p className="text-micro text-ink-faded">解決済み</p>
          </div>
        </motion.div>
        
        {/* Infringements List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black tracking-tighter">
              検知された侵害
            </h2>
            <p className="text-ink-faded">
              全 <span className="font-bold text-ink">{infringements.length}</span> 件
            </p>
          </div>
          
          {infringements.length > 0 ? (
            <div className="border-2 border-ink bg-paper">
              {infringements.map((infringement, index) => (
                <motion.div
                  key={infringement.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <InfringementItem infringement={infringement} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center">
              <div className="w-16 h-16 bg-forest/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-forest" />
              </div>
              <h3 className="text-xl font-bold tracking-tight mb-2">
                侵害は検知されていません
              </h3>
              <p className="text-ink-faded">
                現在、あなたの作品に対する侵害は検知されていません。
              </p>
            </div>
          )}
        </motion.div>
        
        {/* Fixed CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-40"
        >
          <button
            onClick={() => setCurrentView('monitor')}
            className="btn-primary shadow-solid hover:shadow-solid-lg flex items-center gap-3"
          >
            <Clock className="w-5 h-5" />
            自動監視を確認
          </button>
        </motion.div>
      </div>
    </div>
  );
}
