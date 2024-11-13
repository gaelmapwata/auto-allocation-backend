import Permission from '../models/Permission';
import UserService from '../services/UserService';
import AppError from '../types/CustomError';

// eslint-disable-next-line import/prefer-default-export
export const UBAUtilities = {
  getAccountToCredited(devise: string) {
    if (devise === 'CDF') {
      return '010110000064';
    } if (devise === 'USD') {
      return '010120000055';
    }
    throw new AppError('Aucune devise fournie', 400);
  },

  async getDrAccountNUmber(
    payload:{
      userId:number,
      accountNumber: string,
      accountNumberCDF: string,
      accountNumberUSD: string,
      currency: string
    },
  ) : Promise<string> {
    const userHasPermissionToSetManualAccountToDebit = await UserService
      .userByIdHasPermission(payload.userId, Permission.TRANSACTION.CREATE_WITH_MANUAL_ACCOUNT);

    const userHasPermissionToUseOwnAccountToDebit = await UserService
      .userByIdHasPermission(payload.userId, Permission.TRANSACTION.CREATE_WITH_OWN_ACCOOUNT);

    if (userHasPermissionToSetManualAccountToDebit) {
      if (userHasPermissionToUseOwnAccountToDebit && payload.accountNumber) {
        // the account number is optional for user that can use their own account to debit
        // if the account number is not provided the second condition will be false
        // as their have the permission to use their own accoount to debit
        // so we will use the account number of the user in the below code
        // "payload.accountNumberCDF" || "payload.accountNumberUSD"
        return payload.accountNumber;
      } if (!userHasPermissionToUseOwnAccountToDebit) {
        return payload.accountNumber;
      }
    }

    if (payload.currency === 'CDF' && !payload.accountNumberCDF) {
      throw new AppError('L\'utilisateur connecté n\'a pas de compte en CDF configuré', 400);
    } else if (payload.currency === 'USD' && !payload.accountNumberUSD) {
      throw new AppError('L\'utilisateur connecté n\'a pas de compte en USD configuré', 400);
    } else {
      return payload.currency === 'CDF' ? payload.accountNumberCDF : payload.accountNumberUSD;
    }
  },
};
