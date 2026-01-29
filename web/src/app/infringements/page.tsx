'use client';

import { useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Copy,
  Check,
  ExternalLink,
  FileText,
  MailPlus
} from 'lucide-react';
import Navigation from '@/components/layout/Navigation';
import FloatingButton from '@/components/layout/FloatingButton';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import StatCard from '@/components/ui/StatCard';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from '@/components/ui/Accordion';
import { useAppStore, generateTakedownTemplate } from '@/lib/store';
import type { InfringementStatus } from '@/types/database';

export default function InfringementsPage() {
  const {
    infringements,
    user,
    getInfringementStats,
    updateInfringementStatus
  } = useAppStore();

  const stats = getInfringementStats();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getStatusIcon = (status: InfringementStatus) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'sent':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: InfringementStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="danger">未対応</Badge>;
      case 'sent':
        return <Badge variant="warning">送信済み</Badge>;
      case 'resolved':
        return <Badge variant="success">解決済み</Badge>;
      default:
        return <Badge>不明</Badge>;
    }
  };

  const handleCopyUrl = async (id: string, url: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyTemplate = async (id: string, template: string) => {
    await navigator.clipboard.writeText(template);
    setCopiedId(`template-${id}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleMarkAsSent = async (id: string) => {
    await updateInfringementStatus(id, 'sent');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="pt-24 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              侵害検知結果
            </h1>
            <p className="text-gray-600">
              検知された侵害コンテンツを確認し、削除要請を送信してください
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard
              label="未対応"
              value={stats.pending}
              icon={<AlertCircle className="w-6 h-6" />}
              variant="danger"
            />
            <StatCard
              label="送信済み"
              value={stats.sent}
              icon={<Clock className="w-6 h-6" />}
              variant="warning"
            />
            <StatCard
              label="解決済み"
              value={stats.resolved}
              icon={<CheckCircle className="w-6 h-6" />}
              variant="success"
            />
          </div>

          {/* Infringements List */}
          {infringements.length > 0 ? (
            <Card>
              <Accordion defaultOpen={[infringements[0]?.id || '']}>
                {infringements.map((infringement) => {
                  const template = user
                    ? generateTakedownTemplate(infringement, infringement.work, user)
                    : '';

                  return (
                    <AccordionItem key={infringement.id} id={infringement.id}>
                      <div className="px-6">
                        <AccordionTrigger id={infringement.id}>
                          <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
                            {getStatusIcon(infringement.status)}

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-900 truncate">
                                  {infringement.site_name}
                                </span>
                                {getStatusBadge(infringement.status)}
                              </div>
                              <p className="text-sm text-gray-500 truncate">
                                対象: {infringement.work.title}
                              </p>
                            </div>

                            <div className="hidden sm:flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">
                                  一致率 {infringement.similarity_score.toFixed(1)}%
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatDate(infringement.detected_at)}
                                </p>
                              </div>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyUrl(infringement.id, infringement.site_url);
                                }}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="URLをコピー"
                              >
                                {copiedId === infringement.id ? (
                                  <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        </AccordionTrigger>

                        <AccordionContent id={infringement.id}>
                          <div className="space-y-4 pl-9">
                            {/* URL Section */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                侵害コンテンツURL
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={infringement.site_url}
                                  readOnly
                                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 truncate"
                                />
                                <a
                                  href={infringement.site_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                  title="サイトを開く"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              </div>
                            </div>

                            {/* Takedown Template */}
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <FileText className="w-4 h-4 text-gray-500" />
                                <label className="text-sm font-medium text-gray-700">
                                  削除要請テンプレート
                                </label>
                              </div>
                              <div className="relative">
                                <textarea
                                  value={template}
                                  readOnly
                                  rows={10}
                                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 font-mono resize-none"
                                />
                                <button
                                  onClick={() =>
                                    handleCopyTemplate(infringement.id, template)
                                  }
                                  className="absolute top-2 right-2 flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                                >
                                  {copiedId === `template-${infringement.id}` ? (
                                    <>
                                      <Check className="w-4 h-4 text-green-500" />
                                      コピー完了
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-4 h-4" />
                                      コピー
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Actions */}
                            {infringement.status === 'pending' && (
                              <div className="flex items-center justify-end gap-3 pt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleCopyTemplate(infringement.id, template)
                                  }
                                  leftIcon={<Copy className="w-4 h-4" />}
                                >
                                  テンプレートをコピー
                                </Button>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleMarkAsSent(infringement.id)}
                                  leftIcon={<MailPlus className="w-4 h-4" />}
                                >
                                  送信済みにする
                                </Button>
                              </div>
                            )}

                            {infringement.status === 'sent' && (
                              <div className="flex items-center justify-end gap-3 pt-2">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() =>
                                    updateInfringementStatus(infringement.id, 'resolved')
                                  }
                                  leftIcon={<CheckCircle className="w-4 h-4" />}
                                >
                                  解決済みにする
                                </Button>
                              </div>
                            )}

                            {infringement.status === 'resolved' && infringement.resolved_at && (
                              <p className="text-sm text-green-600 pt-2">
                                {formatDate(infringement.resolved_at)} に解決済み
                              </p>
                            )}
                          </div>
                        </AccordionContent>
                      </div>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  侵害は検知されていません
                </h3>
                <p className="text-gray-500">
                  現在、登録された作品に対する侵害は見つかっていません。
                  <br />
                  自動監視を有効にして、継続的に監視することをおすすめします。
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <FloatingButton href="/monitor" label="自動監視を確認" />
    </div>
  );
}
