import { NextRequest, NextResponse } from 'next/server';

// POST /api/works/:id/scan - Trigger manual scan for a work
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // In production:
    // 1. Verify the work exists and belongs to the user
    // 2. Check rate limits (especially for free users)
    // 3. Queue a background job for the scan
    // 4. Return immediately with scan job ID

    // Mock response
    return NextResponse.json({
      success: true,
      data: {
        workId: id,
        status: 'scanning',
        message: 'Scan started successfully',
        estimatedTime: '2-5 minutes',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to start scan' },
      { status: 500 }
    );
  }
}
