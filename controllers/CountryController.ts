import { Request, Response } from 'express';
import { checkSchema, validationResult } from 'express-validator';
import Country from '../models/Country';
import countryValidator from '../validators/countryValidator';

export default {
  index: async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const offset = (page - 1) * limit;

      const limitQuery = limit === -1 ? {} : { limit };

      const countriesAndCount = await Country.findAndCountAll({
        ...limitQuery,
        offset,
        order: ['label'],
      });

      const countriesSize = countriesAndCount.count;
      const totalPages = Math.ceil(countriesSize / limit);

      res.status(200).json({
        data: countriesAndCount.rows,
        lastPage: totalPages,
        currentPage: page,
        limit,
        total: countriesSize,
      });
    } catch (error) {
      res.status(500).json(error);
    }
  },

  store: [
    checkSchema(countryValidator.storeSchema),
    async (req: Request, res: Response) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ msg: errors.array() });
        }
        const country = await Country.create(req.body);
        res.status(201).json(country);
      } catch (error) {
        res.status(500).json(error);
      }
    },
  ],

  show: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const country = await Country.findByPk(id);
      res.status(200).json(country);
    } catch (error) {
      res.status(500).json(error);
    }
  },

  update: [
    checkSchema(countryValidator.updateSchema),
    async (req: Request, res: Response) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ msg: errors.array() });
        }

        const { id } = req.params as any;
        await Country.update(
          req.body,
          {
            where: {
              id,
            },
            fields: Country.fillable,
          },
        );

        const newCountry = await Country.findByPk(id);
        res.status(200).json(newCountry);
      } catch (error) {
        res.status(500).json(error);
      }
    },
  ],

  delete: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const country = await Country.findByPk(id);

      if (country) {
        country.code2 = `${country.code2}_DELETED_AT_${new Date().toISOString()}`;
        country.save();
        country.destroy();
      }
      res.status(204).json({});
    } catch (error) {
      res.status(500).json(error);
    }
  },
};
