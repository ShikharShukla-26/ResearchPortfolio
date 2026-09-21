import { NextResponse } from 'next/server';
import { requireCmsAdmin, jsonError } from '@/lib/cms/api-utils';
import { revalidatePublicContent } from '@/lib/cms/revalidate-public';
import {
  reorderLinks,
  reorderLogs,
  reorderResearch,
  reorderWriting
} from '@/lib/cms/queries';
import type { ReorderKind } from '@/lib/cms/types';

export async function PUT(request: Request) {
  try {
    await requireCmsAdmin();
    const body = (await request.json()) as {
      kind: ReorderKind;
      ids: number[];
      section?: 'elsewhere' | 'footer';
    };

    if (!Array.isArray(body.ids) || body.ids.length === 0) {
      return jsonError('ids array required', 400);
    }

    switch (body.kind) {
      case 'research':
        await reorderResearch(body.ids);
        break;
      case 'writing':
        await reorderWriting(body.ids);
        break;
      case 'logs':
        await reorderLogs(body.ids);
        break;
      case 'links':
        if (!body.section) return jsonError('section required for links', 400);
        await reorderLinks(body.section, body.ids);
        break;
      default:
        return jsonError('Invalid kind', 400);
    }

    revalidatePublicContent();
    return NextResponse.json({ ok: true });
  } catch (response) {
    if (response instanceof NextResponse) return response;
    return jsonError('Failed to reorder', 500);
  }
}
