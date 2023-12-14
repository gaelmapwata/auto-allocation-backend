import {
  Table, Column, Model, BelongsToMany,
} from 'sequelize-typescript';
import Role from './Role';
import UserRole from './UserRole';

@Table({
  tableName: 'users',
  timestamps: true,
  paranoid: true,
})
export default class User extends Model {
  static fillable = ['email', 'accountNumberCDF', 'accountNumberUSD'];

  @Column
    email!: string;

  @Column
    accountNumberCDF!: string;

  @Column
    accountNumberUSD!: string;

  @BelongsToMany(() => Role, () => UserRole)
    roles!: Role[];
}
