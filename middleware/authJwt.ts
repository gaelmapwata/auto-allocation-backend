import { Response, NextFunction } from 'express';
import User from '../models/User';
import { Request } from '../types/ExpressOverride';
import UserService from '../services/UserService';
import Role from '../models/Role';
import Permission from '../models/Permission';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const jwt = require('jsonwebtoken');

export default {
  verifyToken: (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    const bearer = authHeader && authHeader.split(' ')[0];

    if (bearer !== 'Bearer') {
      return res.sendStatus(401);
    }

    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(403).json({
        message: 'Pas de Token fournis !',
      });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err: null, decoded: any) => {
      if (err) {
        return res.status(401).json({
          message: 'Veuillez vous connectez !',
        });
      }

      User
        .findByPk(decoded.id, { include: [{ model: Role, include: [Permission] }] })
        .then((user) => {
          if (user) {
            req.userId = decoded.id;
            req.user = user;
          } else {
            res.status(401).json({
              message: 'Veuillez vous connectez !',
            });
          }
          next();
        });
    });
  },

  // eslint-disable-next-line max-len
  shouldHaveOneOfPermissions: (...permissions: string[]) => async (req: Request, res: Response, next: NextFunction) => {
    const passed = await UserService.userHasOneOfPermissions(req.user as User, ...permissions);
    if (passed) {
      return next();
    }
    return res.status(403).json({ message: "Vous n'avez pas les accès nécessaires" });
  },
};
