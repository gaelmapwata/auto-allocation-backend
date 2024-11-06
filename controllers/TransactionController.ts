import { Response } from 'express';
import { checkSchema, validationResult } from 'express-validator';
import XLSX from 'xlsx';
import {
  literal, Op, Sequelize, WhereOptions,
} from 'sequelize';
import transactionValidators from '../validators/transactionValidators';
import Transaction from '../models/Transaction';
import FinacleTransaction from '../models/FinacleTransaction';
import TransactionAirtelMoney from '../models/TransactionAirtelMoney';
import User from '../models/User';
import TransactionFinacleController from './TransactionFinacleController';
import TransactionFinacleService from '../services/transactionFinacleService';
import airtelMoneyService from '../services/airtelMoneyService';
import errorHandlerService from '../services/ErrorHandlerService';
import sequelize from '../sequelize-instance';
import {
  // eslint-disable-next-line max-len
  getTodayDate, getYesterdayDate, firstDayOfWeekDate, lastDayOfWeekDate, getFirstDayOfMonth, getLastDayOfMonth,
} from '../utils/data';
import LogHelper, { userLogIdentifier } from '../utils/logHelper';
import { Request } from '../types/ExpressOverride';
import UserService from '../services/UserService';
import Permission from '../models/Permission';
import { UBAUtilities } from '../utils/uba';
import Branch from '../models/Branch';

function updateTransactionById(id: number, data: {[key:string]: string | boolean | null}) {
  return Transaction.update(data, {
    where: {
      id,
    },
  });
}

