import Bank from '../models/Bank';

const bankValidator = {
  storeSchema: {
    label: {
      custom: {
        options: async (value: string) => {
          // eslint-disable-next-line max-len
          const bank = await Bank.findOne({ where: { label: value }, paranoid: false });
          if (bank && !bank.deletedAt) {
            throw new Error('A bank with this label  already exists');
          }

          if (bank) {
            throw new Error('This label has already been used by a deleted bank');
          }
        },
      },
    },
    bankId: {
      custom: {
        options: async (value: string) => {
          // eslint-disable-next-line max-len
          const bank = await Bank.findOne({ where: { bankId: value }, paranoid: false });
          if (bank && !bank.deletedAt) {
            throw new Error('A bank with this bankId  already exists');
          }

          if (bank) {
            throw new Error('This bankId has already been used by a deleted bank');
          }
        },
      },
    },
  },
  updateSchema: {
    label: {
      custom: {
        options: async (value: string, { req }: { req: any }) => {
          const { id } = req.params;
          const bank = await Bank.findByPk(id);
          if (bank && bank.label !== value) {
            // eslint-disable-next-line max-len
            const existBank = await Bank.findOne({ where: { label: value }, paranoid: false });
            if (existBank && !existBank.deletedAt) {
              throw new Error('A bank with this label  already exists');
            }
            if (existBank) {
              throw new Error('This label has already been used by a deleted bank');
            }
          }
        },
      },
    },
    bankId: {
      custom: {
        options: async (value: string, { req }: { req: any }) => {
          const { id } = req.params;
          const bank = await Bank.findByPk(id);
          if (bank && bank.label !== value) {
            // eslint-disable-next-line max-len
            const existBank = await Bank.findOne({ where: { bankId: value }, paranoid: false });
            if (existBank && !existBank.deletedAt) {
              throw new Error('A bank with this bankId  already exists');
            }
            if (existBank) {
              throw new Error('This bankId has already been used by a deleted bank');
            }
          }
        },
      },
    },
  },
};

export default bankValidator;
