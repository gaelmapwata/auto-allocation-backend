const authValidators = {
  signinSchema: {
    email: {
      isEmail: {
        errorMessage: 'The "email" field is invalid',
      },
      notEmpty: {
        errorMessage: 'The "email" field is mandatory',
      },
    },
    password: {
      notEmpty: {
        errorMessage: 'The "password" field is mandatory',
      },
    },
  },
};

export default authValidators;