async function generateFilterAttributes(req: Request):Promise<any> {
  const filterAttributes: any = {};

  const userCanSeeAllTransactionAtBankLevel = await UserService
    // eslint-disable-next-line max-len
    .userHasOneOfPermissions(req.user as User, Permission.TRANSACTION.READ_TRANSACTIONS_TO_VALIDATE_AT_BANK_LEVEL);

  if (userCanSeeAllTransactionAtBankLevel) {
    filterAttributes['$Branch.bankId$'] = req.user?.branch.bankId;
  } else {
    filterAttributes.branchId = req.user?.branchId;
  }

  const userCanSeeAllTransactions = await UserService
    .userHasOneOfPermissions(req.user as User, Permission.TRANSACTION.READ);

  if (!userCanSeeAllTransactions) {
    filterAttributes.userId = req.userId;
  }

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
      const whereFilter = await generateFilterAttributes(req);

      const TransactionCount = await Transaction.findAndCountAll({
        include: [
          TransactionAirtelMoney,
          FinacleTransaction,
          Branch,
          { model: User, as: 'user' },
          { model: User, as: 'checker' },
        ],
        where: whereFilter,
        ...limitQuery,
        offset,
        order: [
          [
            literal(`
              CASE 
                WHEN error IS NOT NULL THEN 1 
                ELSE 0 
              END
            `),
            'DESC',
          ],
          ['createdAt', 'DESC'],
        ],
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
  getTransactionsToValidate: async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const offset = (page - 1) * limit;

      const limitQuery = limit === -1 ? {} : { limit };
      const whereFilter = await generateFilterAttributes(req);
      delete whereFilter.userId;

      const TransactionCount = await Transaction.findAndCountAll({
        include: [{ model: User, as: 'user' }, Branch],
        where: {
          ...whereFilter,
          checkerId: null,
        },
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

      const whereFilter = await generateFilterAttributes(req);

      const transactions = await Transaction.findAll({
        where: whereFilter,
        raw: true,
        attributes: {
          exclude: ['updatedAt', 'deletedAt'],
          include: [
            [
              Sequelize.literal(`(
                SELECT email FROM users WHERE users.id = Transaction.userId
              )`),
              'maker_email',
            ],
            [
              Sequelize.literal(`(
                SELECT email FROM users WHERE users.id = Transaction.checkerId
              )`),
              'checker_email',
            ],
            [
              Sequelize.literal(`(
                SELECT label FROM branches WHERE branches.id = Transaction.branchId
              )`),
              'branch',
            ],
          ],
        },
        order: [
          ['createdAt', 'DESC'],
        ],
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
        LogHelper.info(`Transaction | user (${userLogIdentifier(req)}) started a new transaction, payload: ${JSON.stringify(req.body)}`);

        const drAcctNum = await UBAUtilities.getDrAccountNUmber({
          accountNumber: req.body.accountNumber,
          accountNumberCDF: req.user?.accountNumberCDF || '',
          accountNumberUSD: req.user?.accountNumberUSD || '',
          currency: req.body.currency,
          userId: req.userId as number,
        });

        newTransaction = await Transaction.create({
          ...req.body,
          note: 'Allocation Deallocation',
          userId: (req as any).userId,
          drAcctNum,
          crAcctNum: UBAUtilities.getAccountToCredited(req.body.currency),
          branchId: req.user?.branchId,
        });

        LogHelper.info(`Transaction | transaction (${newTransaction.id}) generated by user (${userLogIdentifier(req)}) for msisdn (${newTransaction.msisdn})`);

        return res.status(201).json(newTransaction);
      } catch (error) {
        LogHelper.info(`Transaction | error occurred when treating transaction (${newTransaction?.id}) generated by user (${userLogIdentifier(req)}), error: (${error})`);
        return errorHandlerService.handleResponseError(res, error as Error);
      }
    },
  ],

  validateTransaction: async (req: Request, res: Response) => {
    const transaction = await Transaction.findByPk(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.checkerId) {
      return res.status(503).json({ message: 'This transaction has already been validated' });
    }

    if (transaction.currency === 'USD' && Number(transaction.amount) > Number((req.user as User).validateMaxAmountUSD)) {
      return res.status(503).send({ msg: `Transaction limit exceeded. You are only authorized to validate amounts below ${(req.user as User).validateMaxAmountUSD} USD` });
    }
    if (transaction.currency === 'CDF' && Number(transaction.amount) > Number((req.user as User).validateMaxAmountCDF)) {
      return res.status(503).send({ msg: `Transaction limit exceeded. You are only authorized to validate amounts below ${(req.user as User).validateMaxAmountCDF} CDF` });
    }

    try {
      LogHelper.info(`Transaction | user (${userLogIdentifier(req)}) initiate validation of a transaction, transactionId: ${transaction.id}`);
      transaction.checkerId = (req as any).userId;
      transaction.save();
      // eslint-disable-next-line max-len
      const transactionFinacle = await TransactionFinacleController.saveTransactionFinacle({
        amount: transaction.amount,
        currency: transaction.currency,
        libelle: transaction.msisdn,
        userId: (req as any).userId,
        transactionId: transaction.id,
        drAcctNum: transaction.drAcctNum,
        crAcctNum: transaction.crAcctNum,
      });

      // eslint-disable-next-line max-len
      const { stan, tranDateTime, success } = await TransactionFinacleService.sendTransaction(transactionFinacle);
      await FinacleTransaction.update(
        { stan, tranDateTime, success },
        { where: { transactionId: transaction.id } },
      );
      // eslint-disable-next-line max-len
      const resultAirtelMoneyService = await airtelMoneyService.autoAllocation(transaction);
      await TransactionAirtelMoney.create(
        {
          mq_txn_id: resultAirtelMoneyService.data.additional_info.mq_txn_id,
          reference_id: resultAirtelMoneyService.data.transaction.reference_id,
          airtel_money_id: resultAirtelMoneyService.data.transaction.airtel_money_id,
          transaction_airtel_money_id: resultAirtelMoneyService.data.transaction.id,
          // eslint-disable-next-line max-len
          transaction_airtel_money_status: resultAirtelMoneyService.data.transaction.status,
          transactionId: transaction.id,
        },
      );

      updateTransactionById(transaction.id, { success: true });
      LogHelper.info(`Transaction | transaction (${transaction.id}) validated by user (${userLogIdentifier(req)}) successfully`);

      return res.status(200).json(transaction);
    } catch (error) {
      LogHelper.info(`Transaction | error occurred when validating  transaction (${transaction.id}) generated by user (${userLogIdentifier(req)}), error: (${error})`);
      updateTransactionById(transaction.id, { error: (error as Error).message });
      return errorHandlerService.handleResponseError(res, error as Error);
    }
  },

  revalidateTransaction: async (req:Request, res: Response) => {
    const transaction = await Transaction.findByPk(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (!transaction.errorAirtelMoney || transaction.success) {
      return res.status(503).json({ message: 'This transaction has already been passed successful' });
    }

    if (!transaction.isAuthorized) {
      return res.status(503).json({ message: 'this transaction has not yet been authorized by admin' });
    }

    if (transaction.currency === 'USD' && Number(transaction.amount) > Number((req.user as User).validateMaxAmountUSD)) {
      return res.status(503).send({ msg: `Transaction limit exceeded. You are only authorized to validate amounts below ${(req.user as User).validateMaxAmountUSD} USD` });
    }

    if (transaction.currency === 'CDF' && Number(transaction.amount) > Number((req.user as User).validateMaxAmountCDF)) {
      return res.status(503).send({ msg: `Transaction limit exceeded. You are only authorized to validate amounts below ${(req.user as User).validateMaxAmountCDF} CDF` });
    }
    try {
      LogHelper.info(`Transaction | user (${userLogIdentifier(req)}) revalidate  a transaction, transactionId: ${transaction.id}`);
      // eslint-disable-next-line max-len
      const resultAirtelMoneyService = await airtelMoneyService.autoAllocation(transaction);
      await TransactionAirtelMoney.create(
        {
          mq_txn_id: resultAirtelMoneyService.data.additional_info.mq_txn_id,
          reference_id: resultAirtelMoneyService.data.transaction.reference_id,
          airtel_money_id: resultAirtelMoneyService.data.transaction.airtel_money_id,
          transaction_airtel_money_id: resultAirtelMoneyService.data.transaction.id,
          // eslint-disable-next-line max-len
          transaction_airtel_money_status: resultAirtelMoneyService.data.transaction.status,
          transactionId: transaction.id,
        },
      );

      updateTransactionById(transaction.id, { success: true, error: null, errorAirtelMoney: null });
      LogHelper.info(`Transaction | transaction (${transaction.id}) revalidated by user (${userLogIdentifier(req)}) successfully`);

      return res.status(200).json(transaction);
    } catch (error) {
      LogHelper.info(`Transaction | error occurred when revalidating  transaction (${transaction.id}) generated by user (${userLogIdentifier(req)}), error: (${error})`);
      updateTransactionById(transaction.id, { error: (error as Error).message });
      return errorHandlerService.handleResponseError(res, error as Error);
    }
  },

  authorizeToReValidateTransaction: async (req:Request, res: Response) => {
    const transaction = await Transaction.findByPk(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    if (!transaction.errorAirtelMoney || transaction.success) {
      return res.status(503).json({ message: 'This transaction has already been passed successful' });
    }
    try {
      LogHelper.info(`Transaction | user (${userLogIdentifier(req)}) authorized to revalidate  a transaction, transactionId: ${transaction.id}`);
      const data = await Transaction.update(
        { isAuthorized: true },
        { where: { id: transaction.id } },
      );
      return res.status(200).json(data);
    } catch (error) {
      LogHelper.info(`Transaction | error occurred when authorized  transaction (${transaction.id}) generated by user (${userLogIdentifier(req)}), error: (${error})`);
      updateTransactionById(transaction.id, { error: (error as Error).message });
      return errorHandlerService.handleResponseError(res, error as Error);
    }
  },

  cancelTransaction: async (req:Request, res: Response) => {
    const transaction = await Transaction.findByPk(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.checkerId) {
      return res.status(503).json({ message: 'This transaction has already been validated' });
    }

    try {
      LogHelper.info(`Transaction | user (${userLogIdentifier(req)}) canceled  a transaction, transactionId: ${transaction.id}`);
      const data = await Transaction.update(
        {
          success: false,
          error: 'The transaction was canceled by your validator',
          checkerId: (req as any).userId,
        },
        { where: { id: transaction.id } },
      );
      return res.status(200).json(data);
    } catch (error) {
      LogHelper.info(`Transaction | error occurred when cancel  transaction (${transaction.id}) generated by user (${userLogIdentifier(req)}), error: (${error})`);
      updateTransactionById(transaction.id, { error: (error as Error).message });
      return errorHandlerService.handleResponseError(res, error as Error);
    }
  },

  getStats: async (req: Request, res: Response) => {
    const todayDate = getTodayDate();
    const yesterday = getYesterdayDate();
    const firstDayWeek = firstDayOfWeekDate();
    const lastDayWeek = lastDayOfWeekDate();
    const firstDayMonth = getFirstDayOfMonth();
    const lastDayMonth = getLastDayOfMonth();

    const userCanSeeAllTransactions = await UserService
      .userHasOneOfPermissions(req.user as User, Permission.TRANSACTION.READ);

    const whereFilter: WhereOptions = {};

    if (!userCanSeeAllTransactions) {
      whereFilter.userId = req.userId;
    }
    whereFilter['$Branch.bankId$'] = req.user?.branch.bankId;

    const nbToday = await Transaction.count({
      include: [{ model: Branch, attributes: ['id', 'bankId'] }],
      where: {
        ...whereFilter,
        success: true,
        [Op.and]: Sequelize.where(
          Sequelize.fn('DATE', Sequelize.col('Transaction.createdAt')),
          todayDate,
        ),
      },
    });

    const nbYesterday = await Transaction.count({
      include: [{ model: Branch, attributes: ['id', 'bankId'] }],
      where: {
        ...whereFilter,
        success: true,
        [Op.and]: Sequelize.where(
          Sequelize.fn('DATE', Sequelize.col('Transaction.createdAt')),
          yesterday,
        ),
      },
    });

    const nbWeek = await Transaction.count({
      include: [{ model: Branch, attributes: ['id', 'bankId'] }],
      where: {
        ...whereFilter,
        success: true,
        [Op.and]: [
          Sequelize.where(
            Sequelize.fn('DATE', Sequelize.col('Transaction.createdAt')),
            { [Op.gte]: firstDayWeek },
          ),
          Sequelize.where(
            Sequelize.fn('DATE', Sequelize.col('Transaction.createdAt')),
            { [Op.lte]: lastDayWeek },
          ),
        ],
      },
    });

    const nbMonth = await Transaction.count({
      include: [{ model: Branch, attributes: ['id', 'bankId'] }],
      where: {
        ...whereFilter,
        success: true,
        [Op.and]: [
          Sequelize.where(
            Sequelize.fn('DATE', Sequelize.col('Transaction.createdAt')),
            { [Op.gte]: firstDayMonth },
          ),
          Sequelize.where(
            Sequelize.fn('DATE', Sequelize.col('Transaction.createdAt')),
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
