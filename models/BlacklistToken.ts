import {
  Table, Column, Model,
} from 'sequelize-typescript';

@Table({
  tableName: 'blacklist_tokens',
  timestamps: true,
  paranoid: true,
})

export default class Otp extends Model {
  // Propriétés fillable
  static fillable: string[] = ['token'];

  @Column
    token!: string;
}
