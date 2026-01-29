import { NextRequest, NextResponse } from 'next/server';

// Mock database (shared with parent route in production)
const works: Record<string, unknown> = {};

// GET /api/works/:id - Get a specific work
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const work = works[id];

    if (!work) {
      return NextResponse.json(
        { success: false, error: 'Work not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: work,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch work' },
      { status: 500 }
    );
  }
}

// DELETE /api/works/:id - Delete a work
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const work = works[id];

    if (!work) {
      return NextResponse.json(
        { success: false, error: 'Work not found' },
        { status: 404 }
      );
    }

    delete works[id];

    return NextResponse.json({
      success: true,
      message: 'Work deleted successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete work' },
      { status: 500 }
    );
  }
}
