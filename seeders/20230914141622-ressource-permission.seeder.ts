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
      { name: 'create', slug: 'USER:CREATE' },
      { name: 'update', slug: 'USER:UPDATE' },
      { name: 'read', slug: 'USER:READ' },
      { name: 'delete', slug: 'USER:DELETE' },
      { name: 'all', slug: 'USER:ALL' },
    ],
  },
  {
    name: 'role',
    permissions: [
      { name: 'create', slug: 'ROLE:CREATE' },
      { name: 'update', slug: 'ROLE:UPDATE' },
      { name: 'read', slug: 'ROLE:READ' },
      { name: 'delete', slug: 'ROLE:DELETE' },
      { name: 'all', slug: 'ROLE:ALL' },
    ],
  },
  {
    name: 'ressource',
    permissions: [
      { name: 'read', slug: 'RESSOURCE:READ' },
      { name: 'all', slug: 'RESSOURCE:ALL' },
    ],
  },
  {
    name: 'transaction',
    permissions: [
      { name: 'read', slug: 'TRANSACTION:READ' },
      { name: 'create', slug: 'TRANSACTION:CREATE' },
      { name: 'create-with-manual-account', slug: 'TRANSACTION:CREATE-WITH-MANUAL-ACCOUNT' },
      { name: 'all', slug: 'TRANSACTION:ALL' },
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
