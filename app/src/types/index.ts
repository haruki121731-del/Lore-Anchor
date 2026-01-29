// 作品タイプ
export type WorkType = 'illustration' | 'music' | 'video';

// 作品ステータス
export type WorkStatus = 'scanning' | 'safe' | 'infringed';

// 侵害ステータス
export type InfringementStatus = 'pending' | 'sent' | 'resolved' | 'false_positive';

// ユーザープラン
export type UserPlan = 'free' | 'pro';

// ユーザー
export interface User {
  id: string;
  email: string;
  name: string;
  plan: UserPlan;
  createdAt: string;
}

// 作品
export interface Work {
  id: string;
  userId: string;
  title: string;
  type: WorkType;
  fileUrl: string;
  fileHash?: string;
  thumbnailUrl?: string;
  autoMonitor: boolean;
  status: WorkStatus;
  createdAt: string;
  lastScannedAt?: string;
  infringementCount?: number;
}

// 侵害
export interface Infringement {
  id: string;
  workId: string;
  siteUrl: string;
  siteName: string;
  similarityScore: number;
  status: InfringementStatus;
  detectedAt: string;
  resolvedAt?: string;
}

// 検索結果
export interface SearchResult {
  url: string;
  title: string;
  status: 'safe' | 'suspicious';
}

// 統計
export interface Statistics {
  total: number;
  safe: number;
  suspicious: number;
  pending: number;
  sent: number;
  resolved: number;
}

// 削除要請テンプレート
export interface TakedownTemplate {
  subject: string;
  body: string;
}

// ファイルアップロード状態
export interface UploadState {
  file: File | null;
  preview: string | null;
  isDragging: boolean;
}

// ナビゲーション状態
export type ViewState = 'upload' | 'results' | 'monitor';
