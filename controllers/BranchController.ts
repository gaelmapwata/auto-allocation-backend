import { Response } from 'express';
import { checkSchema, validationResult } from 'express-validator';
import Branch from '../models/Branch';
import branchValidator from '../validators/branchValidator';
import { Request } from '../types/ExpressOverride';

export default {
  getByLoggedBank: async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const offset = (page - 1) * limit;

      const limitQuery = limit === -1 ? {} : { limit };

      const branchesAndCount = await Branch.findAndCountAll({
        ...limitQuery,
        offset,
        order: ['label'],
        where: {
          bankId: req.user?.branch?.bankId,
        },
      });

      const branchesSize = branchesAndCount.count;
      const totalPages = Math.ceil(branchesSize / limit);

      res.status(200).json({
        data: branchesAndCount.rows,
        lastPage: totalPages,
        currentPage: page,
        limit,
        total: branchesSize,
      });
    } catch (error) {
      res.status(500).json(error);
    }
  },

  getAllByLoggedBank: async (req: Request, res: Response) => {
    try {
      const branches = await Branch.findAll({
        order: ['label'],
        where: {
          bankId: req.user?.branch?.bankId,
        },
        attributes: ['id', 'label'],
      });

      return res.status(200).json(branches);
    } catch (error) {
      res.status(500).json(error);
    }
  },

  store: [
    checkSchema(branchValidator.storeSchema),
    async (req: Request, res: Response) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ msg: errors.array() });
        }

        const branch = await Branch.create({
          ...req.body,
          bankId: req.user?.branch?.bankId,
        });
        res.status(201).json(branch);
      } catch (error) {
        res.status(500).json(error);
      }
    },
  ],

  show: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const branch = await Branch.findByPk(id);
      res.status(200).json(branch);
    } catch (error) {
      res.status(500).json(error);
    }
  },

  update: [
    checkSchema(branchValidator.updateSchema),
    async (req: Request, res: Response) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ msg: errors.array() });
        }

        const { id } = req.params as any;
        await Branch.update(
          req.body,
          {
            where: {
              id,
            },
            fields: Branch.fillable,
          },
        );

        const newBranch = await Branch.findByPk(id);
        res.status(200).json(newBranch);
      } catch (error) {
        res.status(500).json(error);
      }
    },
  ],

  delete: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const branch = await Branch.findByPk(id);

      if (branch) {
        branch.solId = `${branch.solId}_DELETED_AT_${new Date().toISOString()}`;
        branch.save();
        branch.destroy();
      }
      res.status(204).json({});
    } catch (error) {
      res.status(500).json(error);
    }
  },
};
