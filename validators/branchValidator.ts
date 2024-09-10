import Branch from '../models/Branch';

const branchValidator = {
  storeSchema: {
    label: {
      notEmpty: true,
      errorMessage: 'The "label" field is mandatory',
    },
    solId: {
      custom: {
        options: async (value: string) => {
          // eslint-disable-next-line max-len
          const branch = await Branch.findOne({ where: { solId: value }, paranoid: false });
          if (branch && !branch.deletedAt) {
            throw new Error('A branch with this solId  already exists');
          }

          if (branch) {
            throw new Error('This solId has already been used by a deleted branch');
          }
        },
      },
    },
  },

  updateSchema: {
    label: {
      notEmpty: {
        errorMessage: 'The "label" field is mandatory',
      },
    },
    solId: {
      custom: {
        options: async (value: string, { req }: { req: any }) => {
          const { id } = req.params;
          const branch = await Branch.findByPk(id);
          if (branch && branch.solId !== value) {
            // eslint-disable-next-line max-len
            const existBranch = await Branch.findOne({ where: { solId: value }, paranoid: false });
            if (existBranch && !existBranch.deletedAt) {
              throw new Error('A branch with this solId  already exists');
            }
            if (existBranch) {
              throw new Error('This solId has already been used by a deleted branch');
            }
          }
        },
      },
    },
  },
};

export default branchValidator;
