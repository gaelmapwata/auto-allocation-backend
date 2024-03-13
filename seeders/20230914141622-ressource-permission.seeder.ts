/* eslint-disable import/no-import-module-exports */
import { QueryInterface } from 'sequelize';
import Permission from '../models/Permission';
import Ressource from '../models/Ressource';
import sequelize from '../sequelize-instance';

interface IRessource {
  name: string;
  permissions: Array<{
    name: string;
    slug: string;
  }>
}
const RESSOURCES: IRessource[] = [
  {
    name: 'user',
    permissions: [
      { name: 'create', slug: Permission.USER.CREATE },
      { name: 'update', slug: Permission.USER.UPDATE },
      { name: 'read', slug: Permission.USER.READ },
      { name: 'delete', slug: Permission.USER.DELETE },
      { name: 'all', slug: Permission.USER.ALL },
    ],
  },
  {
    name: 'role',
    permissions: [
      { name: 'create', slug: Permission.ROLE.CREATE },
      { name: 'update', slug: Permission.ROLE.UPDATE },
      { name: 'read', slug: Permission.ROLE.READ },
      { name: 'delete', slug: Permission.ROLE.DELETE },
      { name: 'all', slug: Permission.ROLE.ALL },
    ],
  },
  {
    name: 'ressource',
    permissions: [
      { name: 'read', slug: Permission.RESSOURCE.READ },
      { name: 'all', slug: Permission.RESSOURCE.ALL },
    ],
  },
  {
    name: 'airtel',
    permissions: [
      { name: 'check-kyc', slug: Permission.AIRTEL.CHECK_KYC },
    ],
  },
  {
    name: 'transaction',
    permissions: [
      { name: 'read', slug: Permission.TRANSACTION.READ },
      { name: 'read-own-transactions', slug: Permission.TRANSACTION.READ_OWN_TRANSACTIONS },
      { name: 'create', slug: Permission.TRANSACTION.CREATE },
      { name: 'create-with-manual-account', slug: Permission.TRANSACTION.CREATE_WITH_MANUAL_ACCOUNT },
      { name: 'export', slug: Permission.TRANSACTION.EXPORT },
    ],
  },
];

module.exports = {
  up: () => new Promise((resolve, reject) => {
    // eslint-disable-next-line max-len
    const saveRessource = async (ressource: IRessource): Promise<void> => new Promise((resolveRessource) => {
      Ressource.findOrCreate({
        where: { name: ressource.name },
        defaults: { name: ressource.name },
      }).then(([ressourceCreated]) => {
        Promise.all(
          ressource.permissions.map((permission) => Permission.findOrCreate({
            where: { slug: permission.slug },
            defaults: {
              ...permission,
              ressourceId: ressourceCreated.id,
            },
          })),
        )
          .then(() => {
            resolveRessource();
          });
      });
    });

    sequelize.authenticate()
      .then(() => {
        Promise.all(
          RESSOURCES.map((ressource) => saveRessource(ressource)),
        )
          .then(() => resolve(null));
      })
      .catch((error: Error) => {
        reject(error);
      });
  }),

  down: async (queryInterface: QueryInterface) => {
    // Your rollback logic here
    await queryInterface.bulkDelete('permissions', {}, {});
    await queryInterface.bulkDelete('ressources', {}, {});

    // Return a Promise that resolves when the rollback is complete
    return Promise.resolve();
  },
};
