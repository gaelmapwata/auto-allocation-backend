import {
  Table, Column, Model, ForeignKey, BelongsTo,
} from 'sequelize-typescript';

import User from './User';

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
    'note',
    'userId',
    'errorFinacle',
    'errorAirtelMoney',
  ];

  @ForeignKey(() => User)
  @Column
    msisdn!: string;

  @Column
    lastName!: string;

  @Column
    firstName!: string;

  @Column
    amount!: number;

  @Column
    note!: string;

  @Column
    userId!: number;

  @Column
    errorFinacle!: string;

  @Column
    errorAirtelMoney!: string;

  @BelongsTo(() => User)
    user!: User;
}
