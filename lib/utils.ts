export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}시간 ${mins}분`;
  }
  return `${mins}분`;
};

export const getWeekRange = (date: Date = new Date()) => {
  const curr = new Date(date);
  const first = curr.getDate() - curr.getDay();
  const last = first + 6;

  const startOfWeek = new Date(curr.setDate(first));
  const endOfWeek = new Date(curr.setDate(last));

  return { startOfWeek, endOfWeek };
};

export const getMonthRange = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const month = date.getMonth();

  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0);

  return { startOfMonth, endOfMonth };
};
