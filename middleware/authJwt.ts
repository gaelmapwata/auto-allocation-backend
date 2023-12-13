import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Role from '../models/Role';
import Permission from '../models/Permission';

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
      (req as any).userId = decoded.id;
      next();
    });
  },
  // eslint-disable-next-line max-len
  checkPermission: (ressource: string, permission : string) => async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findByPk((req as any).userId, {
      include: [{ model: Role, include: [Permission] }],
    });
    if (
      user?.roles.find((role) => role.permissions.find((p) => p.slug === `${ressource}:${permission}` || p.slug === `${ressource}:ALL`))
    ) {
      next();
      return;
    }
    res.status(403).json({ message: "Vous n'avez pas les accès nécessaires" });
  },
};
