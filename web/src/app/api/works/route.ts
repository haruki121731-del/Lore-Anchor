import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Mock database
const works: Record<string, unknown> = {};

// GET /api/works - Get all works
export async function GET() {
  try {
    const worksList = Object.values(works);
    return NextResponse.json({
      success: true,
      data: worksList,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch works' },
      { status: 500 }
    );
  }
}

// POST /api/works - Create a new work
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const title = formData.get('title') as string;
    const autoMonitor = formData.get('autoMonitor') === 'true';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File is required' },
        { status: 400 }
      );
    }

    // Determine file type
    const fileType = file.type.startsWith('image/')
      ? 'illustration'
      : file.type.startsWith('audio/')
      ? 'music'
      : 'video';

    // Generate file hash (simplified - in production use SHA-256)
    const fileBuffer = await file.arrayBuffer();
    const hashArray = new Uint8Array(fileBuffer.slice(0, 32));
    const fileHash = Array.from(hashArray)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const workId = uuidv4();
    const now = new Date().toISOString();

    const newWork = {
      id: workId,
      user_id: 'user-001', // In production, get from auth
      title: title || file.name.replace(/\.[^/.]+$/, ''),
      type: fileType,
      file_url: `/uploads/${workId}/${file.name}`, // In production, upload to S3/Supabase
      file_hash: fileHash,
      thumbnail_url: fileType === 'illustration' ? `/uploads/${workId}/thumb.jpg` : null,
      auto_monitor: autoMonitor,
      status: 'scanning',
      created_at: now,
      last_scanned_at: null,
    };

    works[workId] = newWork;

    // In production, trigger background scan job here
    // await triggerScanJob(workId);

    return NextResponse.json({
      success: true,
      data: {
        workId,
        status: 'scanning',
      },
    });
  } catch (error) {
    console.error('Error creating work:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create work' },
      { status: 500 }
    );
  }
}
