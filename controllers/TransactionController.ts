import { Request, Response } from 'express';
import { checkSchema, validationResult } from 'express-validator';
import transactionValidators from '../validators/transactionValidators';
import Transaction from '../models/Transaction';
import TransactionFinacleController from './TransactionFinacleController';

// import TransactionFinacleService from '../services/transactionFinacleService';

export default {
  storeTransaction: [
    checkSchema(transactionValidators.storeTransactionSchema),
    async (req: Request, res: Response) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ msg: errors.array() });
        }
        const newTransaction = await Transaction.create({
          ...req.body,
          note: 'Allocation Deallocation',
          userId: (req as any).userId,
        });
        // eslint-disable-next-line max-len
        const transactionFinacle = await TransactionFinacleController.saveTransactionFinacle(
          newTransaction.amount,
          newTransaction.currency,
          newTransaction.msisdn,
          (req as any).userId,
          newTransaction.id,
        );
        return res.status(201).json(transactionFinacle);
      } catch (error) {
        res.status(500).json(error);
      }
    },
  ],
};
