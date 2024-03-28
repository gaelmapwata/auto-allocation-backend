import dotenv from 'dotenv';
import { Dialect } from 'sequelize';

dotenv.config();

export const development = {
  username: process.env.DB_USER_NAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: process.env.DB_DIALECT as Dialect,
  dialectOptions: {
    bigNumberStrings: true,
  },
  logging: false,
  seederStorage: 'sequelize',
};
export const test = {
  username: process.env.CI_DB_USERNAME,
  password: process.env.CI_DB_PASSWORD,
  database: process.env.CI_DB_NAME,
  host: process.env.CI_DB_HOST,
  port: 3306,
  dialect: process.env.CI_DB_HOST as Dialect,
  dialectOptions: {
    bigNumberStrings: true,
  },
};
export const production = {
  username: process.env.DB_USER_NAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: process.env.DB_DIALECT as Dialect,
  dialectOptions: {
    bigNumberStrings: true,
    // ssl: {
    //   ca: readFileSync(`${__dirname}/mysql-ca-main.crt`),
    // },
  },
  logging: false,
  seederStorage: 'sequelize',
};

export const UBA_MAIL_CONFIGS = {
  EMAIL_SENDER: 'app.notification@ubagroup.com',
  OTP_EMAIL_SUBJECT: 'AUTO ALLOCATION OTP',
  OTP_EMAIL_MESSAGE:
      'Below your OTP to access the auto allocation platform :otp',
  EMAIL_NOTIFICATION_API_URL: 'http://10.100.5.195:1867/service.asmx',
};
