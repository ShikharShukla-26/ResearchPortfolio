/**
 * Print Google Docs/Presentation links from the research resume PDF.
 * Run: node scripts/extract-resume-links.mjs
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pdfPath = resolve(root, 'myWork/resume/Shikhar_Shukla_Research.pdf');

const py = spawnSync(
  'python',
  [
    '-c',
    `
import pypdf
r = pypdf.PdfReader(${JSON.stringify(pdfPath)})
for page in r.pages:
    for a in page.get('/Annots') or []:
        obj = a.get_object()
        uri = obj.get('/A', {}).get('/URI')
        if uri:
            print(uri)
`
  ],
  { encoding: 'utf-8' }
);

if (py.status === 0 && py.stdout.trim()) {
  console.log(py.stdout.trim());
} else {
  const raw = readFileSync(pdfPath);
  const text = raw.toString('latin1');
  const urls = [
    ...new Set(
      [...text.matchAll(/https:\/\/docs\.google\.com[^\s<>"]+/g)].map((m) =>
        m[0].replace(/\)$/, '')
      )
    )
  ];
  console.log(urls.join('\n'));
}

console.log(
  '\nSlug mapping is maintained in lib/cms/research-document-urls.ts'
);
