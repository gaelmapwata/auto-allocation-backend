import { Request, Response } from 'express';
import { checkSchema, validationResult } from 'express-validator';
import Bank from '../models/Bank';
import bankValidator from '../validators/bankValidator';

export default {
  index: async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const offset = (page - 1) * limit;

      const limitQuery = limit === -1 ? {} : { limit };

      const banksAndCount = await Bank.findAndCountAll({
        ...limitQuery,
        offset,
        order: ['label'],
      });

      const banksSize = banksAndCount.count;
      const totalPages = Math.ceil(banksSize / limit);

      res.status(200).json({
        data: banksAndCount.rows,
        lastPage: totalPages,
        currentPage: page,
        limit,
        total: banksSize,
      });
    } catch (error) {
      res.status(500).json(error);
    }
  },

  store: [
    checkSchema(bankValidator.storeSchema),
    async (req: Request, res: Response) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ msg: errors.array() });
        }
        const bank = await Bank.create(req.body);
        res.status(201).json(bank);
      } catch (error) {
        res.status(500).json(error);
      }
    },
  ],

  show: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const bank = await Bank.findByPk(id);
      res.status(200).json(bank);
    } catch (error) {
      res.status(500).json(error);
    }
  },

  update: [
    checkSchema(bankValidator.updateSchema),
    async (req: Request, res: Response) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ msg: errors.array() });
        }

        const { id } = req.params as any;
        await Bank.update(
          req.body,
          {
            where: {
              id,
            },
            fields: Bank.fillable,
          },
        );

        const newBank = await Bank.findByPk(id);
        res.status(200).json(newBank);
      } catch (error) {
        res.status(500).json(error);
      }
    },
  ],

  delete: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const bank = await Bank.findByPk(id);

      if (bank) {
        bank.label = `${bank.label}_DELETED_AT_${new Date().toISOString()}`;
        bank.save();
        bank.destroy();
      }
      res.status(204).json({});
    } catch (error) {
      res.status(500).json(error);
    }
  },
};
