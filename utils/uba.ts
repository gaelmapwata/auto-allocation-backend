import AppError from '../types/CustomError';

// eslint-disable-next-line import/prefer-default-export
export const UBAUtilities = {
  getAccountToCredited(devise: string) {
    if (devise === 'CDF') {
      return '015010069067';
    } if (devise === 'USD') {
      return '990820000842';
    }
    throw new AppError('Aucune devise fournie', 400);
  },
};
