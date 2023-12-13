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

  @ForeignKey(() => User)
  @Column
    userId!: number;

  @Column
    action!: string;

  @Column
    description!: string;

  @BelongsTo(() => User)
    user!: User;
}
