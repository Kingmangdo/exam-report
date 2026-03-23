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

// 오늘 날짜 (YYYY-MM-DD 형식, 한국 시간 기준)
export function getTodayFull(): string {
  // 브라우저의 Intl.DateTimeFormat을 사용하여 한국 시간대(Asia/Seoul) 강제 적용
  const formatter = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  // 결과 예시: "2026. 03. 24." -> 숫자만 추출하여 "2026-03-24" 형태로 변환
  const parts = formatter.formatToParts(new Date());
  const year = parts.find(p => p.type === 'year')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const day = parts.find(p => p.type === 'day')?.value;
  
  return `${year}-${month}-${day}`;
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