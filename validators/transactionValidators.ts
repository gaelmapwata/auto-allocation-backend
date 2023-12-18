import UserService from '../services/UserService';

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
        options: async (value: string, { req }: { req: any }) => {
          const userHasPermissionToSetManualAccountToDebit = await UserService
            .userByIdHasPermission((req as any).userId, 'TRANSACTION:CREATE-WITH-MANUAL-ACCOUNT');

          if (userHasPermissionToSetManualAccountToDebit && !value) {
            throw new Error('Le champ "accountNumber" est obligatoire');
          }
        },
      },
    },
  },
};

export default transactionValidators;
