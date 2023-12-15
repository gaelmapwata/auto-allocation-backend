import FinacleTransaction from '../models/FinacleTransaction';
import User from '../models/User';
import { UBAUtilities } from '../utils/uba';

export default {
  // eslint-disable-next-line max-len
  saveTransactionFinacle: async (
    payload: {
      amount: number,
      currency: string,
      libelle: string,
      userId: number,
      transactionId: number
  },
  ) => {
    const user = await User.findByPk(payload.userId);

    const transactionFinacle = await FinacleTransaction.create({
      tranAmt: payload.amount,
      tranCrncyCode: payload.currency,
      countryCode: 'COD',
      drAcctNum: payload.currency === 'CDF' ? user?.accountNumberCDF : user?.accountNumberUSD,
      crAcctNum: UBAUtilities.getAccountToCredited(payload.currency),
      reservedFld1: `Auto Allocation ${payload.libelle}`,
      transactionId: payload.transactionId,
    });

    return transactionFinacle;
  },
};
