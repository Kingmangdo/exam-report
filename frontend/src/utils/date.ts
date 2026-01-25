// 날짜 형식 변환 (yy-mm-dd)
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear().toString().slice(-2);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 오늘 날짜 (yy-mm-dd)
export function getToday(): string {
  return formatDate(new Date());
}

// 날짜 문자열을 Date 객체로 변환
export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  const fullYear = year < 50 ? 2000 + year : 1900 + year;
  return new Date(fullYear, month - 1, day);
}

// 날짜 포맷팅 (표시용)
export function formatDisplayDate(dateStr: string): string {
  const date = parseDate(dateStr);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
