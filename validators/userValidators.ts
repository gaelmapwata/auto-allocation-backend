import User from '../models/User';

const userValidators = {
  storeSchema: {
    email: {
      isEmail: {
        errorMessage: 'The "Email" field is invalid',
      },
      notEmpty: {
        errorMessage: 'The "Email" field is mandatory',
      },
      custom: {
        options: async (value: string) => {
          const user = await User.findOne({ where: { email: value }, paranoid: false });
          if (user && !user.deletedAt) {
            throw new Error('A user with this email address already exists');
          }
          if (user) {
            throw new Error('This email has already been used by a deleted user');
          }
        },
      },
    },
    roleId: {
      isInt: true,
      optional: true,
    },
    branchId: {
      isInt: true,
      notEmpty: {
        errorMessage: 'The "Branch" field is mandatory',
      }
    },
  },

  updateSchema: {
    email: {
      isEmail: {
        errorMessage: 'The "Email" field is invalid',
      },
      notEmpty: {
        errorMessage: 'The "Email" field is mandatory',
      },
      custom: {
        options: async (value: string, { req }: { req: any }) => {
          const { id } = req.params;
          const user = await User.findByPk(id);
          if (user && user.email !== value) {
            const existUser = await User.findOne({ where: { email: value }, paranoid: false });
            if (existUser && !existUser.deletedAt) {
              throw new Error('A user with this email address already exists');
            }
            if (existUser) {
              throw new Error('This email has already been used by a deleted user');
            }
          }
        },
      },
    },
    roleId: {
      isInt: true,
      optional: true,
    },
    branchId: {
      isInt: true,
      optional: true,
    },
  },
};

export default userValidators;
