import { NextRequest, NextResponse } from 'next/server';

// Mock database
const infringements: Record<string, { status: string; resolved_at: string | null }> = {
  'inf-001': { status: 'pending', resolved_at: null },
  'inf-002': { status: 'sent', resolved_at: null },
  'inf-003': { status: 'resolved', resolved_at: '2024-01-25T12:00:00Z' },
  'inf-004': { status: 'pending', resolved_at: null },
  'inf-005': { status: 'pending', resolved_at: null },
};

// GET /api/infringements/:id - Get a specific infringement
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const infringement = infringements[id];

    if (!infringement) {
      return NextResponse.json(
        { success: false, error: 'Infringement not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: infringement,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch infringement' },
      { status: 500 }
    );
  }
}

// PATCH /api/infringements/:id - Update infringement status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'sent', 'resolved', 'false_positive'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    const infringement = infringements[id];
    if (!infringement) {
      return NextResponse.json(
        { success: false, error: 'Infringement not found' },
        { status: 404 }
      );
    }

    // Update the infringement
    infringement.status = status;
    if (status === 'resolved') {
      infringement.resolved_at = new Date().toISOString();
    }

    return NextResponse.json({
      success: true,
      data: {
        id,
        ...infringement,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update infringement' },
      { status: 500 }
    );
  }
}
