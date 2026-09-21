import { NextResponse } from 'next/server';
import { requireCmsAdmin } from '@/lib/cms/api-utils';
import { storeUploadedFile } from '@/lib/cms/upload';

export async function POST(request: Request) {
  try {
    await requireCmsAdmin();
  } catch (response) {
    return response as NextResponse;
  }

  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing file' }, { status: 400 });
  }

  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: 'Max file size is 8MB' }, { status: 400 });
  }

  const url = await storeUploadedFile(file);
  return NextResponse.json({ url });
}
