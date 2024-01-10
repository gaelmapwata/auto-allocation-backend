import AppError from '../types/CustomError';

// eslint-disable-next-line import/prefer-default-export
export const UBAUtilities = {
  getAccountToCredited(devise: string) {
    if (devise === 'CDF') {
      return '015020036193';
    } if (devise === 'USD') {
      return '025010015765';
    }
    throw new AppError('Aucune devise fournie', 400);
  },
};
