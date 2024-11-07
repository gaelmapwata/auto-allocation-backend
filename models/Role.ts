import {
  Table, Column, Model, BelongsToMany,
} from 'sequelize-typescript';
import UserRole from './UserRole';
import User from './User';
import PermissionRole from './PermissionRole';
import Permission from './Permission';
import Ressource from './Ressource';

@Table({
  tableName: 'roles',
  timestamps: true,
  paranoid: true,
})
export default class Role extends Model {
  static fillable: string[] = ['name'];

  @Column
    name!: string;

  @BelongsToMany(() => User, () => UserRole)
    users!: User[];

  @BelongsToMany(() => Permission, () => PermissionRole)
    permissions!: Permission[];

  ressources!: Ressource[];
}

export enum RoleE {
  ADMIN = 'admin',
  TELLER = 'TELLER',
  OPS = 'OPS',
  DOMOPS = 'DOMOPS',
  CSO = 'CSO',
}
