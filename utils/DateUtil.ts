import * as moment from 'moment';

class DateUtil {
  private dateDefaultFormat: string;

  private timeDefaultFormat: string;

  constructor() {
    this.dateDefaultFormat = 'DD-MM-YYYY';
    this.timeDefaultFormat = 'YYYY-MM-DD HH:mm:ss';
  }

  formatDateDefault(date: Date | null, format?: string): string {
    return moment.default(date || new Date()).format(format || this.dateDefaultFormat);
  }

  // eslint-disable-next-line class-methods-use-this
  formatDate(date: string | Date | null, format: string): string {
    if (date === null || date === undefined || date === '') {
      return '';
    }

    const parsedDate = typeof date === 'string' ? new Date(date) : date;
    let result = format;

    const day = parsedDate.getDate();
    result = result.replace('DD', day < 10 ? `0${day}` : day.toString());

    const month = parsedDate.getMonth() + 1;
    result = result.replace('MM', month < 10 ? `0${month}` : month.toString());

    const year = parsedDate.getFullYear();
    result = result.replace('YYYY', year.toString());

    return result;
  }
}

export default DateUtil;
