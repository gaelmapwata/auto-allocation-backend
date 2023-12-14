import {
  Table, Column, Model, ForeignKey, BelongsTo,
} from 'sequelize-typescript';

import Transaction from './Transaction';

@Table({
  tableName: 'transaction_airtel_moneys',
  timestamps: true,
  paranoid: true,
})

export default class TransactionAirtelMoney extends Model {
  // Propriétés fillable
  static fillable: string[] = [
    'mq_txn_id',
    'reference_id',
    'airtel_money_id',
    'transaction_airtel_money_id',
    'transaction_airtel_money_status',
    'transactionId',
  ];

  @Column
    mq_txn_id!: string;

  @Column
    reference_id!: string;

  @Column
    airtel_money_id!: string;

  @Column
    transaction_airtel_money_id!: string;

  @Column
    transaction_airtel_money_status!: string;

  @ForeignKey(() => Transaction)
  @Column
    transactionId!: number;

  @BelongsTo(() => Transaction)
    transaction!: Transaction;
}
