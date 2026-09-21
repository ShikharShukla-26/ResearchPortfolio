import { promises as fs } from 'fs';
import path from 'path';
import { put } from '@vercel/blob';

export async function storeUploadedFile(file: File) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const safeName = file.name.replace(/[^\w.\-]+/g, '-').slice(0, 120);

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`cms/${Date.now()}-${safeName}`, buffer, {
      access: 'public',
      contentType: file.type || 'application/octet-stream'
    });
    return blob.url;
  }

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  await fs.mkdir(uploadsDir, { recursive: true });
  const filename = `${Date.now()}-${safeName}`;
  await fs.writeFile(path.join(uploadsDir, filename), buffer);
  return `/uploads/${filename}`;
}
