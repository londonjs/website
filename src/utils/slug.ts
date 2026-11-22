import { format } from 'date-fns';

export const generateSlug = (dateStr: string, title: string): string => {
  const date = new Date(dateStr);
  const formattedDate = format(date, 'yyyy-MM-dd');
  const titleSlug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${formattedDate}-${titleSlug}`;
};
