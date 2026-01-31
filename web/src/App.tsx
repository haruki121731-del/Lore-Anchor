import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { UploadView } from '@/views/UploadView';
import { ResultsView } from '@/views/ResultsView';
import { GalleryView } from '@/views/GalleryView';
import { WorkDetailView } from '@/views/WorkDetailView';
import type { ViewState, SearchResult, IPWork, WhitelistItem } from '@/types';
import { scanImage } from '@/services/api';

// Mock data for demonstration
const mockSearchResults: SearchResult[] = [
  {
    id: '1',
    title: '無断転載まとめ速報',
    url: 'https://kangaipakattena-matome.com/entry/123',
    domain: 'kangaipakattena-matome.com',
    status: 'suspicious',
    similarity: 92,
  },
  {
    id: '2',
    title: 'My Tweet - Twitter',
    url: 'https://twitter.com/my_account/status/1',
    domain: 'twitter.com',
    status: 'safe',
    similarity: 100,
  },
  {
    id: '3',
    title: 'フリー画像ギャラリー',
    url: 'https://suspicious-site.net/gallery/img456',
    domain: 'suspicious-site.net',
    status: 'suspicious',
    similarity: 78,
  },
  {
    id: '4',
    title: 'Pixiv Artwork',
    url: 'https://pixiv.net/artworks/98765432',
    domain: 'pixiv.net',
    status: 'safe',
    similarity: 100,
  },
];

const mockWorks: IPWork[] = [
  {
    id: '1',
    title: '幻想風景イラスト',
    thumbnail: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=400&fit=crop',
    createdAt: new Date('2024-01-15'),
    status: 'safe',
    violationCount: 0,
    lastScanned: new Date('2024-01-30'),
  },
  {
    id: '2',
    title: 'キャラクターデザイン',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop',
    createdAt: new Date('2024-01-10'),
    status: 'danger',
    violationCount: 3,
    lastScanned: new Date('2024-01-29'),
  },
  {
    id: '3',
    title: '背景アート',
    thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
    createdAt: new Date('2024-01-05'),
    status: 'warning',
    violationCount: 1,
    lastScanned: new Date('2024-01-28'),
  },
  {
    id: '4',
    title: 'コンセプトアート',
    thumbnail: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=400&h=400&fit=crop',
    createdAt: new Date('2024-01-01'),
    status: 'safe',
    violationCount: 0,
    lastScanned: new Date('2024-01-25'),
  },
  {
    id: '5',
    title: 'ファンタジーイラスト',
    thumbnail: 'https://images.unsplash.com/photo-1633511090164-b43840ea9907?w=400&h=400&fit=crop',
    createdAt: new Date('2023-12-28'),
    status: 'safe',
    violationCount: 0,
    lastScanned: new Date('2024-01-24'),
  },
  {
    id: '6',
    title: 'ポートレート',
    thumbnail: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
    createdAt: new Date('2023-12-20'),
    status: 'danger',
    violationCount: 5,
    lastScanned: new Date('2024-01-23'),
  },
];

function App() {
  const [currentView, setCurrentView] = useState<ViewState>('upload');
  const [scanResults, setScanResults] = useState<SearchResult[]>([]);
  const [works] = useState<IPWork[]>(mockWorks);
  const [selectedWork, setSelectedWork] = useState<IPWork | null>(null);
  const [lastScannedUrl, setLastScannedUrl] = useState('');



  // No.1 → No.2: スキャン実行
  const handleScan = useCallback(async (
    file: File,
    _plan: string,
    whitelist: WhitelistItem[]
  ) => {
    try {
      // API Call
      const results = await scanImage(file, whitelist);
      setScanResults(results);
      setLastScannedUrl(URL.createObjectURL(file));
      setCurrentView('results');
    } catch (error) {
      console.error("Scan failed", error);
      // Handle error (maybe show toast? For now just log)
    }
  }, []);

  // No.1 → No.3: 作品一覧へスキップ（ファイル未選択でも可）
  const handleSkipToGallery = useCallback(() => {
    setCurrentView('gallery');
  }, []);

  // No.3 → 作品詳細: 特定の作品を選択
  const handleWorkClick = useCallback((work: IPWork) => {
    setSelectedWork(work);
    setCurrentView('workDetail');
  }, []);

  // No.3 → No.2: 作品一覧から結果画面へ（ブラウザバック相当）
  const handleBackFromGallery = useCallback(() => {
    setCurrentView('results');
  }, []);

  // No.2 → No.1: アップロードに戻る
  const navigateToUpload = useCallback(() => {
    setCurrentView('upload');
  }, []);

  // No.2 → No.3: 作品一覧へ
  const navigateToGallery = useCallback(() => {
    setCurrentView('gallery');
  }, []);

  // 作品詳細 → No.3: 作品一覧に戻る
  const handleBackFromWorkDetail = useCallback(() => {
    setSelectedWork(null);
    setCurrentView('gallery');
  }, []);

  // 作品詳細 → No.1: アップロードに直接戻る
  const handleGoToUploadFromWorkDetail = useCallback(() => {
    setSelectedWork(null);
    setCurrentView('upload');
  }, []);

  return (
    <div className="min-h-screen bg-cream-50">
      <AnimatePresence mode="wait">
        {currentView === 'upload' && (
          <UploadView
            key="upload"
            onScan={handleScan}
            onSkipToGallery={handleSkipToGallery}
          />
        )}

        {currentView === 'results' && (
          <ResultsView
            key="results"
            results={scanResults}
            originalUrl={lastScannedUrl}
            onBack={navigateToUpload}
            onNext={navigateToGallery}
          />
        )}

        {currentView === 'gallery' && (
          <GalleryView
            key="gallery"
            works={works}
            onBack={handleBackFromGallery}
            onWorkClick={handleWorkClick}
          />
        )}

        {currentView === 'workDetail' && selectedWork && (
          <WorkDetailView
            key="workDetail"
            work={selectedWork}
            results={mockSearchResults}
            onBack={handleBackFromWorkDetail}
            onGoToUpload={handleGoToUploadFromWorkDetail}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
