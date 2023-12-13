import {
  Table, Column, Model, BelongsToMany,
} from 'sequelize-typescript';
import Role from './Role';
import UserRole from './UserRole';

@Table({
  tableName: 'users',
  timestamps: true,
  paranoid: true,
})
export default class User extends Model {
  static fillable = ['email'];

  @Column
    email!: string;

  @BelongsToMany(() => Role, () => UserRole)
    roles!: Role[];
}
