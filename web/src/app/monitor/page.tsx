'use client';

import { useRouter } from 'next/navigation';
import {
  Radar,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Eye,
  Image as ImageIcon,
  Music,
  Video
} from 'lucide-react';
import Navigation from '@/components/layout/Navigation';
import { Card, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import StatCard from '@/components/ui/StatCard';
import { useAppStore } from '@/lib/store';
import type { WorkWithInfringements, WorkType } from '@/types/database';

export default function MonitorPage() {
  const router = useRouter();
  const { works, getMonitorStats } = useAppStore();
  const stats = getMonitorStats();

  const getWorkTypeIcon = (type: WorkType) => {
    switch (type) {
      case 'illustration':
        return <ImageIcon className="w-4 h-4" />;
      case 'music':
        return <Music className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      default:
        return <ImageIcon className="w-4 h-4" />;
    }
  };

  const getCardStyles = (work: WorkWithInfringements) => {
    if (work.status === 'infringed') {
      return {
        border: 'border-2 border-red-500',
        overlay: 'absolute inset-0 bg-red-500/10 rounded-t-lg',
        badge: (
          <Badge variant="danger" className="absolute top-3 left-3">
            {work.infringement_count}件の侵害
          </Badge>
        ),
      };
    }

    if (work.status === 'scanning') {
      return {
        border: 'border border-gray-200',
        overlay: 'absolute inset-0 bg-black/40 rounded-t-lg flex items-center justify-center',
        badge: (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-lg">
            <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
            <span className="text-sm font-medium text-gray-800">スキャン中</span>
          </div>
        ),
      };
    }

    return {
      border: 'border border-gray-200',
      overlay: null,
      badge: (
        <Badge variant="success" className="absolute top-3 left-3">
          安全
        </Badge>
      ),
    };
  };

  const formatLastScanned = (dateString: string | null) => {
    if (!dateString) return '未スキャン';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return '1時間以内';
    if (diffHours < 24) return `${diffHours}時間前`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return '昨日';
    if (diffDays < 7) return `${diffDays}日前`;

    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
    });
  };

  const handleCardClick = (work: WorkWithInfringements) => {
    if (work.status === 'infringed') {
      router.push('/infringements');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">
                自動監視
              </h1>
              <Badge variant="pro">PRO</Badge>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-green-700">監視中</span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="監視中"
              value={stats.monitoring}
              icon={<Eye className="w-6 h-6" />}
              variant="info"
            />
            <StatCard
              label="侵害検知"
              value={stats.infringed}
              icon={<AlertTriangle className="w-6 h-6" />}
              variant="danger"
            />
            <StatCard
              label="安全"
              value={stats.safe}
              icon={<CheckCircle className="w-6 h-6" />}
              variant="success"
            />
            <StatCard
              label="スキャン中"
              value={stats.scanning}
              icon={<Loader2 className="w-6 h-6" />}
              variant="default"
            />
          </div>

          {/* Works Grid */}
          {works.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {works.map((work) => {
                const styles = getCardStyles(work);
                const isClickable = work.status === 'infringed';

                return (
                  <Card
                    key={work.id}
                    className={`overflow-hidden ${styles.border} ${
                      isClickable ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''
                    }`}
                    onClick={() => isClickable && handleCardClick(work)}
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-[4/3] bg-gray-100">
                      <img
                        src={work.thumbnail_url}
                        alt={work.title}
                        className="w-full h-full object-cover"
                      />

                      {/* Overlay */}
                      {styles.overlay && (
                        <div className={styles.overlay}>
                          {work.status === 'scanning' && styles.badge}
                        </div>
                      )}

                      {/* Status Badge */}
                      {work.status !== 'scanning' && styles.badge}

                      {/* Auto Monitor Indicator */}
                      {work.auto_monitor && (
                        <div className="absolute top-3 right-3 p-1.5 bg-white/90 rounded-full shadow-sm">
                          <Radar className="w-4 h-4 text-purple-600" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-medium text-gray-900 line-clamp-1">
                          {work.title}
                        </h3>
                        <div className="flex items-center gap-1 text-gray-400">
                          {getWorkTypeIcon(work.type)}
                        </div>
                      </div>

                      <p className="text-sm text-gray-500">
                        最終スキャン: {formatLastScanned(work.last_scanned_at)}
                      </p>

                      {work.status === 'infringed' && (
                        <p className="text-sm text-red-600 mt-2 font-medium">
                          クリックして詳細を確認 →
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Radar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  監視中の作品がありません
                </h3>
                <p className="text-gray-500 mb-4">
                  IP登録画面から作品を登録して、自動監視を開始しましょう
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  作品を登録する
                </button>
              </CardContent>
            </Card>
          )}

          {/* Info Box */}
          <div className="mt-8 p-4 bg-purple-50 border border-purple-200 rounded-xl">
            <div className="flex items-start gap-3">
              <Radar className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-purple-900 mb-1">
                  自動監視について
                </h4>
                <p className="text-sm text-purple-700">
                  Proプランでは、登録した作品を24時間ごとに自動スキャンします。
                  新しい侵害が検知された場合、メールで通知されます。
                  作品カードの右上に
                  <Radar className="w-4 h-4 inline mx-1 text-purple-600" />
                  アイコンが表示されている作品が監視対象です。
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
