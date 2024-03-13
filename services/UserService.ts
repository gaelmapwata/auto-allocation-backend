import Permission from '../models/Permission';
import Role from '../models/Role';
import User from '../models/User';

export default {
  async userByIdHasPermission(userId: number, permission: string): Promise<boolean> {
    const user = await User.findByPk(userId, {
      include: [{ model: Role, include: [Permission] }],
    });

    return !!user?.roles.find((role) => !!role.permissions.find((p) => p.slug === permission || p.slug === `${permission.split(':')[0]}:ALL`));
  },

  async userHasOneOfPermissions(user: User, ...permissions: string[]): Promise<boolean> {
    return !!user.roles
      .find((role) => role.permissions && !!role.permissions
        .find((p) => permissions
          .find((permission) => p.slug === permission || p.slug === `${permission.split(':')[0]}:ALL`)));
  },
};
