import { NextRequest, NextResponse } from 'next/server';

// Mock data for template generation
const mockWorks: Record<string, { title: string; created_at: string }> = {
  'work-001': { title: '夕焼けの風景画', created_at: '2024-01-15T10:00:00Z' },
  'work-005': { title: 'ファンタジー風景画', created_at: '2024-01-05T11:00:00Z' },
};

const mockInfringements: Record<string, { work_id: string; site_url: string }> = {
  'inf-001': { work_id: 'work-001', site_url: 'https://illegal-gallery.net/image/12345' },
  'inf-002': { work_id: 'work-001', site_url: 'https://free-wallpaper.com/dl/67890' },
  'inf-003': { work_id: 'work-001', site_url: 'https://matome-blog.jp/article/99999' },
  'inf-004': { work_id: 'work-005', site_url: 'https://pirated-art.ru/gallery/54321' },
  'inf-005': { work_id: 'work-005', site_url: 'https://image-dump.xyz/i/11111' },
};

const mockUser = {
  name: '山田太郎',
  email: 'creator@example.com',
};

function generateTakedownTemplate(
  siteUrl: string,
  workTitle: string,
  workCreatedAt: string,
  userName: string,
  userEmail: string
): string {
  const createdDate = new Date(workCreatedAt).toLocaleDateString('ja-JP');

  return `件名: 著作権侵害に基づくコンテンツ削除要請 (DMCA Notice)

管理者様

私「${userName}」は「${workTitle}」の著作権者です。
貴サイト上の以下のURLにて、私の著作物が無断で公開されていることを確認しました。

■ 侵害コンテンツURL
${siteUrl}

■ オリジナル作品
タイトル: ${workTitle}
登録日: ${createdDate}
権利証明: 発行準備中

DMCA（デジタルミレニアム著作権法）第512条に基づき、当該コンテンツの即時削除を要請いたします。

本通知の内容は誠実かつ正確であり、私が当該著作物の正当な権利者であることを宣誓いたします。

敬具
${userName}
${userEmail}
`;
}

// GET /api/infringements/:id/template - Get takedown template for an infringement
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const infringement = mockInfringements[id];

    if (!infringement) {
      return NextResponse.json(
        { success: false, error: 'Infringement not found' },
        { status: 404 }
      );
    }

    const work = mockWorks[infringement.work_id];
    if (!work) {
      return NextResponse.json(
        { success: false, error: 'Associated work not found' },
        { status: 404 }
      );
    }

    const template = generateTakedownTemplate(
      infringement.site_url,
      work.title,
      work.created_at,
      mockUser.name,
      mockUser.email
    );

    return NextResponse.json({
      success: true,
      data: {
        subject: '著作権侵害に基づくコンテンツ削除要請 (DMCA Notice)',
        body: template,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to generate template' },
      { status: 500 }
    );
  }
}
