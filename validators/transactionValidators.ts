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
    note: {
      notEmpty: {
        errorMessage: 'Le champ "note" est obligatoire',
      },
    },
    userId: {
      notEmpty: {
        errorMessage: 'Le champ "userId" est obligatoire',
      },
      isInt: {
        errorMessage: 'Le champ "userId" doit-être un entier valide',
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
  },
};

export default transactionValidators;
