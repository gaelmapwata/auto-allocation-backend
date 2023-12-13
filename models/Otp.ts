import {
  Table, Column, Model,
} from 'sequelize-typescript';

@Table({
  tableName: 'otps',
  timestamps: true,
})

export default class Otp extends Model {
  // Propriétés fillable
  static fillable: string[] = ['email', 'otp', 'expirationDate'];

  @Column
    email!: string;

  @Column
    otp!: string;

  @Column
    expirationDate!: string;
}
