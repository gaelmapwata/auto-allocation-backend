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
  static fillable = [
    'email',
    'accountNumberCDF',
    'accountNumberUSD',
    'validateMaxAmountUSD',
    'validateMaxAmountCDF',
    'totalLoginAttempt',
    'locked',
  ];

  @Column
    email!: string;

  @Column
    accountNumberCDF!: string;

  @Column
    accountNumberUSD!: string;

  @Column
    validateMaxAmountUSD!: number;

  @Column
    validateMaxAmountCDF!: number;

  @Column
    totalLoginAttempt!: number;

  @Column
    locked!: boolean;

  @BelongsToMany(() => Role, () => UserRole)
    roles!: Role[];

  @HasMany(() => Transaction)
    transactions!: Transaction[];
}
