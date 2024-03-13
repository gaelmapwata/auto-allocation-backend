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
    READ_OWN_TRANSACTIONS: 'TRANSACTION:READ-OWN-TRANSACTIONS',
    EXPORT: 'TRANSACTION:EXPORT',
    CREATE: 'TRANSACTION:CREATE',
    CREATE_WITH_MANUAL_ACCOUNT: 'TRANSACTION:CREATE_WITH_MANUAL_ACCOUNT',
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
