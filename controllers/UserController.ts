import { Request, Response } from 'express';
import { checkSchema, validationResult } from 'express-validator';
import User from '../models/User';
import userValidators from '../validators/userValidators';
import Role from '../models/Role';

// eslint-disable-next-line @typescript-eslint/no-var-requires

export default {
  index: async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const offset = (page - 1) * limit;

      const limitQuery = limit === -1 ? {} : { limit };

      const usersAndCount = await User.findAndCountAll({
        ...limitQuery,
        offset,
        order: ['email'],
        include: [Role],
      });

      const usersSize = usersAndCount.count;
      const totalPages = Math.ceil(usersSize / limit);

      res.status(200).json({
        data: usersAndCount.rows,
        lastPage: totalPages,
        currentPage: page,
        limit,
        total: usersSize,
      });
    } catch (error) {
      res.status(500).json(error);
    }
  },

  store: [
    checkSchema(userValidators.storeSchema),
    async (req: Request, res: Response) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ msg: errors.array() });
        }
        const user = await User.create(req.body);

        const { roles } = (req.body as any);
        if (roles) {
          await user.$add('roles', roles);
        }

        res.status(201).json(user);
      } catch (error) {
        res.status(500).json(error);
      }
    },
  ],
  show: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json(error);
    }
  },
  addRoles: [
    checkSchema(userValidators.addRolesSchema),
    async (req: Request, res: Response) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ msg: errors.array() });
        }
        const user = await User.findByPk(req.params.id);
        if (!user) {
          return res.status(404).json({ msg: 'L\'utilisateur n\'a pas été retrouver' });
        }

        const { roles } = (req.body as any);
        await user.$add('roles', roles);

        res.status(201).json(user);
      } catch (error) {
        res.status(500).json(error);
      }
    },
  ],

  update: [
    checkSchema(userValidators.updateSchema),
    async (req: Request, res: Response) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ msg: errors.array() });
        }
        const { id } = req.params;
        await User.update(
          req.body,
          {
            where: {
              id,
            },
            fields: User.fillable,
          },
        );

        const newUser = await User.findByPk(id);
        const { roles } = (req.body as any);
        if (roles && newUser) {
          await newUser.$set('roles', roles);
        }
        res.status(200).json(newUser);
      } catch (error) {
        res.status(500).json(error);
      }
    },
  ],

  delete: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = await User.destroy({
        where: { id },
      });
      res.status(204).json(user);
    } catch (error) {
      res.status(500).json(error);
    }
  },
};
