/* eslint-disable import/no-import-module-exports */
import { QueryInterface } from 'sequelize';
import sequelize from '../sequelize-instance';
import Role, { RoleE } from '../models/Role';
import Permission from '../models/Permission';

interface IRole {
  name: string;
  permissions: string[]
}

const ROLES: IRole[] = [
  {
    name: RoleE.ADMIN,
    permissions: [
      Permission.ROLE.ALL,
      Permission.USER.ALL,
      Permission.RESSOURCE.ALL,
      Permission.AIRTEL.CHECK_KYC,
      Permission.TRANSACTION.READ,
      Permission.TRANSACTION.EXPORT,
      Permission.TRANSACTION.READ_TRANSACTIONS_TO_VALIDATE,
      Permission.TRANSACTION.AUTHORIZE_REVALIDATION,
      Permission.BRANCH.ALL,
    ],
  },
  {
    name: RoleE.TELLER,
    permissions: [
      Permission.AIRTEL.CHECK_KYC,
      Permission.TRANSACTION.READ_OWN_TRANSACTIONS,
      Permission.TRANSACTION.CREATE,
      Permission.TRANSACTION.CREATE_WITH_OWN_ACCOOUNT,
      Permission.TRANSACTION.CREATE_WITH_MANUAL_ACCOUNT,
    ],
  },
  {
    name: RoleE.ETSHOPIE,
    permissions: [
      Permission.TRANSACTION.READ_TRANSACTIONS_TO_VALIDATE,
      Permission.TRANSACTION.VALIDATE,
      Permission.TRANSACTION.READ,
      Permission.TRANSACTION.REVALIDATE,
      Permission.TRANSACTION.READ_TRANSACTIONS_TO_VALIDATE_AT_BANK_LEVEL,
    ],
  },
  {
    name: RoleE.DOMOPS,
    permissions: [
      Permission.AIRTEL.CHECK_KYC,
      Permission.TRANSACTION.READ_OWN_TRANSACTIONS,
      Permission.TRANSACTION.CREATE,
      Permission.TRANSACTION.CREATE_WITH_MANUAL_ACCOUNT,
    ],
  },
  {
    name: RoleE.CSO,
    permissions: [
      Permission.TRANSACTION.READ_TRANSACTIONS_TO_VALIDATE,
      Permission.TRANSACTION.VALIDATE,
      Permission.TRANSACTION.READ,
      Permission.TRANSACTION.REVALIDATE,
    ],
  },
];

module.exports = {
  async up() {
    return new Promise((resolve, reject) => {
      sequelize.authenticate()
        .then(async () => {
          const permissions = await Permission.findAll();

          const saveRole = async (role: IRole): Promise<void> => new Promise((resolveRole) => {
            Role.findOrCreate({
              where: { name: role.name },
              defaults: { name: role.name },
            }).then(async ([roleDB]) => {
              await roleDB.$set(
                'permissions',
                role.permissions
                  .map((permission) => permissions.find((p) => p.slug === permission)?.id),
              );

              resolveRole();
            });
          });

          Promise.all(
            ROLES.map((role) => saveRole(role)),
          )
            .then(() => resolve(null));
        })
        .catch((error: Error) => {
          reject(error);
        });
    });
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.bulkDelete('roles', {}, {});
  },
};
