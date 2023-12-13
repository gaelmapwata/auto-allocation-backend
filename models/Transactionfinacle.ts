import {
  Table, Column, Model, ForeignKey, BelongsTo,
} from 'sequelize-typescript';

import Transaction from './Transaction';

@Table({
  tableName: 'transaction_finacles',
  timestamps: true,
  paranoid: true,
})

export default class Transactionfinacle extends Model {
  // Propriétés fillable
  static fillable: string[] = [
    'stan',
    'tranDateTime',
    'tranAmt',
    'processingCode',
    'tranCrncyCode',
    'countryCode',
    'valueDate',
    'drAcctNum',
    'crAcctNum',
    'reservedFld1',
    'drAcctNo',
    'crAcctNo',
    'amount',
    'transactionId',
  ];

  @Column
    stan!: number;

  @Column
    tranDateTime!: Date;

  @Column
    tranAmt!: number;

  @Column
    processingCode!: number;

  @Column
    tranCrncyCode!: string;

  @Column
    countryCode!: string;

  @Column
    valueDate!: Date;

  @Column
    drAcctNum!: string;

  @Column
    crAcctNum!: string;

  @Column
    reservedFld1!: string;

  @Column
    drAcctNo!: string;

  @Column
    crAcctNo!: string;

  @Column
    amount!: number;

  @ForeignKey(() => Transaction)
  @Column
    transactionId!: number;

  @BelongsTo(() => Transaction)
    transaction!: Transaction;
}
