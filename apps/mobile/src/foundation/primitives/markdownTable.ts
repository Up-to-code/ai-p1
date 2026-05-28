export type MarkdownTableRows = {
  headers: string[];
  rows: string[][];
  columnCount: number;
  minWidth: number;
  nextIndex: number;
};

const DEFAULT_MIN_COLUMN_WIDTH = 220;

function splitTableRow(line: string) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isTableSeparator(line: string) {
  const cells = splitTableRow(line);
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

export function parseMarkdownTableRows(lines: string[], startIndex = 0): MarkdownTableRows | null {
  const headerLine = lines[startIndex];
  const separatorLine = lines[startIndex + 1];
  if (!headerLine || !separatorLine || !headerLine.includes("|") || !isTableSeparator(separatorLine)) {
    return null;
  }

  const headers = splitTableRow(headerLine);
  if (headers.length < 2) return null;
  const columnCount = headers.length;

  const rows: string[][] = [];
  let nextIndex = startIndex + 2;
  while (nextIndex < lines.length && lines[nextIndex]?.includes("|")) {
    const row = normalizeTableRow(splitTableRow(lines[nextIndex]), columnCount);
    if (row.every((cell) => cell.length === 0)) break;
    rows.push(row);
    nextIndex += 1;
  }

  return rows.length > 0
    ? {
        headers: normalizeTableRow(headers, columnCount),
        rows,
        columnCount,
        minWidth: getMarkdownTableMinWidth(columnCount),
        nextIndex,
      }
    : null;
}

export function normalizeTableRow(row: string[], columnCount: number) {
  return Array.from({ length: columnCount }, (_unused, index) => row[index] ?? "");
}

export function getMarkdownTableMinWidth(columnCount: number, minColumnWidth = DEFAULT_MIN_COLUMN_WIDTH) {
  return Math.max(columnCount, 2) * minColumnWidth;
}
