// eslint-disable-next-line import/prefer-default-export
export const UBAUtilities = {
  getAccountTocredited(devise: string) {
    if (devise === 'CDF') {
      return '025010036315';
    } if (devise === 'USD') {
      return '025010036325';
    }
    throw new Error('Aucune devise fournie');
  },
};
