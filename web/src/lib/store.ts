import { create } from 'zustand';
import type { User, Work, Infringement, WorkWithInfringements, InfringementWithWork, InfringementStats, MonitorStats } from '@/types/database';

// Mock user data
const mockUser: User = {
  id: 'user-001',
  email: 'creator@example.com',
  name: '山田太郎',
  plan: 'pro',
  created_at: new Date().toISOString(),
};

// Mock works data
const mockWorks: WorkWithInfringements[] = [
  {
    id: 'work-001',
    user_id: 'user-001',
    title: '夕焼けの風景画',
    type: 'illustration',
    file_url: '/uploads/work-001.jpg',
    file_hash: 'abc123',
    thumbnail_url: 'https://picsum.photos/seed/work1/400/300',
    auto_monitor: true,
    status: 'infringed',
    created_at: '2024-01-15T10:00:00Z',
    last_scanned_at: '2024-01-28T14:30:00Z',
    infringements: [],
    infringement_count: 3,
  },
  {
    id: 'work-002',
    user_id: 'user-001',
    title: 'オリジナルキャラクターイラスト',
    type: 'illustration',
    file_url: '/uploads/work-002.jpg',
    file_hash: 'def456',
    thumbnail_url: 'https://picsum.photos/seed/work2/400/300',
    auto_monitor: true,
    status: 'safe',
    created_at: '2024-01-10T08:00:00Z',
    last_scanned_at: '2024-01-28T12:00:00Z',
    infringements: [],
    infringement_count: 0,
  },
  {
    id: 'work-003',
    user_id: 'user-001',
    title: 'BGM - Peaceful Morning',
    type: 'music',
    file_url: '/uploads/work-003.mp3',
    file_hash: 'ghi789',
    thumbnail_url: 'https://picsum.photos/seed/work3/400/300',
    auto_monitor: true,
    status: 'scanning',
    created_at: '2024-01-25T16:00:00Z',
    last_scanned_at: null,
    infringements: [],
    infringement_count: 0,
  },
  {
    id: 'work-004',
    user_id: 'user-001',
    title: '春の花イラスト集',
    type: 'illustration',
    file_url: '/uploads/work-004.jpg',
    file_hash: 'jkl012',
    thumbnail_url: 'https://picsum.photos/seed/work4/400/300',
    auto_monitor: false,
    status: 'safe',
    created_at: '2024-01-20T09:00:00Z',
    last_scanned_at: '2024-01-27T10:00:00Z',
    infringements: [],
    infringement_count: 0,
  },
  {
    id: 'work-005',
    user_id: 'user-001',
    title: 'ファンタジー風景画',
    type: 'illustration',
    file_url: '/uploads/work-005.jpg',
    file_hash: 'mno345',
    thumbnail_url: 'https://picsum.photos/seed/work5/400/300',
    auto_monitor: true,
    status: 'infringed',
    created_at: '2024-01-05T11:00:00Z',
    last_scanned_at: '2024-01-28T08:00:00Z',
    infringements: [],
    infringement_count: 2,
  },
  {
    id: 'work-006',
    user_id: 'user-001',
    title: 'サイバーパンク都市',
    type: 'illustration',
    file_url: '/uploads/work-006.jpg',
    file_hash: 'pqr678',
    thumbnail_url: 'https://picsum.photos/seed/work6/400/300',
    auto_monitor: true,
    status: 'safe',
    created_at: '2024-01-22T14:00:00Z',
    last_scanned_at: '2024-01-28T15:00:00Z',
    infringements: [],
    infringement_count: 0,
  },
];

// Mock infringements data
const mockInfringements: InfringementWithWork[] = [
  {
    id: 'inf-001',
    work_id: 'work-001',
    site_url: 'https://illegal-gallery.net/image/12345',
    site_name: 'illegal-gallery.net',
    similarity_score: 98.5,
    status: 'pending',
    detected_at: '2024-01-28T10:00:00Z',
    resolved_at: null,
    work: mockWorks[0],
  },
  {
    id: 'inf-002',
    work_id: 'work-001',
    site_url: 'https://free-wallpaper.com/dl/67890',
    site_name: 'free-wallpaper.com',
    similarity_score: 95.2,
    status: 'sent',
    detected_at: '2024-01-27T15:00:00Z',
    resolved_at: null,
    work: mockWorks[0],
  },
  {
    id: 'inf-003',
    work_id: 'work-001',
    site_url: 'https://matome-blog.jp/article/99999',
    site_name: 'matome-blog.jp',
    similarity_score: 92.8,
    status: 'resolved',
    detected_at: '2024-01-20T08:00:00Z',
    resolved_at: '2024-01-25T12:00:00Z',
    work: mockWorks[0],
  },
  {
    id: 'inf-004',
    work_id: 'work-005',
    site_url: 'https://pirated-art.ru/gallery/54321',
    site_name: 'pirated-art.ru',
    similarity_score: 97.3,
    status: 'pending',
    detected_at: '2024-01-28T06:00:00Z',
    resolved_at: null,
    work: mockWorks[4],
  },
  {
    id: 'inf-005',
    work_id: 'work-005',
    site_url: 'https://image-dump.xyz/i/11111',
    site_name: 'image-dump.xyz',
    similarity_score: 89.1,
    status: 'pending',
    detected_at: '2024-01-26T20:00:00Z',
    resolved_at: null,
    work: mockWorks[4],
  },
];

