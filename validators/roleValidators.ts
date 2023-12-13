import Role from '../models/Role';

const roleValidators = {
  storeSchema: {
    name: {
      notEmpty: true,
      errorMessage: 'Le champ "name" est obligatoire',
      custom: {
        options: async (value: string) => {
          if (await Role.findOne({ where: { name: value } })) {
            throw new Error('Un role ayant ce nom existe déjà');
          }
        },
      },
    },
  },
  updateSchema: {
    name: {
      notEmpty: {
        errorMessage: 'Le champ "name" est obligatoire',
      },
      custom: {
        options: async (value: string, { req }: { req: any }) => {
          const { id } = req.params;
          const role = await Role.findByPk(id);
          if (role && role.name !== value) {
            if (await Role.findOne({ where: { name: value } })) {
              throw new Error('Un role ayant ce nom existe déjà');
            }
          }
        },
      },
    },
  },
  addPermissionSchema: {
    permissions: {
      isArray: true,
      errorMessage: 'Le champ "permissions" doit être un tableau"',
    },
    'permissions.*': {
      isInt: true,
    },
  },
  updatePermissionSchema: {
    permissions: {
      isArray: true,
      errorMessage: 'Le champ "permissions" doit être un tableau"',
    },
    'permissions.*': {
      isInt: true,
    },
  },
};

export default roleValidators;
