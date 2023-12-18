import {
  Table, Column, Model, BelongsToMany, HasMany,
} from 'sequelize-typescript';
import Role from './Role';
import Transaction from './Transaction';
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

  @HasMany(() => Transaction)
    transactions!: Transaction[];
}
