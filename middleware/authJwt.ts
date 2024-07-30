import { Response, NextFunction } from 'express';
import User from '../models/User';
import { Request } from '../types/ExpressOverride';
import UserService from '../services/UserService';
import Role from '../models/Role';
import Permission from '../models/Permission';
import BlacklistToken from '../models/BlacklistToken';
import { TokenDecodedI, TokenTypeE } from '../types/Token';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const jwt = require('jsonwebtoken');

export default {
  verifyToken: async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    const bearer = authHeader && authHeader.split(' ')[0];

    if (bearer !== 'Bearer') {
      return res.sendStatus(401);
    }

    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(403).json({
        msg: 'No token provided!',
      });
    }

    const blacklistToken = await BlacklistToken.findOne({
      where: {
        token,
        type: TokenTypeE.MAIN_TOKEN,
      },
    });

    if (blacklistToken) {
      return res.status(409).json({
        message: 'Session expired please re-authenticate',
      });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err: null, decoded: TokenDecodedI) => {
      if (err) {
        return res.status(401).json({
          msg: 'Session expired please re-authenticate',
        });
      }

      if (!decoded.type || decoded.type !== TokenTypeE.MAIN_TOKEN) {
        return res.status(409).json({
          msg: 'Invalid token',
        });
      }

      User
        .findByPk(decoded.id, { include: [{ model: Role, include: [Permission] }] })
        .then((user) => {
          if (!user) {
            return res.status(401).json({
              msg: 'This account has not been found',
            });
          }

          if (user.locked) {
            return res.status(401).send({ msg: 'This account has been blocked, please contact the administrator' });
          }
          req.userId = decoded.id;
          req.user = user;
          next();
        });
    });
  },

  verifyPasswordToken: async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.body;

    if (!token) {
      return res.status(403).json({
        message: 'No tokens provided!',
      });
    }

    const blacklistToken = await BlacklistToken.findOne({
      where: {
        token,
        type: TokenTypeE.PASSWORD_TOKEN,
      },
    });

    if (blacklistToken) {
      return res.status(409).json({
        msg: 'Session expired please re-authenticate with your password',
      });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err: null, decoded: TokenDecodedI) => {
      if (err) {
        return res.status(401).json({
          msg: 'Session expired please re-authenticate with your password',
        });
      }

      if (!decoded.type || decoded.type !== TokenTypeE.PASSWORD_TOKEN) {
        return res.status(409).json({
          msg: 'Invalid token',
        });
      }

      User
        .findByPk(decoded.id)
        .then((user) => {
          if (user) {
            req.passwordAuthData = {
              userId: decoded.id,
              user,
            };
            next();
          } else {
            return res.status(401).json({
              msg: 'This account has not been found',
            });
          }
        });
    });
  },

  // eslint-disable-next-line max-len
  shouldHaveOneOfPermissions: (...permissions: string[]) => async (req: Request, res: Response, next: NextFunction) => {
    const passed = await UserService.userHasOneOfPermissions(req.user as User, ...permissions);
    if (passed) {
      return next();
    }
    return res.status(403).json({ msg: "You don't have the necessary access" });
  },
};
