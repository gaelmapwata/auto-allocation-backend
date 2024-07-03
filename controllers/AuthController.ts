/* eslint-disable no-param-reassign */
import { Request, Response } from 'express';
import { Op } from 'sequelize';
import activeDirectoryService from '../services/activeDirectoryService';

import User from '../models/User';
import Otp from '../models/Otp';
import Role from '../models/Role';
import Permission from '../models/Permission';
// import { sendMailFromEmailTemplates } from '../utils/mail';
import utilHelper from '../utils/utilHelper';
import errorHandlerService from '../services/ErrorHandlerService';
import LogHelper from '../utils/logHelper';
import { UBA_MAIL_CONFIGS } from '../config/config';
import OtpService from '../services/OtpService';

const jwt = require('jsonwebtoken');

const JWT_TIME_VALIDITY = 592000; // 12 hours
const MAX_LOGIN_ATTEMPT = 3;

async function onLoginFailed(user:User) {
  // eslint-disable-next-line no-param-reassign
  user.totalLoginAttempt += 1;
  await user.save();

  if (user.totalLoginAttempt === MAX_LOGIN_ATTEMPT) {
    // eslint-disable-next-line no-param-reassign
    user.locked = true;
    await user.save();
  }
}

async function onLoginSuccess(user:User) {
  // eslint-disable-next-line no-param-reassign
  user.totalLoginAttempt = 0;
  await user.save();
}

export default {
  signin: async (req: Request, res: Response) => {
    try {
      const user = await User.findOne({
        where: {
          email: req.body.email,
        },
      });

      if (!user) {
        return res.status(401).send({ msg: 'This account has not been found' });
      }

      if (user.locked) {
        return res.status(401).send({ msg: 'This account has been blocked, please contact the administrator' });
      }

      LogHelper.info(`Auth | user ${req.body.email} trying to login`);

      const canLogged = await activeDirectoryService.login(req.body.email, req.body.password);
      // const canLogged = true;

      if (!canLogged) {
        await onLoginFailed(user);
        return res.status(401).send({
          msg: `Invalid Email or Password. Remaining attempts (${MAX_LOGIN_ATTEMPT - user.totalLoginAttempt})`,
        });
      }

      // Destroy expired OTP
      Otp.destroy({
        where: {
          email: req.body.email,
          expirationDate: {
            [Op.lt]: new Date(),
          },
        },
      });

      // create new OTP
      const { otp: userOTP } = await OtpService.createOtpForUser(req.body.email);

      utilHelper.sendEmailNotification(
        req.body.email,
        req.body.email,
        UBA_MAIL_CONFIGS.EMAIL_SENDER.trim(),
        UBA_MAIL_CONFIGS.OTP_EMAIL_SUBJECT,
        UBA_MAIL_CONFIGS.OTP_EMAIL_MESSAGE.replace(/:otp/gi, userOTP),
      );

      // console.log(userOTP);

      LogHelper.info(`Auth | user ${req.body.email} successful logged with active directory, otp sended`);

      // sendMailFromEmailTemplates({
      //   mailTo: newOtp.email,
      //   locals: { otp: newOtp.otp },
      //   template: 'login-otp',
      // });
      onLoginSuccess(user);
      return res.status(200).json({ msg: 'successful authentication' });
    } catch (error) {
      return errorHandlerService.handleResponseError(res, error as Error);
    }
  },
  checkOtp: async (req: Request, res: Response) => {
    try {
      const user = await User.findOne({
        where: {
          email: req.body.email,
        },
      });

      if (!user) {
        return res.status(401).send({ msg: 'This account has not been found' });
      }

      const otp = await OtpService.checkOtpFromUser(req.body.email, req.body.otp);

      if (!otp) {
        return res.status(401).send({ msg: 'Otp not recognized or expired' });
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: JWT_TIME_VALIDITY,
      });

      otp.destroy();

      LogHelper.info(`Auth | user ${req.body.email} successful logged with otp verification`);

      return res.status(200).json({
        token,
      });
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  getCurrentUser: async (req: Request, res: Response) => {
    try {
      const user = await User.findByPk((req as any).userId, {
        include: [{ model: Role, include: [Permission] }],
      });
      if (!user) {
        return res.status(401).send({ msg: 'This account has not been found' });
      }

      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  logout: (_: unknown, res: Response) => res.status(200).json({}),
};
