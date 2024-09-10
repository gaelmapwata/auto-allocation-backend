import Country from '../models/Country';

const countryValidator = {
  storeSchema: {
    tel_prefix_num: {
      custom: {
        options: async (value: string) => {
          // eslint-disable-next-line max-len
          const country = await Country.findOne({ where: { tel_prefix_num: value }, paranoid: false });
          if (country && !country.deletedAt) {
            throw new Error('A country with this tel_prefix_num  already exists');
          }

          if (country) {
            throw new Error('This tel_prefix_num has already been used by a deleted country');
          }
        },
      },
    },
  },
  updateSchema: {
    tel_prefix_num: {
      custom: {
        options: async (value: string, { req }: { req: any }) => {
          const { id } = req.params;
          const country = await Country.findByPk(id);
          if (country && country.tel_prefix_num !== value) {
            // eslint-disable-next-line max-len
            const existCountry = await Country.findOne({ where: { tel_prefix_num: value }, paranoid: false });
            if (existCountry && !existCountry.deletedAt) {
              throw new Error('A country with this tel_prefix_num  already exists');
            }
            if (existCountry) {
              throw new Error('This tel_prefix_num has already been used by a deleted country');
            }
          }
        },
      },
    },
  },
};

export default countryValidator;
