/**
 * Export grid data to Excel (XLSX) format — zero-dependency implementation.
 *
 * XLSX files are ZIP archives containing a handful of XML files.
 * This module builds the minimal XML skeleton required by Excel/LibreOffice
 * and packs it using a lightweight ZIP builder with the STORE method
 * (no compression library needed — file sizes are small for grid exports).
 */

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function exportToExcel(headers: string[], dataRows: string[][], fileName: string): void {
    const rows: CellValue[][] = [];

    // Header row
    rows.push(headers.map(h => ({ value: h, type: "string" as const })));

    // Data rows
    for (const row of dataRows) {
        rows.push(
            row.map(cell => {
                const num = Number(cell);
                if (cell !== "" && !isNaN(num) && isFinite(num)) {
                    return { value: num, type: "number" as const };
                }
                return { value: cell, type: "string" as const };
            })
        );
    }

    const xlsxBlob = buildXlsx(rows);
    downloadBlob(xlsxBlob, `${fileName}.xlsx`);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CellValue {
    value: string | number;
    type: "string" | "number";
}

// ---------------------------------------------------------------------------
// XLSX Builder — creates the XML files and zips them
// ---------------------------------------------------------------------------

function buildXlsx(rows: CellValue[][]): Blob {
    // Collect shared strings (for string cells)
    const sharedStrings: string[] = [];
    const sharedStringIndex = new Map<string, number>();

    for (const row of rows) {
        for (const cell of row) {
            if (cell.type === "string") {
                const s = String(cell.value);
                if (!sharedStringIndex.has(s)) {
                    sharedStringIndex.set(s, sharedStrings.length);
                    sharedStrings.push(s);
                }
            }
        }
    }

    // Build XML parts
    const contentTypes = buildContentTypes();
    const rels = buildRels();
    const workbook = buildWorkbook();
    const workbookRels = buildWorkbookRels();
    const sheet = buildSheet(rows, sharedStringIndex);
    const sst = buildSharedStrings(sharedStrings);
    const styles = buildStyles();

    // Pack into ZIP
    const files: ZipEntry[] = [
        { path: "[Content_Types].xml", data: contentTypes },
        { path: "_rels/.rels", data: rels },
        { path: "xl/workbook.xml", data: workbook },
        { path: "xl/_rels/workbook.xml.rels", data: workbookRels },
        { path: "xl/worksheets/sheet1.xml", data: sheet },
        { path: "xl/sharedStrings.xml", data: sst },
        { path: "xl/styles.xml", data: styles }
    ];

    return createZipBlob(files);
}

// ---------------------------------------------------------------------------
// XML Templates
// ---------------------------------------------------------------------------

function buildContentTypes(): string {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`;
}

function buildRels(): string {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;
}

function buildWorkbook(): string {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
          xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Sheet1" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`;
}

function buildWorkbookRels(): string {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;
}

function buildStyles(): string {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>
  <fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>
  <borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs>
</styleSheet>`;
}

function buildSheet(rows: CellValue[][], sharedStringIndex: Map<string, number>): string {
    let xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>`;

    for (let r = 0; r < rows.length; r++) {
        xml += `<row r="${r + 1}">`;
        for (let c = 0; c < rows[r].length; c++) {
            const cell = rows[r][c];
            const ref = colLetter(c) + (r + 1);

            if (cell.type === "number") {
                xml += `<c r="${ref}"><v>${cell.value}</v></c>`;
            } else {
                const idx = sharedStringIndex.get(String(cell.value));
                xml += `<c r="${ref}" t="s"><v>${idx}</v></c>`;
            }
        }
        xml += `</row>`;
    }

    xml += `</sheetData></worksheet>`;
    return xml;
}

function buildSharedStrings(strings: string[]): string {
    let xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${strings.length}" uniqueCount="${strings.length}">`;

    for (const s of strings) {
        xml += `<si><t>${escapeXml(s)}</t></si>`;
    }

    xml += `</sst>`;
    return xml;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function colLetter(index: number): string {
    let result = "";
    let i = index;
    while (i >= 0) {
        result = String.fromCharCode(65 + (i % 26)) + result;
        i = Math.floor(i / 26) - 1;
    }
    return result;
}

function escapeXml(s: string): string {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Minimal ZIP builder (STORE method — no compression needed for small XMLs)
// ---------------------------------------------------------------------------

interface ZipEntry {
    path: string;
    data: string;
}

function createZipBlob(entries: ZipEntry[]): Blob {
    const encoder = new TextEncoder();
    const files = entries.map(e => ({
        path: encoder.encode(e.path),
        data: encoder.encode(e.data)
    }));

    // Calculate total size for pre-allocation
    let totalSize = 0;
    for (const f of files) {
        // Local file header (30) + filename + data
        totalSize += 30 + f.path.length + f.data.length;
        // Central directory entry (46) + filename
        totalSize += 46 + f.path.length;
    }
    // End of central directory (22)
    totalSize += 22;

    const buf = new ArrayBuffer(totalSize);
    const view = new DataView(buf);
    const uint8 = new Uint8Array(buf);
    let offset = 0;
    const centralEntries: Array<{ offset: number; path: Uint8Array; data: Uint8Array; crc: number }> = [];

    // Write local file headers + data
    for (const f of files) {
        const crc = crc32(f.data);
        centralEntries.push({ offset, path: f.path, data: f.data, crc });

        // Local file header signature
        view.setUint32(offset, 0x04034b50, true);
        offset += 4;
        // Version needed
        view.setUint16(offset, 20, true);
        offset += 2;
        // Flags
        view.setUint16(offset, 0, true);
        offset += 2;
        // Compression (0 = STORE)
        view.setUint16(offset, 0, true);
        offset += 2;
        // Mod time
        view.setUint16(offset, 0, true);
        offset += 2;
        // Mod date
        view.setUint16(offset, 0, true);
        offset += 2;
        // CRC-32
        view.setUint32(offset, crc, true);
        offset += 4;
        // Compressed size
        view.setUint32(offset, f.data.length, true);
        offset += 4;
        // Uncompressed size
        view.setUint32(offset, f.data.length, true);
        offset += 4;
        // Filename length
        view.setUint16(offset, f.path.length, true);
        offset += 2;
        // Extra field length
        view.setUint16(offset, 0, true);
        offset += 2;
        // Filename
        uint8.set(f.path, offset);
        offset += f.path.length;
        // Data
        uint8.set(f.data, offset);
        offset += f.data.length;
    }

    // Central directory
    const centralStart = offset;
    for (const entry of centralEntries) {
        // Central directory header signature
        view.setUint32(offset, 0x02014b50, true);
        offset += 4;
        // Version made by
        view.setUint16(offset, 20, true);
        offset += 2;
        // Version needed
        view.setUint16(offset, 20, true);
        offset += 2;
        // Flags
        view.setUint16(offset, 0, true);
        offset += 2;
        // Compression
        view.setUint16(offset, 0, true);
        offset += 2;
        // Mod time
        view.setUint16(offset, 0, true);
        offset += 2;
        // Mod date
        view.setUint16(offset, 0, true);
        offset += 2;
        // CRC-32
        view.setUint32(offset, entry.crc, true);
        offset += 4;
        // Compressed size
        view.setUint32(offset, entry.data.length, true);
        offset += 4;
        // Uncompressed size
        view.setUint32(offset, entry.data.length, true);
        offset += 4;
        // Filename length
        view.setUint16(offset, entry.path.length, true);
        offset += 2;
        // Extra field length
        view.setUint16(offset, 0, true);
        offset += 2;
        // Comment length
        view.setUint16(offset, 0, true);
        offset += 2;
        // Disk number start
        view.setUint16(offset, 0, true);
        offset += 2;
        // Internal attributes
        view.setUint16(offset, 0, true);
        offset += 2;
        // External attributes
        view.setUint32(offset, 0, true);
        offset += 4;
        // Local header offset
        view.setUint32(offset, entry.offset, true);
        offset += 4;
        // Filename
        uint8.set(entry.path, offset);
        offset += entry.path.length;
    }

    const centralSize = offset - centralStart;

    // End of central directory
    view.setUint32(offset, 0x06054b50, true);
    offset += 4;
    // Disk number
    view.setUint16(offset, 0, true);
    offset += 2;
    // Central directory disk
    view.setUint16(offset, 0, true);
    offset += 2;
    // Entries on this disk
    view.setUint16(offset, files.length, true);
    offset += 2;
    // Total entries
    view.setUint16(offset, files.length, true);
    offset += 2;
    // Central directory size
    view.setUint32(offset, centralSize, true);
    offset += 4;
    // Central directory offset
    view.setUint32(offset, centralStart, true);
    offset += 4;
    // Comment length
    view.setUint16(offset, 0, true);

    return new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

// ---------------------------------------------------------------------------
// CRC-32 (standard ZIP CRC)
// ---------------------------------------------------------------------------

/* eslint-disable no-bitwise */
const CRC_TABLE = (() => {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) {
            c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        }
        table[n] = c;
    }
    return table;
})();

function crc32(data: Uint8Array): number {
    let crc = 0xffffffff;
    for (const val of data) {
        crc = CRC_TABLE[(crc ^ val) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
}
/* eslint-enable no-bitwise */
