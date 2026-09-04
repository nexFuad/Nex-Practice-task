export type OfficerParticularsPdfSection = { title: string; lines: string[] };

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 48;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const ascii = (text: string) =>
  text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "-");
const escapePdf = (text: string) =>
  ascii(text)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
const wrap = (text: string, fontSize: number) => {
  const maxChars = Math.max(22, Math.floor(CONTENT_WIDTH / (fontSize * 0.52)));
  const words = ascii(text).split(/\s+/).filter(Boolean);
  if (!words.length) return [""];
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length <= maxChars) line = next;
    else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
};

export function downloadOfficerParticularsPdf({
  employeeName,
  companyName,
  sections,
}: {
  employeeName: string;
  companyName: string;
  sections: OfficerParticularsPdfSection[];
}) {
  const pages: string[] = [];
  let stream = "";
  let y = PAGE_HEIGHT - MARGIN;
  const addText = (text: string, size = 10, bold = false) => {
    if (y < MARGIN + 20) {
      pages.push(stream);
      stream = "";
      y = PAGE_HEIGHT - MARGIN;
    }
    stream += `BT /F${bold ? 2 : 1} ${size} Tf ${MARGIN} ${y} Td (${escapePdf(text)}) Tj ET\n`;
    y -= size + 4;
  };
  addText(companyName, 16, true);
  addText("Officer Particulars", 18, true);
  y -= 8;
  for (const section of sections) {
    addText(section.title, 13, true);
    for (const line of section.lines)
      for (const part of wrap(line, 10)) addText(part, 10);
    y -= 6;
  }
  pages.push(stream);

  const objects: string[] = [];
  const addObject = (body: string) => {
    objects.push(body);
    return objects.length;
  };
  const catalogRef = addObject("");
  const pagesRef = addObject("");
  const fontRef = addObject(
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  );
  const boldFontRef = addObject(
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
  );
  const pageRefs: number[] = [];
  for (const pageStream of pages) {
    const streamRef = addObject(
      `<< /Length ${pageStream.length} >>\nstream\n${pageStream}endstream`,
    );
    pageRefs.push(
      addObject(
        `<< /Type /Page /Parent ${pagesRef} 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${fontRef} 0 R /F2 ${boldFontRef} 0 R >> >> /Contents ${streamRef} 0 R >>`,
      ),
    );
  }
  objects[catalogRef - 1] = `<< /Type /Catalog /Pages ${pagesRef} 0 R >>`;
  objects[pagesRef - 1] =
    `<< /Type /Pages /Kids [${pageRefs.map((ref) => `${ref} 0 R`).join(" ")}] /Count ${pageRefs.length} >>`;
  let pdf = "%PDF-1.4\n%----\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let index = 1; index < offsets.length; index += 1)
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogRef} 0 R >>\nstartxref\n${xref}\n%%EOF`;
  const filenameBase =
    ascii(employeeName)
      .trim()
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "employee";
  const url = URL.createObjectURL(new Blob([pdf], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `Officer-Particulars-${filenameBase}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
