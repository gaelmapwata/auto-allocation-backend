import User from '../models/User';

const userValidators = {
  storeSchema: {
    email: {
      isEmail: {
        errorMessage: 'Le champ "Email" est invalide',
      },
      notEmpty: {
        errorMessage: 'Le champ "Email" est obligatoire',
      },
      custom: {
        options: async (value: string) => {
          const user = await User.findOne({ where: { email: value }, paranoid: false });
          if (user && !user.deletedAt) {
            throw new Error('Un utilisateur ayant cet email existe déjà');
          }
          if (user) {
            throw new Error('Cet email a déjà été utilisé par un utilisateur supprimé');
          }
        },
      },
    },
    roles: {
      optional: true,
      isArray: {
        errorMessage: 'Le champ "roles" doit être un tableau',
      },
    },
    'roles.*': {
      isInt: true,
    },
  },

  addRolesSchema: {
    roles: {
      isArray: {
        errorMessage: 'Le champ "roles" doit être un tableau',
      },
    },
    'roles.*': {
      isInt: true,
    },
  },

  updateSchema: {
    email: {
      isEmail: {
        errorMessage: 'Le champ "Email" est invalide',
      },
      notEmpty: {
        errorMessage: 'Le champ "Email" est obligatoire',
      },
      custom: {
        options: async (value: string, { req }: { req: any }) => {
          const { id } = req.params;
          const user = await User.findByPk(id);
          if (user && user.email !== value) {
            const existUser = await User.findOne({ where: { email: value }, paranoid: false });
            if (existUser && !existUser.deletedAt) {
              throw new Error('Un utilisateur ayant cet email existe déjà');
            }
            if (existUser) {
              throw new Error('Cet email a déjà été utilisé par un utilisateur supprimé');
            }
          }
        },
      },
    },
    roles: {
      optional: true,
      isArray: {
        errorMessage: 'Le champ "roles" doit être un tableau',
      },
    },
    'roles.*': {
      isInt: true,
    },
  },
};

export default userValidators;
