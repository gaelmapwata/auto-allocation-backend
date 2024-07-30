import path from 'path';
import fs from 'fs';
import { format } from 'date-fns';
import { Request } from '../types/ExpressOverride';

export default class LogHelper {
  static info(message: string) {
    const logFilePath = `${path.join(process.cwd(), 'logs', format(new Date(), 'yyyy-MM-dd'))}.log`;

    const logFileWriteStream = fs.createWriteStream(logFilePath, { flags: 'a' });
    logFileWriteStream.write(`${format(new Date(), 'yyyy-MM-dd HH:mm:ss')} | ${message}\n`);
    logFileWriteStream.close();
  }
}

export const userLogIdentifier = (req: Request) => `${req.user?.email} #${req.userId}`;
