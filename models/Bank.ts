import {
  Table, Column, Model, ForeignKey, BelongsTo,
} from 'sequelize-typescript';

import Country from './Country';

@Table({
  tableName: 'banks',
  timestamps: true,
  paranoid: true,
})

export default class Bank extends Model {
  static fillable: string[] = ['label', 'countryId', 'bankId'];

  @Column
    label!: string;

  @Column
    bankId!: string;

  @ForeignKey(() => Country)
  @Column
    countryId!: number;

  @BelongsTo(() => Country)
    country!: Country;
}
