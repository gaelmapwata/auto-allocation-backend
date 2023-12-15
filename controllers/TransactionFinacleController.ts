import FinacleTransaction from '../models/FinacleTransaction';
import User from '../models/User';
import { UBAUtilities } from '../utils/uba';
import UserService from '../services/UserService';

async function getDrAccountNUmber(
  payload:{
    userId:number,
    accountNumber: string,
    accountNumberCDF: string,
    accountNumberUSD: string,
    currency: string
  },
) : Promise<string> {
  const transactionPermission = await UserService.userByIdHasPermission(payload.userId, 'TRANSACTION:CREATE-WITH-MANUAL-ACCOUNT');
  if (transactionPermission) {
    return payload.accountNumber;
  }
  return payload.currency === 'CDF' ? payload.accountNumberCDF : payload.accountNumberUSD;
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
