import axios from 'axios';
import AppError from '../types/CustomError';

export default {
  login: (username:string, password:string) => new Promise((resolve, reject) => {
    axios.post('http://paperless.ubagroup.com/ad.service/api/AD/AuthenticateUser', {
      username,
      password,
    })
      .then(({ data }) => {
        resolve(data);
      })
      .catch(() => {
        reject(
          new AppError('Impossible de contacter le service Active Directory', 500),
        );
      });
  }),
};
