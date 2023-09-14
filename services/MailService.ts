import nodemailer from 'nodemailer';
import Email from 'email-templates';
import path from 'path';
import dotenv from 'dotenv';
import { IMailPayload } from '../types/Mail';

dotenv.config();

const TRANSPORT = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT as unknown as number,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export default {
  async sendMailFromEmailTemplates(payload: IMailPayload, textOnly = false) : Promise<unknown> {
    const { template, locals } = payload;

    const mailFrom = payload.mailFrom ?? process.env.MAIL_FROM_ADDRESS;
    const mailTo = payload.mailTo ?? process.env.MAIL_TO_ADDRESS;

    const email = new Email({
      message: {
        from: mailFrom,
      },
      send: true,
      transport: TRANSPORT,
      textOnly,
    });

    try {
      const response = await email
        .send({
          template: path.join(__dirname, '../../', 'emails', template),
          message: {
            to: mailTo,
          },
          locals: {
            ...locals,
            APP_URL: process.env.APP_URL,
          },
        });
      return response;
    } catch (err) {
      // eslint-disable-next-line max-len
      return Promise.reject(err);
    }
  },
};
