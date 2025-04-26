export function sanitizeFileName(filename: string): string {
  return filename
    .replace(/\s+/g, '-') // 공백은 하이픈으로
    .replace(/[^a-zA-Z0-9.\-_]/g, '') // 영문, 숫자, 점, 하이픈, 언더스코어만 허용
    .toLowerCase(); // 소문자로 통일 (선택)
}
