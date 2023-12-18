import { Request, Response } from 'express';
import { checkSchema, validationResult } from 'express-validator';
import { Op, Sequelize } from 'sequelize';
import transactionValidators from '../validators/transactionValidators';
import Transaction from '../models/Transaction';
// import FinacleTransaction from '../models/FinacleTransaction';
import TransactionAirtelMoney from '../models/TransactionAirtelMoney';
import TransactionFinacleController from './TransactionFinacleController';
// import TransactionFinacleService from '../services/transactionFinacleService';
import airtelMoneyService from '../services/airtelMoneyService';
import errorHandlerService from '../services/ErrorHandlerService';
import {
  getTodayDate, getYesterdayDate, firstDayOfWeekDate, lastDayOfWeekDate, getFirstDayOfMonth, getLastDayOfMonth,
} from '../utils/data';

function updateTransactionById(id: number, data: {[key:string]: string | boolean}) {
  return Transaction.update(data, {
    where: {
      id,
    },
  });
}

export default {
  storeTransaction: [
    checkSchema(transactionValidators.storeTransactionSchema),
    async (req: Request, res: Response) => {
      let newTransaction;
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ msg: errors.array() });
        }
        newTransaction = await Transaction.create({
          ...req.body,
          note: 'Allocation Deallocation',
          userId: (req as any).userId,
        });
        // eslint-disable-next-line max-len
        const transactionFinacle = await TransactionFinacleController.saveTransactionFinacle({
          amount: newTransaction.amount,
          currency: newTransaction.currency,
          libelle: newTransaction.msisdn,
          userId: (req as any).userId,
          transactionId: newTransaction.id,
          accountNumber: req.body.accountNumber,
        });
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

        updateTransactionById(newTransaction.id, { success: true });

        return res.status(201).json(newTransaction);
      } catch (error) {
        console.log(error);
        if (newTransaction) {
          updateTransactionById(newTransaction.id, { error: (error as Error).message });
        }
        return errorHandlerService.handleResponseError(res, error as Error);
      }
    },
  ],
  getStats: async (req: Request, res: Response) => {
    const todayDate = getTodayDate();
    const yesterday = getYesterdayDate();
    const firstDayWeek = firstDayOfWeekDate();
    const lastDayWeek = lastDayOfWeekDate();
    const firstDayMonth = getFirstDayOfMonth();
    const lastDayMonth = getLastDayOfMonth();

    const nbToday = await Transaction.count({
      where: {
        success: true,
        [Op.and]: Sequelize.where(
          Sequelize.fn('DATE', Sequelize.col('createdAt')),
          todayDate,
        ),
      },
    });

    const nbYesterday = await Transaction.count({
      where: {
        success: true,
        [Op.and]: Sequelize.where(
          Sequelize.fn('DATE', Sequelize.col('createdAt')),
          yesterday,
        ),
      },
    });

    const nbWeek = await Transaction.count({
      where: {
        success: true,
        [Op.and]: [
          Sequelize.where(
            Sequelize.fn('DATE', Sequelize.col('createdAt')),
            { [Op.gte]: firstDayWeek },
          ),
          Sequelize.where(
            Sequelize.fn('DATE', Sequelize.col('createdAt')),
            { [Op.lte]: lastDayWeek },
          ),
        ],
      },
    });

    const nbMonth = await Transaction.count({
      where: {
        success: true,
        [Op.and]: [
          Sequelize.where(
            Sequelize.fn('DATE', Sequelize.col('createdAt')),
            { [Op.gte]: firstDayMonth },
          ),
          Sequelize.where(
            Sequelize.fn('DATE', Sequelize.col('createdAt')),
            { [Op.lte]: lastDayMonth },
          ),
        ],
      },
    });

    res.status(200).json({
      today: nbToday,
      yesterday: nbYesterday,
      currentWeek: nbWeek,
      currentMonth: nbMonth,
    });
  },
};
