import AppError from '../types/CustomError';

// eslint-disable-next-line import/prefer-default-export
export const UBAUtilities = {
  getAccountToCredited(devise: string) {
    if (devise === 'CDF') {
      return '021210048514';
    } if (devise === 'USD') {
      return '010320016038';
    }
    throw new AppError('Aucune devise fournie', 400);
  },
};
