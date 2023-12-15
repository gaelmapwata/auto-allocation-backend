import FinacleTransaction from '../models/FinacleTransaction';
import User from '../models/User';
import { UBAUtilities } from '../utils/uba';

export default {
  // eslint-disable-next-line max-len
  saveTransactionFinacle: async (tranAmt:number, tranCrncyCode:string, reservedFld1:string, userId:number, transactionId:number) => {
    const user = await User.findByPk(userId);
    const transactionFinacle = await FinacleTransaction.create({
      tranAmt,
      tranCrncyCode,
      countryCode: 'COD',
      drAcctNum: tranCrncyCode === 'CDF' ? user?.accountNumberCDF : user?.accountNumberUSD,
      crAcctNum: UBAUtilities.getAccountTocredited(tranCrncyCode),
      reservedFld1: `Auto Allocation ${reservedFld1}`,
      transactionId,
    });
    return transactionFinacle;
  },
};
