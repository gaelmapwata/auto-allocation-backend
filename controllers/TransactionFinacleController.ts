import FinacleTransaction from '../models/FinacleTransaction';
import User from '../models/User';
import { UBAUtilities } from '../utils/uba';
import UserService from '../services/UserService';
import AppError from '../types/CustomError';

async function getDrAccountNUmber(
  payload:{
    userId:number,
    accountNumber: string,
    accountNumberCDF: string,
    accountNumberUSD: string,
    currency: string
  },
) : Promise<string> {
  const userHasPermissionToSetManualAccountToDebit = await UserService.userByIdHasPermission(payload.userId, 'TRANSACTION:CREATE-WITH-MANUAL-ACCOUNT');
  if (userHasPermissionToSetManualAccountToDebit) {
    return payload.accountNumber;
  }

  if (payload.currency === 'CDF' && !payload.accountNumberCDF) {
    throw new AppError('Vous n\'avez pas de compte en CDF configuré', 400);
  } else if (payload.currency === 'USD' && !payload.accountNumberUSD) {
    throw new AppError('Vous n\'avez pas de compte en USD configuré', 400);
  } else {
    return payload.currency === 'CDF' ? payload.accountNumberCDF : payload.accountNumberUSD;
  }
}

export default {
  // eslint-disable-next-line max-len
  saveTransactionFinacle: async (
    payload: {
      amount: number,
      currency: string,
      libelle: string,
      userId: number,
      transactionId: number,
      accountNumber: string
  },
  ) => {
    const user = await User.findByPk(payload.userId);
    const drAcctNum = await getDrAccountNUmber({
      accountNumber: payload.accountNumber,
      accountNumberCDF: user?.accountNumberCDF || '',
      accountNumberUSD: user?.accountNumberCDF || '',
      currency: payload.currency,
      userId: payload.userId,
    });

    const transactionFinacle = await FinacleTransaction.create({
      tranAmt: payload.amount,
      tranCrncyCode: payload.currency,
      countryCode: 'COD',
      drAcctNum,
      crAcctNum: UBAUtilities.getAccountToCredited(payload.currency),
      reservedFld1: `Auto Allocation ${payload.libelle}`,
      transactionId: payload.transactionId,
    });

    return transactionFinacle;
  },

};
