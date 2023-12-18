import { Request, Response } from 'express';
import { checkSchema, validationResult } from 'express-validator';
import XLSX from 'xlsx';
import { Op, Sequelize } from 'sequelize';
import transactionValidators from '../validators/transactionValidators';
import Transaction from '../models/Transaction';
import FinacleTransaction from '../models/FinacleTransaction';
import TransactionAirtelMoney from '../models/TransactionAirtelMoney';
import User from '../models/User';
import TransactionFinacleController from './TransactionFinacleController';
// import TransactionFinacleService from '../services/transactionFinacleService';
import airtelMoneyService from '../services/airtelMoneyService';
import errorHandlerService from '../services/ErrorHandlerService';
import sequelize from '../sequelize-instance';
import {
  // eslint-disable-next-line max-len
  getTodayDate, getYesterdayDate, firstDayOfWeekDate, lastDayOfWeekDate, getFirstDayOfMonth, getLastDayOfMonth,
} from '../utils/data';

function updateTransactionById(id: number, data: {[key:string]: string | boolean}) {
  return Transaction.update(data, {
    where: {
      id,
    },
  });
}

function generateFilterAttributes(req: Request):any {
  const filterAttributes: any = {};
  if (req.query.msisdn) {
    filterAttributes.msisdn = {
      [Op.like]: `%${req.query.msisdn}%`,
    };
  }
  if (req.query.currency) {
    filterAttributes.currency = req.query.currency;
  }
  if (['1', 'true'].includes(req.query.success as string)) {
    filterAttributes.success = true;
  }
  if (req.query.startDate || req.query.endDate) {
    filterAttributes[Op.and] = [
      req.query.startDate
        ? sequelize.where(
          sequelize.fn('DATE', sequelize.col('Transaction.createdAt')),
          { [Op.gte]: req.query.startDate },
        ) : null,
      req.query.endDate
        ? sequelize.where(
          sequelize.fn('DATE', sequelize.col('Transaction.createdAt')),
          { [Op.lte]: req.query.endDate },
        ) : null,
    ];
  }
  return filterAttributes;
}

export default {
  index: async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const offset = (page - 1) * limit;

      const limitQuery = limit === -1 ? {} : { limit };

      const TransactionCount = await Transaction.findAndCountAll({
        include: [TransactionAirtelMoney, FinacleTransaction, User],
        where: generateFilterAttributes(req),
        ...limitQuery,
        offset,
        order: [['createdAt', 'DESC']],
      });
      const TransactionsSize = TransactionCount.count;
      const totalPages = Math.ceil(TransactionsSize / limit);

      res.status(200).json({
        data: TransactionCount.rows,
        lastPage: totalPages,
        currentPage: page,
        limit,
        total: TransactionsSize,
      });
    } catch (error) {
      res.status(500).json(error);
    }
  },
  exportInCSV: async (req: Request, res: Response) => {
    try {
      const filename = `transaction-auto-allocation-${new Date().toISOString().replace(/:/g, '-')}.xlsx`;
      const transactions = await Transaction.findAll({
        where: generateFilterAttributes(req),
        raw: true,
        attributes: {
          exclude: ['updatedAt', 'deletedAt'],
          include: [[
            Sequelize.literal(`(
              SELECT email FROM users WHERE users.id = Transaction.userId
            )`),
            'user_email',
          ]],
        },
      });

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(transactions);

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      res.send(excelBuffer);
    } catch (error) {
      res.status(500).json(error);
    }
  },
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
