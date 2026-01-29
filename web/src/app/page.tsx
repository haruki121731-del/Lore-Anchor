'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Shield, ExternalLink, Sparkles } from 'lucide-react';
import Navigation from '@/components/layout/Navigation';
import FloatingButton from '@/components/layout/FloatingButton';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import FileUpload from '@/components/ui/FileUpload';
import Toggle from '@/components/ui/Toggle';
import Badge from '@/components/ui/Badge';
import { useAppStore } from '@/lib/store';

export default function IPRegistrationPage() {
  const router = useRouter();
  const { user, createWork, isUploading, uploadProgress } = useAppStore();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [autoMonitor, setAutoMonitor] = useState(false);

  const isPro = user?.plan === 'pro';

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    // Auto-generate title from filename
    if (!title) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setTitle(nameWithoutExt);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    const workTitle = title || selectedFile.name.replace(/\.[^/.]+$/, '');
    await createWork(selectedFile, workTitle, autoMonitor && isPro);
    router.push('/infringements');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="pt-24 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              IP登録
            </h1>
            <p className="text-gray-600">
              作品をアップロードして、インターネット上の侵害を検知します
            </p>
          </div>

          {/* Upload Card */}
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">
                作品ファイルをアップロード
              </h2>
            </CardHeader>
            <CardContent className="space-y-6">
              <FileUpload
                onFileSelect={handleFileSelect}
              />

              {selectedFile && (
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    作品タイトル
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="作品のタイトルを入力"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                  />
                </div>
              )}

              {/* Auto Monitor Toggle */}
              <div className={`p-4 rounded-lg ${isPro ? 'bg-purple-50' : 'bg-gray-50'}`}>
                <div className="flex items-start gap-3">
                  <Toggle
                    checked={autoMonitor && isPro}
                    onChange={setAutoMonitor}
                    disabled={!isPro}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        自動監視を有効化
                      </span>
                      <Badge variant="pro" size="sm">PRO</Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      24時間ごとに自動でスキャンを実行し、新しい侵害を検知した場合に通知します
                    </p>
                    {!isPro && (
                      <p className="text-xs text-purple-600 mt-2">
                        Proプランにアップグレードして自動監視を有効化
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">アップロード中...</span>
                    <span className="font-medium text-blue-600">{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={!selectedFile || isUploading}
                isLoading={isUploading}
                leftIcon={<Search className="w-4 h-4" />}
                size="lg"
                className="w-full"
              >
                侵害スキャンを開始
              </Button>
            </CardContent>
          </Card>

          {/* Story Protocol Card */}
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
            <CardContent className="py-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <Shield className="w-8 h-8 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Story Protocol 連携
                    </h3>
                    <Badge variant="info" size="sm">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Coming Soon
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    ブロックチェーン上で著作権を証明。改ざん不可能な権利証明書を発行し、
                    法的効力を持つデジタル証拠として活用できます。
                  </p>
                  <a
                    href="https://www.story.foundation/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    Story Protocol について詳しく
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage Limit Info (Free users) */}
          {!isPro && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                無料プラン: 月5件まで登録可能
              </p>
              <a
                href="#"
                className="text-sm font-medium text-purple-600 hover:text-purple-700"
              >
                Proプランにアップグレード →
              </a>
            </div>
          )}
        </div>
      </main>

      <FloatingButton href="/monitor" label="自動監視を確認" />
    </div>
  );
}
