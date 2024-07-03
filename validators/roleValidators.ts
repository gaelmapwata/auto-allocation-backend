import Role from '../models/Role';

const roleValidators = {
  storeSchema: {
    name: {
      notEmpty: true,
      errorMessage: 'The "name" field is mandatory',
      custom: {
        options: async (value: string) => {
          if (await Role.findOne({ where: { name: value } })) {
            throw new Error('A role with this name already exists');
          }
        },
      },
    },
  },
  updateSchema: {
    name: {
      notEmpty: {
        errorMessage: 'The "name" field is mandatory',
      },
      custom: {
        options: async (value: string, { req }: { req: any }) => {
          const { id } = req.params;
          const role = await Role.findByPk(id);
          if (role && role.name !== value) {
            if (await Role.findOne({ where: { name: value } })) {
              throw new Error('A role with this name already exists');
            }
          }
        },
      },
    },
  },
  addPermissionSchema: {
    permissions: {
      isArray: true,
      errorMessage: 'The "permissions" field must be an array',
    },
    'permissions.*': {
      isInt: true,
    },
  },
  updatePermissionSchema: {
    permissions: {
      isArray: true,
      errorMessage: 'The "permissions" field must be an array',
    },
    'permissions.*': {
      isInt: true,
    },
  },
};

export default roleValidators;
