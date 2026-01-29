// Database types for Lore-Anchor

export type WorkType = 'illustration' | 'music' | 'video';
export type WorkStatus = 'scanning' | 'safe' | 'infringed';
export type InfringementStatus = 'pending' | 'sent' | 'resolved' | 'false_positive';
export type UserPlan = 'free' | 'pro';

export interface User {
  id: string;
  email: string;
  name: string;
  plan: UserPlan;
  created_at: string;
}

export interface Work {
  id: string;
  user_id: string;
  title: string;
  type: WorkType;
  file_url: string;
  file_hash: string;
  thumbnail_url: string;
  auto_monitor: boolean;
  status: WorkStatus;
  created_at: string;
  last_scanned_at: string | null;
}

export interface Infringement {
  id: string;
  work_id: string;
  site_url: string;
  site_name: string;
  similarity_score: number;
  status: InfringementStatus;
  detected_at: string;
  resolved_at: string | null;
}

// Extended types with relations
export interface WorkWithInfringements extends Work {
  infringements: Infringement[];
  infringement_count: number;
}

export interface InfringementWithWork extends Infringement {
  work: Work;
}

// API Request/Response types
export interface CreateWorkRequest {
  file: File;
  title: string;
  autoMonitor: boolean;
}

export interface CreateWorkResponse {
  workId: string;
  status: WorkStatus;
}

export interface UpdateInfringementRequest {
  status: InfringementStatus;
}

export interface TakedownTemplate {
  subject: string;
  body: string;
}

// Statistics types
export interface InfringementStats {
  pending: number;
  sent: number;
  resolved: number;
  total: number;
}

export interface MonitorStats {
  monitoring: number;
  infringed: number;
  safe: number;
  scanning: number;
}
