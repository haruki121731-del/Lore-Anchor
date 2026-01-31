import { SearchResult, WhitelistItem } from '@/types';

const API_BASE = 'http://localhost:8000';

export async function scanImage(file: File, whitelist: WhitelistItem[]): Promise<SearchResult[]> {
  const formData = new FormData();
  formData.append('file', file);
  
  const enabledDomains = whitelist.filter(w => w.enabled).map(w => w.domain).join(',');
  formData.append('whitelist', enabledDomains);

  try {
    const response = await fetch(`${API_BASE}/scan`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Scan failed: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.status === 'success') {
      return data.results as SearchResult[];
    }
    return [];
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
