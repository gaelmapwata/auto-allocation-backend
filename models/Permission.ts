import {
  Table, Column, Model, BelongsTo, BelongsToMany, ForeignKey,
} from 'sequelize-typescript';
import Ressource from './Ressource';
import PermissionRole from './PermissionRole';
import Role from './Role';

@Table({
  tableName: 'permissions',
  timestamps: true,
  paranoid: true,
})
export default class Permission extends Model {
  static USER = {
    CREATE: 'USER:CREATE',
    READ: 'USER:READ',
    DELETE: 'USER:DELETE',
    UPDATE: 'USER:UPDATE',
    LOCK: 'USER:LOCK',
    UNLOCK: 'USER:UNLOCK',
    VALIDATE: 'USER:VALIDATE',
    ALL: 'USER:ALL',
  };

  static ROLE = {
    CREATE: 'ROLE:CREATE',
    READ: 'ROLE:READ',
    DELETE: 'ROLE:DELETE',
    UPDATE: 'ROLE:UPDATE',
    ADD_PERMISSIONS: 'ROLE:ADD_PERMISSIONS',
    UPDATE_PERMISSIONS: 'ROLE:UPDATE_PERMISSIONS',
    ALL: 'ROLE:ALL',
  };

  static RESSOURCE = {
    READ: 'RESSOURCE:READ',
    ALL: 'RESSOURCE:ALL',
  };

  static AIRTEL = {
    CHECK_KYC: 'AIRTEL:CHECK_KYC',
  };

  static TRANSACTION = {
    READ: 'TRANSACTION:READ',
    READ_OWN_TRANSACTIONS: 'TRANSACTION:READ_OWN_TRANSACTIONS',
    READ_TRANSACTIONS_TO_VALIDATE: 'TRANSACTION:READ_TRANSACTIONS_TO_VALIDATE',
    EXPORT: 'TRANSACTION:EXPORT',
    CREATE: 'TRANSACTION:CREATE',
    VALIDATE: 'TRANSACTION:VALIDATE',
    CREATE_WITH_MANUAL_ACCOUNT: 'TRANSACTION:CREATE_WITH_MANUAL_ACCOUNT',
  };

  static BRANCH = {
    READ: 'BRANCH:READ',
    CREATE: 'BRANCH:CREATE',
    UPDATE: 'BRANCH:UPDATE',
    DELETE: 'BRANCH:DELETE',
    ALL: 'BRANCH:ALL',
  };

  @ForeignKey(() => Ressource)
  @Column
    ressourceId!: number;

  @Column
    name!: string;

  @Column
    slug!: string;

  @BelongsTo(() => Ressource)
    ressource!: Ressource;

  @BelongsToMany(() => Role, () => PermissionRole)
    roles!: Role[];
}
