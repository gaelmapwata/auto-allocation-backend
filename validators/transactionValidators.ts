import Permission from '../models/Permission';
import UserService from '../services/UserService';
import { Request } from '../types/ExpressOverride';

const transactionValidators = {
  storeTransactionSchema: {
    msisdn: {
      notEmpty: {
        errorMessage: 'Le champ "msisdn" est obligatoire',
      },
    },
    lastName: {
      notEmpty: {
        errorMessage: 'Le champ "lastName" est obligatoire',
      },
    },
    firstName: {
      notEmpty: {
        errorMessage: 'Le champ "firstName" est obligatoire',
      },
    },
    currency: {
      notEmpty: {
        errorMessage: 'Le champ "currency" est obligatoire',
      },
    },
    amount: {
      notEmpty: {
        errorMessage: 'Le champ "amount" est obligatoire',
      },
      isFloat: {
        errorMessage: 'Le champ "amount" doit-être une decimal valide',
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

          if (userHasPermissionToSetManualAccountToDebit && !value) {
            throw new Error('Le champ "accountNumber" est obligatoire');
          }
        },
      },
    },
  },
};

export default transactionValidators;