interface AppState {
  // User
  user: User | null;
  isAuthenticated: boolean;

  // Works
  works: WorkWithInfringements[];
  isLoadingWorks: boolean;

  // Infringements
  infringements: InfringementWithWork[];
  isLoadingInfringements: boolean;

  // Upload state
  uploadProgress: number;
  isUploading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  fetchWorks: () => Promise<void>;
  fetchInfringements: () => Promise<void>;
  createWork: (file: File, title: string, autoMonitor: boolean) => Promise<string>;
  updateInfringementStatus: (id: string, status: InfringementWithWork['status']) => Promise<void>;
  getInfringementStats: () => InfringementStats;
  getMonitorStats: () => MonitorStats;
  startScan: (workId: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  user: mockUser,
  isAuthenticated: true,
  works: mockWorks,
  isLoadingWorks: false,
  infringements: mockInfringements,
  isLoadingInfringements: false,
  uploadProgress: 0,
  isUploading: false,

  // Actions
  setUser: (user) => set({ user, isAuthenticated: !!user }),

  fetchWorks: async () => {
    set({ isLoadingWorks: true });
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ works: mockWorks, isLoadingWorks: false });
  },

  fetchInfringements: async () => {
    set({ isLoadingInfringements: true });
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ infringements: mockInfringements, isLoadingInfringements: false });
  },

  createWork: async (file, title, autoMonitor) => {
    set({ isUploading: true, uploadProgress: 0 });

    // Simulate file upload with progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      set({ uploadProgress: i });
    }

    const workType = file.type.startsWith('image/') ? 'illustration'
      : file.type.startsWith('audio/') ? 'music'
      : 'video';

    const newWork: WorkWithInfringements = {
      id: `work-${Date.now()}`,
      user_id: get().user?.id || '',
      title,
      type: workType,
      file_url: URL.createObjectURL(file),
      file_hash: Math.random().toString(36).substring(7),
      thumbnail_url: workType === 'illustration' ? URL.createObjectURL(file) : 'https://picsum.photos/seed/new/400/300',
      auto_monitor: autoMonitor,
      status: 'scanning',
      created_at: new Date().toISOString(),
      last_scanned_at: null,
      infringements: [],
      infringement_count: 0,
    };

    set(state => ({
      works: [newWork, ...state.works],
      isUploading: false,
      uploadProgress: 0,
    }));

    return newWork.id;
  },

  updateInfringementStatus: async (id, status) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));

    set(state => ({
      infringements: state.infringements.map(inf =>
        inf.id === id
          ? { ...inf, status, resolved_at: status === 'resolved' ? new Date().toISOString() : inf.resolved_at }
          : inf
      ),
    }));
  },

  getInfringementStats: () => {
    const infringements = get().infringements;
    return {
      pending: infringements.filter(i => i.status === 'pending').length,
      sent: infringements.filter(i => i.status === 'sent').length,
      resolved: infringements.filter(i => i.status === 'resolved').length,
      total: infringements.length,
    };
  },

  getMonitorStats: () => {
    const works = get().works;
    const monitoringWorks = works.filter(w => w.auto_monitor);
    return {
      monitoring: monitoringWorks.length,
      infringed: works.filter(w => w.status === 'infringed').length,
      safe: works.filter(w => w.status === 'safe').length,
      scanning: works.filter(w => w.status === 'scanning').length,
    };
  },

  startScan: async (workId) => {
    // Set work to scanning
    set(state => ({
      works: state.works.map(w =>
        w.id === workId ? { ...w, status: 'scanning' } : w
      ),
    }));

    // Simulate scan process
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Randomly determine if infringements are found
    const hasInfringements = Math.random() > 0.5;

    set(state => ({
      works: state.works.map(w =>
        w.id === workId
          ? {
              ...w,
              status: hasInfringements ? 'infringed' : 'safe',
              last_scanned_at: new Date().toISOString(),
            }
          : w
      ),
    }));
  },
}));

// Utility function to generate takedown template
export function generateTakedownTemplate(
  infringement: Infringement,
  work: Work,
  user: User
): string {
  const createdDate = new Date(work.created_at).toLocaleDateString('ja-JP');

  return `件名: 著作権侵害に基づくコンテンツ削除要請 (DMCA Notice)

管理者様

私「${user.name}」は「${work.title}」の著作権者です。
貴サイト上の以下のURLにて、私の著作物が無断で公開されていることを確認しました。

■ 侵害コンテンツURL
${infringement.site_url}

■ オリジナル作品
タイトル: ${work.title}
登録日: ${createdDate}
権利証明: 発行準備中

DMCA（デジタルミレニアム著作権法）第512条に基づき、当該コンテンツの即時削除を要請いたします。

本通知の内容は誠実かつ正確であり、私が当該著作物の正当な権利者であることを宣誓いたします。

敬具
${user.name}
${user.email}
`;
}
