type TableData = { headers: string[]; rows: string[][] };

/** MDX compiler drops expression props on custom components; convert Table blocks to GFM tables. */
export function prepareMdxForRender(source: string): string {
  return source.replace(
    /<Table\s+data=\{\{([\s\S]*?)\}\}\s*\/?>/g,
    (_, inner: string) => {
      try {
        const data = new Function(`return ({${inner}})`)() as TableData;
        return tableDataToMarkdown(data);
      } catch {
        return '';
      }
    }
  );
}

function tableDataToMarkdown(data: TableData): string {
  const headers = data.headers ?? [];
  const rows = data.rows ?? [];
  if (rows.length === 0) return '';

  const colCount = Math.max(headers.length, ...rows.map((r) => r.length), 1);
  const hasHeader = headers.some((h) => h.trim() !== '');

  const lines: string[] = [];
  if (hasHeader) {
    lines.push(`| ${padRow(headers, colCount).join(' | ')} |`);
    lines.push(`| ${Array(colCount).fill('---').join(' | ')} |`);
  } else {
    lines.push(`| ${Array(colCount).fill(' ').join(' | ')} |`);
    lines.push(`| ${Array(colCount).fill('---').join(' | ')} |`);
  }
  for (const row of rows) {
    lines.push(`| ${padRow(row, colCount).join(' | ')} |`);
  }
  return `\n${lines.join('\n')}\n\n`;
}

function padRow(cells: string[], size: number): string[] {
  const row = [...cells];
  while (row.length < size) row.push('');
  return row.slice(0, size);
}
