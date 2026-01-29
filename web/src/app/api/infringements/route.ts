import { NextRequest, NextResponse } from 'next/server';

// Mock infringements data
const mockInfringements = [
  {
    id: 'inf-001',
    work_id: 'work-001',
    site_url: 'https://illegal-gallery.net/image/12345',
    site_name: 'illegal-gallery.net',
    similarity_score: 98.5,
    status: 'pending',
    detected_at: '2024-01-28T10:00:00Z',
    resolved_at: null,
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
  },
];

// GET /api/infringements - Get all infringements
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const workId = searchParams.get('work_id');

    let filteredInfringements = [...mockInfringements];

    // Filter by status if provided
    if (status) {
      filteredInfringements = filteredInfringements.filter(
        (inf) => inf.status === status
      );
    }

    // Filter by work_id if provided
    if (workId) {
      filteredInfringements = filteredInfringements.filter(
        (inf) => inf.work_id === workId
      );
    }

    // Calculate stats
    const stats = {
      pending: mockInfringements.filter((i) => i.status === 'pending').length,
      sent: mockInfringements.filter((i) => i.status === 'sent').length,
      resolved: mockInfringements.filter((i) => i.status === 'resolved').length,
      total: mockInfringements.length,
    };

    return NextResponse.json({
      success: true,
      data: filteredInfringements,
      stats,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch infringements' },
      { status: 500 }
    );
  }
}
