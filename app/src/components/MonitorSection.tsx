import { useState } from 'react';
import { Radar, Shield, AlertTriangle, CheckCircle, Loader2, Eye, EyeOff, MoreVertical, Trash2 } from 'lucide-react';
import { useAppStore } from '@/store';
import { motion, AnimatePresence } from 'framer-motion';
import type { Work, WorkStatus } from '@/types';

const statusConfig: Record<WorkStatus, { 
  label: string; 
  icon: typeof CheckCircle; 
  color: string; 
  bgColor: string;
  borderColor: string;
}> = {
  safe: { 
    label: '安全', 
    icon: CheckCircle, 
    color: 'text-forest',
    bgColor: 'bg-forest/10',
    borderColor: 'border-forest'
  },
  infringed: { 
    label: '侵害検知', 
    icon: AlertTriangle, 
    color: 'text-terracotta',
    bgColor: 'bg-terracotta',
    borderColor: 'border-terracotta'
  },
  scanning: { 
    label: 'スキャン中', 
    icon: Loader2, 
    color: 'text-ink-faded',
    bgColor: 'bg-ink-pale/20',
    borderColor: 'border-ink-pale'
  },
};

function WorkCard({ work, index }: { work: Work; index: number }) {
  const { getWorkInfringements, setCurrentView, setSelectedWorkId, deleteWork } = useAppStore();
  const [showMenu, setShowMenu] = useState(false);
  
  const infringements = getWorkInfringements(work.id);
  const pendingCount = infringements.filter(i => i.status === 'pending').length;
  const status = statusConfig[work.status];
  const StatusIcon = status.icon;
  
  const handleCardClick = () => {
    if (work.status === 'infringed') {
      setSelectedWorkId(work.id);
      setCurrentView('results');
    }
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('この作品を削除しますか？関連する侵害データも削除されます。')) {
      deleteWork(work.id);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index }}
      onClick={handleCardClick}
      className={`
        relative bg-paper border-2 overflow-hidden cursor-pointer transition-all duration-200
        ${work.status === 'infringed' 
          ? 'border-terracotta shadow-solid-terracotta hover:shadow-solid-lg' 
          : 'border-ink hover-lift'
        }
        ${work.status === 'scanning' ? 'opacity-80' : ''}
      `}
    >
      {/* Thumbnail */}
      <div className="relative aspect-square overflow-hidden">
        <img 
          src={work.thumbnailUrl} 
          alt={work.title}
          className="w-full h-full object-cover"
        />
        
        {/* Status Overlay */}
        {work.status === 'infringed' && (
          <div className="absolute inset-0 bg-terracotta/20" />
        )}
        
        {work.status === 'scanning' && (
          <div className="absolute inset-0 bg-ink/40 flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-paper animate-spin" />
          </div>
        )}
        
        {/* Auto Monitor Badge */}
        {work.autoMonitor && (
          <div className="absolute top-3 right-3 w-8 h-8 bg-forest text-white flex items-center justify-center">
            <div className="radar-ping">
              <Radar className="w-4 h-4" />
            </div>
          </div>
        )}
        
        {/* Infringement Count Badge */}
        {work.status === 'infringed' && pendingCount > 0 && (
          <div className="absolute top-3 left-3 bg-terracotta text-white px-3 py-1 font-black tracking-tighter">
            {pendingCount}件の侵害
          </div>
        )}
        
        {/* Menu Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="absolute bottom-3 right-3 w-8 h-8 bg-paper/90 flex items-center justify-center hover:bg-paper transition-colors"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
        
        {/* Dropdown Menu */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute bottom-12 right-3 bg-paper border-2 border-ink shadow-solid z-10"
            >
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 text-terracotta font-bold hover:bg-terracotta/10 w-full text-left"
              >
                <Trash2 className="w-4 h-4" />
                削除
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold tracking-tight truncate mb-2">{work.title}</h3>
        
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 ${status.bgColor} ${status.color} px-2 py-1`}>
            <StatusIcon className={`w-4 h-4 ${work.status === 'scanning' ? 'animate-spin' : ''}`} />
            <span className="text-xs font-bold">{status.label}</span>
          </div>
          
          <p className="text-micro text-ink-faded">
            {work.lastScannedAt 
              ? `最終スキャン: ${new Date(work.lastScannedAt).toLocaleDateString('ja-JP')}`
              : 'スキャン待ち'
            }
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function MonitorSection() {
  const { works, user, getStatistics, setCurrentView } = useAppStore();
  const stats = getStatistics();
  
  const [filter, setFilter] = useState<'all' | 'infringed' | 'safe' | 'scanning'>('all');
  
  const filteredWorks = works.filter(work => {
    if (filter === 'all') return true;
    return work.status === filter;
  });
  
  // ソート: 侵害検知を最優先、その後は作成日時の降順
  const sortedWorks = [...filteredWorks].sort((a, b) => {
    // 侵害検知を最上部に表示
    if (a.status === 'infringed' && b.status !== 'infringed') return -1;
    if (a.status !== 'infringed' && b.status === 'infringed') return 1;
    
    // 同じステータスなら作成日時の降順（新しい順）
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  
  return (
    <div className="section-lg">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-tight">
              自動<span className="text-forest">監視</span>
            </h1>
            {user?.plan === 'pro' && (
              <span className="badge-pro text-sm px-3 py-1">PRO</span>
            )}
          </div>
          
          <div className="flex items-center gap-3 text-ink-faded">
            <div className="w-3 h-3 bg-forest radar-ping" />
            <p>監視中 - 最終更新: {new Date().toLocaleString('ja-JP')}</p>
          </div>
        </motion.div>
        
        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-forest/10 flex items-center justify-center">
                <Eye className="w-5 h-5 text-forest" />
              </div>
              <p className="text-micro text-ink-faded">監視中</p>
            </div>
            <p className="text-3xl font-black tracking-tighter">{stats.monitoring}</p>
          </div>
          
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-terracotta/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-terracotta" />
              </div>
              <p className="text-micro text-ink-faded">侵害検知</p>
            </div>
            <p className="text-3xl font-black tracking-tighter text-terracotta">{stats.infringed}</p>
          </div>
          
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-forest/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-forest" />
              </div>
              <p className="text-micro text-ink-faded">安全</p>
            </div>
            <p className="text-3xl font-black tracking-tighter text-forest">{stats.safe}</p>
          </div>
          
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-ink-pale/20 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-ink-faded animate-spin" />
              </div>
              <p className="text-micro text-ink-faded">スキャン中</p>
            </div>
            <p className="text-3xl font-black tracking-tighter">{stats.scanning}</p>
          </div>
        </motion.div>
        
        {/* Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-2 mb-8"
        >
          {[
            { id: 'all', label: 'すべて', count: works.length },
            { id: 'infringed', label: '侵害検知', count: stats.infringed },
            { id: 'safe', label: '安全', count: stats.safe },
            { id: 'scanning', label: 'スキャン中', count: stats.scanning },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id as typeof filter)}
              className={`
                px-4 py-2 font-bold tracking-tight transition-all duration-200
                ${filter === item.id
                  ? 'bg-ink text-paper'
                  : 'bg-paper-aged text-ink-faded hover:text-ink'
                }
              `}
            >
              {item.label}
              <span className="ml-2 text-xs opacity-60">({item.count})</span>
            </button>
          ))}
        </motion.div>
        
        {/* Works Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {sortedWorks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedWorks.map((work, index) => (
                <WorkCard key={work.id} work={work} index={index} />
              ))}
            </div>
          ) : (
            <div className="card p-16 text-center">
              <div className="w-20 h-20 bg-ink-pale/20 flex items-center justify-center mx-auto mb-6">
                <EyeOff className="w-10 h-10 text-ink-pale" />
              </div>
              <h3 className="text-2xl font-black tracking-tighter mb-2">
                該当する作品がありません
              </h3>
              <p className="text-ink-faded mb-6">
                フィルタ条件に一致する作品が見つかりませんでした。
              </p>
              <button
                onClick={() => setFilter('all')}
                className="btn-secondary"
              >
                すべて表示
              </button>
            </div>
          )}
        </motion.div>
        
        {/* Empty State CTA */}
        {works.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 text-center"
          >
            <p className="text-ink-faded mb-4">まだ作品が登録されていません</p>
            <button
              onClick={() => setCurrentView('upload')}
              className="btn-primary"
            >
              作品を登録する
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
