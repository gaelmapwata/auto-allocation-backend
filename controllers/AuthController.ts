import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { checkSchema } from 'express-validator';
import authValidators from '../validators/auth.validator';
import { Request } from '../types/expressOverride';
import User from '../models/User';
import Role from '../models/Role';
import Permission from '../models/Permission';
import { handleExpressValidators } from '../utils/express.util';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const jwt = require('jsonwebtoken');

const TOKEN_EXPIRATION_TIME_IN_MS = 2592000; // 30 days

export default {
  signin: [
    checkSchema(authValidators.signinSchema),
    async (req: Request, res: Response) => {
      handleExpressValidators(req, res);

      const userToLogin = await User.findOne(
        { where: { email: req.body.email } },
      );

      if (!userToLogin) {
        return res.status(401).send({ message: "Ce compte n'a pas été retrouvé" });
      }

      const passwordIsValid = bcrypt.compareSync(
        req.body.password,
        userToLogin.password,
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          token: null,
          message: 'Mot de passe invalide',
        });
      }

      const token = jwt.sign({ id: userToLogin.id }, process.env.JWT_SECRET, {
        expiresIn: TOKEN_EXPIRATION_TIME_IN_MS,
      });
      return res.status(200).json({
        user: userToLogin,
        token,
      });
    },
  ],
  getCurrentUser: async (req: Request, res: Response) => {
    try {
      const loggedUser = await User.findByPk(req.userId as number, {
        include: [{ model: Role, include: [Permission] }],
      });
      if (!loggedUser) {
        return res.status(401).send({ msg: "Ce compte n'a pas été retrouvé" });
      }

      return res.status(200).json(loggedUser);
    } catch (error) {
      return res.status(500).json(error);
    }
  },
};
