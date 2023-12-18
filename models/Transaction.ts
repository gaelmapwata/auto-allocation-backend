import {
  Table, Column, Model, ForeignKey, BelongsTo, HasOne,
} from 'sequelize-typescript';

import User from './User';
import TransactionAirtelMoney from './TransactionAirtelMoney';
import FinacleTransaction from './FinacleTransaction';

@Table({
  tableName: 'transactions',
  timestamps: true,
  paranoid: true,
})

export default class Transaction extends Model {
  // Propriétés fillable
  static fillable: string[] = [
    'msisdn',
    'lastName',
    'firstName',
    'amount',
    'currency',
    'note',
    'userId',
    'errorFinacle',
    'errorAirtelMoney',
  ];

  @Column
    msisdn!: string;

  @Column
    lastName!: string;

  @Column
    firstName!: string;

  @Column
    amount!: number;

  @Column
    currency!: string;

  @Column
    note!: string;

  @Column
    errorFinacle!: string;

  @Column
    errorAirtelMoney!: string;

  @Column
    error!: string;

  @Column
    success!: boolean;

  @ForeignKey(() => User)
  @Column
    userId!: number;

  @BelongsTo(() => User)
    user!: User;

  @HasOne(() => TransactionAirtelMoney)
    transactionAirtelMoney!: TransactionAirtelMoney;

  @HasOne(() => FinacleTransaction)
    finacleTransaction!: FinacleTransaction;
}
