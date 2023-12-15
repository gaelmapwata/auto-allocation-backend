import { Request, Response } from 'express';
import { checkSchema, validationResult } from 'express-validator';
import transactionValidators from '../validators/transactionValidators';
import Transaction from '../models/Transaction';
// import FinacleTransaction from '../models/FinacleTransaction';
import TransactionAirtelMoney from '../models/TransactionAirtelMoney';
import TransactionFinacleController from './TransactionFinacleController';
// import TransactionFinacleService from '../services/transactionFinacleService';
import airtelMoneyService from '../services/airtelMoneyService';
import errorHandlerService from '../services/ErrorHandlerService';

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
        // eslint-disable-next-line max-len
        // const { stan, tranDateTime } = await TransactionFinacleService.sendTransaction(transactionFinacle);
        // await FinacleTransaction.update(
        //   { stan, tranDateTime },
        //   { where: { transactionId: newTransaction.id } },
        // );

        // eslint-disable-next-line max-len
        const resultAirtelMoneyService = await airtelMoneyService.autoAllocation(newTransaction);
        await TransactionAirtelMoney.create(
          {
            mq_txn_id: resultAirtelMoneyService.data.additional_info.mq_txn_id,
            reference_id: resultAirtelMoneyService.data.transaction.reference_id,
            airtel_money_id: resultAirtelMoneyService.data.transaction.airtel_money_id,
            transaction_airtel_money_id: resultAirtelMoneyService.data.transaction.id,
            // eslint-disable-next-line max-len
            transaction_airtel_money_status: resultAirtelMoneyService.data.transaction.status,
            transactionId: newTransaction.id,
          },
        );

        return res.status(201).json(resultAirtelMoneyService);
      } catch (error) {
        return errorHandlerService.handleResponseError(res, error as Error);
      }
    },
  ],
};
