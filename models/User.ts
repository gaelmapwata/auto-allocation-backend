import {
  Table, Column, Model, BelongsToMany, HasMany,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import Role from './Role';
import Transaction from './Transaction';
import Branch from './Branch';
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
    'branchId',
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

  @ForeignKey(() => User)
  @Column
    validatedByUserId!: number;

  @ForeignKey(() => User)
  @Column
    validationAskedByUserId!: number;

  @ForeignKey(() => User)
  @Column
    createdByUserId!: number;

  @ForeignKey(() => User)
  @Column
    deletedByUserId!: number;

  @ForeignKey(() => Branch)
  @Column
    branchId!: number;

  @BelongsTo(() => Branch)
    branch!: Branch;

  @BelongsToMany(() => Role, () => UserRole)
    roles!: Role[];

  @HasMany(() => Transaction)
    transactions!: Transaction[];
}
