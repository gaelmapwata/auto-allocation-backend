import { Response } from 'express';
import { checkSchema, validationResult } from 'express-validator';
import User from '../models/User';
import userValidators from '../validators/userValidators';
import Role, { RoleE } from '../models/Role';
import LogHelper, { userLogIdentifier } from '../utils/logHelper';
import { Request } from '../types/ExpressOverride';

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
        const user = await User.create(
          {
            ...req.body,
            createdByUserId: req.userId,
            validationAskedByUserId: req.userId, // for admin
          },
          { fields: User.fillable.concat('createdByUserId', 'validationAskedByUserId') },
        );

        const { roleId } = (req.body as any);
        if (roleId) {
          await user.$add('roles', roleId as number);
          await user.reload({ include: [Role] });
        }

        const userRole = user.roles && user.roles.length
          ? user.roles[0].name
          : 'No role';

        LogHelper.info(`User | new user (${req.body.email}) "${userRole}" created by user (${userLogIdentifier(req)})`);

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
            where: { id },
            fields: User.fillable,
          },
        );

        const newUser = await User.findByPk(id, { include: [Role] }) as User;

        const { roleId } = (req.body as any);
        const newRole = await Role.findByPk(roleId);
        const roleHasChanged = !newUser.roles.length || newUser.roles[0].id !== roleId;

        if (roleId && roleHasChanged) {
          if (newRole?.name === RoleE.ADMIN) {
            await User.update(
              {
                validationAskedByUserId: req.userId,
                validatedByUserId: null,
              },
              { where: { id } },
            );
          }

          const previousRole = newUser.roles.length
            ? newUser.roles[0].name
            : 'No role';

          LogHelper.info(`User | user (${newUser?.email}) role changed`
              + ` from ${previousRole} to ${newRole?.name} by user (${userLogIdentifier(req)})`);

          await newUser.$set('roles', roleId as number);
        }

        LogHelper.info(`User | user (${newUser?.email}) updated by user (${userLogIdentifier(req)})`);
        res.status(200).json(newUser);
      } catch (error) {
        res.status(500).json(error);
      }
    },
  ],

  delete: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }

      user.deletedByUserId = req.userId as number;
      user.save();
      user.destroy();

      LogHelper.info(`User | user (${user?.email}) deleted by user (${userLogIdentifier(req)})`);

      res.status(204).json({});
    } catch (error) {
      res.status(500).json(error);
    }
  },

  lock: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await User.update({
        locked: true,
      }, {
        where: { id },
      });

      const user = await User.findByPk(id);
      LogHelper.info(`User | user (${user?.email}) locked by user (${userLogIdentifier(req)})`);

      res.status(204).json(user);
    } catch (error) {
      res.status(500).json(error);
    }
  },
  unlock: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await User.update({
        locked: false,
      }, {
        where: { id },
      });

      const user = await User.findByPk(id);
      LogHelper.info(`User | user (${user?.email}) unlocked by user (${userLogIdentifier(req)})`);

      res.status(204).json(user);
    } catch (error) {
      res.status(500).json(error);
    }
  },

  validate: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }

      if (user.validationAskedByUserId === req.userId) {
        return res.status(400).json({ msg: 'You cannot validate accounts initiate by your self' });
      }

      await User.update({
        validatedByUserId: req.userId,
      }, {
        where: { id },
      });

      LogHelper.info(`User | user (${user?.email}) validated by user (${userLogIdentifier(req)})`);

      res.status(204).json(user);
    } catch (error) {
      res.status(500).json(error);
    }
  },
};
