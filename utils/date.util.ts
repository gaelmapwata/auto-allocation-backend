import { format } from 'date-fns';

export const getTodayDate = () => format(new Date(), 'yyyy-MM-dd');

export const getYesterdayDate = () => {
  const today = new Date();
  today.setDate(today.getDate() - 1);

  return format(today, 'yyyy-MM-dd');
};

export const firstDayOfWeekDate = () => {
  const today = new Date();
  const firstDay = today.setDate(today.getDate() - today.getDay());
  return format(firstDay, 'yyyy-MM-dd');
};

export const lastDayOfWeekDate = () => {
  const today = new Date();
  const lastDay = today.setDate(today.getDate() - today.getDay() + 6);
  return format(lastDay, 'yyyy-MM-dd');
};
