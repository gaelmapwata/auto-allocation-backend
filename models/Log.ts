import {
  Table, Column, Model, ForeignKey, BelongsTo,
} from 'sequelize-typescript';

import User from './User';

@Table({
  tableName: 'logs',
  timestamps: true,
  paranoid: true,
})

export default class Log extends Model {
  // Propriétés fillable
  static fillable: string[] = ['action', 'description', 'userId'];

  @Column
    action!: string;

  @Column
    description!: string;

  @ForeignKey(() => User)
  @Column
    userId!: number;

  @BelongsTo(() => User)
    user!: User;
}
