import Permission from '../models/Permission';
import UserService from '../services/UserService';
import AppError from '../types/CustomError';

// eslint-disable-next-line import/prefer-default-export
export const UBAUtilities = {
  getAccountToCredited(devise: string) {
    if (devise === 'CDF') {
      return '015010069067';
    } if (devise === 'USD') {
      return '990820000842';
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
    if (userHasPermissionToSetManualAccountToDebit) {
      return payload.accountNumber;
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
