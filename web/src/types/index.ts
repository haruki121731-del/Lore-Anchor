// 検索結果の型定義
export interface SearchResult {
  id: string;
  title: string;
  url: string;
  domain: string;
  status: 'safe' | 'suspicious' | 'unknown';
  similarity?: number;
  thumbnail?: string;
}

// 作品（IP）の型定義
export interface IPWork {
  id: string;
  title: string;
  thumbnail: string;
  createdAt: Date;
  status: 'safe' | 'warning' | 'danger';
  violationCount: number;
  lastScanned: Date;
}

// ホワイトリストアイテム
export interface WhitelistItem {
  id: string;
  domain: string;
  enabled: boolean;
}

// スキャン統計
export interface ScanStats {
  total: number;
  safe: number;
  suspicious: number;
  unknown: number;
}

// アプリ状態
export type ViewState = 'upload' | 'results' | 'gallery' | 'workDetail';

export type PlanType = 'normal' | 'pro';

// コンポーネントProps
export interface FileUploaderProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

export interface ProtectButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export interface IpCardProps {
  work: IPWork;
  onClick: () => void;
}

export interface ProtectionStatusProps {
  status: 'safe' | 'warning' | 'danger';
  count?: number;
}

export interface ResultCardProps {
  result: SearchResult;
  originalUrl: string;
}

export interface WhitelistAccordionProps {
  items: WhitelistItem[];
  onItemsChange: (items: WhitelistItem[]) => void;
}

export interface PlanToggleProps {
  plan: PlanType;
  onPlanChange: (plan: PlanType) => void;
}

export interface SortDropdownProps {
  value: 'newest' | 'oldest' | 'violations';
  onChange: (value: 'newest' | 'oldest' | 'violations') => void;
}
