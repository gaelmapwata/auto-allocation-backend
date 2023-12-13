import nodemailer from 'nodemailer';
import Email from 'email-templates';
import path from 'path';
import { IMailPayload } from '../types/Mail';

function getAuthConfig() {
  const authConfig: {
    auth?: {
      user: string,
      pass: string,
    }
  } = {};

  if (process.env.MAIL_USERNAME || process.env.MAIL_PASSWORD) {
    authConfig.auth = {
      user: process.env.MAIL_USERNAME as string,
      pass: process.env.MAIL_PASSWORD as string,
    };
  }

  return authConfig;
}

const TRANSPORT = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT as unknown as number,
  ...getAuthConfig(),
  tls: {
    rejectUnauthorized: false,
  },
});

// eslint-disable-next-line import/prefer-default-export, max-len
export async function sendMailFromEmailTemplates(payload: IMailPayload, textOnly = false) : Promise<any> {
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
}
