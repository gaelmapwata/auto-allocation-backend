import { Request, Response } from 'express';
import { checkSchema, validationResult } from 'express-validator';
import transactionValidators from '../validators/transactionValidators';
import Transaction from '../models/Transaction';

export default {
  storeTransaction: [
    checkSchema(transactionValidators.storeTransactionSchema),
    async (req: Request, res: Response) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ msg: errors.array() });
        }
        const newTransaction = await Transaction.create(req.body);
        return res.status(201).json(newTransaction);
      } catch (error) {
        res.status(500).json(error);
      }
    },
  ],
};
