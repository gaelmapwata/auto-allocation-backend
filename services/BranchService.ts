import Branch from '../models/Branch';
import User from '../models/User';

export default {
  async userBelongsToBankOfBranch(user: User, branchId: number): Promise<boolean> {
    const branch = await Branch.findByPk(branchId);
    if (!branch) {
      return false;
    }

    return user.branch.bankId === branch.bankId;
  },
};
