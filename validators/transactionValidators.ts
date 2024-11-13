import Permission from '../models/Permission';
import UserService from '../services/UserService';
import { Request } from '../types/ExpressOverride';

const transactionValidators = {
  storeTransactionSchema: {
    msisdn: {
      notEmpty: {
        errorMessage: 'The "msisdn" field is mandatory',
      },
    },
    lastName: {
      notEmpty: {
        errorMessage: 'The "lastName" field is mandatory',
      },
    },
    firstName: {
      notEmpty: {
        errorMessage: 'The "firstName" field is mandatory',
      },
    },
    currency: {
      notEmpty: {
        errorMessage: 'The "currency" field is mandatory',
      },
    },
    amount: {
      notEmpty: {
        errorMessage: 'The "amount" field is mandatory',
      },
      isFloat: {
        errorMessage: 'The "amount" field must be a valid decimal.',
      },
    },
    accountNumber: {
      custom: {
        options: async (value: string, { req }: { req: unknown }) => {
          const userHasPermissionToSetManualAccountToDebit = await UserService
            .userByIdHasPermission(
              (req as Request).userId as number,
              Permission.TRANSACTION.CREATE_WITH_MANUAL_ACCOUNT,
            );

          const userHasPermissionToUseOwnAccountToDebit = await UserService
            .userByIdHasPermission(
              (req as Request).userId as number,
              Permission.TRANSACTION.CREATE_WITH_OWN_ACCOOUNT,
            );

          if (
            userHasPermissionToSetManualAccountToDebit
            && !userHasPermissionToUseOwnAccountToDebit
            && !value
          ) {
            throw new Error('The "accountNumber" field is mandatory');
          }
        },
      },
    },
  },
};

export default transactionValidators;
