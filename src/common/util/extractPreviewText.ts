// Posts의 content 첫 문장만 파싱해오는 유틸 함수
export function extractPreviewText(content: Record<PropertyKey, any>): string {
  try {
    if (!content || typeof content !== 'object') return '';

    const blocks = content.blocks;
    if (!Array.isArray(blocks)) return '';

    const firstParagraph = blocks.find((block) => block.type === 'paragraph');
    return firstParagraph?.text?.trim() ?? '';
  } catch {
    return '';
  }
}
