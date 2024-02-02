import { Request, Response } from 'express';
import { Op } from 'sequelize';
import add from 'date-fns/add';
import activeDirectoryService from '../services/activeDirectoryService';

import User from '../models/User';
import Otp from '../models/Otp';
import generateNumeric from '../utils/utilities';
import Role from '../models/Role';
import Permission from '../models/Permission';
// import { sendMailFromEmailTemplates } from '../utils/mail';
import utilHelper from '../utils/utilHelper';
import errorHandlerService from '../services/ErrorHandlerService';
import LogHelper from '../utils/logHelper';
import { UBA_MAIL_CONFIGS } from '../config/config';

const jwt = require('jsonwebtoken');

const OTP_MINUTES_VALIDITY = 5; // 5 minutes
const JWT_TIME_VALIDITY = 592000; // 12 hours

export default {
  signin: async (req: Request, res: Response) => {
    try {
      const user = await User.findOne({
        where: {
          email: req.body.email,
        },
      });

      if (!user) {
        return res.status(401).send({ msg: "Ce compte n'a pas été retrouvé" });
      }

      LogHelper.info(`Auth | user ${req.body.email} trying to login`);

      const canLogged = await activeDirectoryService.login(req.body.email, req.body.password);
      if (!canLogged) {
        return res.status(401).send({
          msg: 'Email ou Mot de passe invalide',
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
      const newOtp = await Otp.create({
        email: req.body.email,
        otp: generateNumeric.generateNumericOTP(),
        expirationDate: add(new Date(), { minutes: OTP_MINUTES_VALIDITY }).toISOString().split('.')[0],
      });

      utilHelper.sendEmailNotification(
        newOtp.email.trim(),
        newOtp.email.trim(),
        UBA_MAIL_CONFIGS.EMAIL_SENDER.trim(),
        UBA_MAIL_CONFIGS.OTP_EMAIL_SUBJECT,
        UBA_MAIL_CONFIGS.OTP_EMAIL_MESSAGE.replace(/:otp/gi, newOtp.otp),
      );

      LogHelper.info(`Auth | user ${req.body.email} successful logged with active directory, otp sended`);

      // sendMailFromEmailTemplates({
      //   mailTo: newOtp.email,
      //   locals: { otp: newOtp.otp },
      //   template: 'login-otp',
      // });
      return res.status(200).json({ msg: 'authentification réussie' });
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
        return res.status(401).send({ msg: "Ce compte n'a pas été retrouvé" });
      }
      const otp = await Otp.findOne({
        where: {
          email: req.body.email,
          otp: req.body.otp,
          expirationDate: {
            [Op.gte]: new Date(),
          },
        },
      });

      if (!otp) {
        return res.status(401).send({ msg: 'Otp non reconnue ou expiré' });
      }
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: JWT_TIME_VALIDITY, // 12 hours
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
        return res.status(401).send({ msg: "Ce compte n'a pas été retrouvé" });
      }

      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  logout: (_: unknown, res: Response) => res.status(200).json({}),
};
