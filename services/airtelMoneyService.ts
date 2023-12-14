import axios from 'axios';
import AppError from '../types/CustomError';
import { CheckKYCResponseI } from '../types/AirtelMoney';

const AirtelMoneyService = {
  login: () : Promise<any> => new Promise((resolve, reject) => {
    const userData = {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: process.env.GRANT_TYPE,
    };
    axios.post(`${process.env.AUTH_AIRTEL_URL}`, userData)
      .then((response) => {
        resolve(response);
      })
      .catch((error) => {
        reject(error);
      });
  }),

  checkKYC: (msisdn:string): Promise<CheckKYCResponseI> => new Promise((resolve, reject) => {
    AirtelMoneyService.login().then((user) => {
      const headers = {
        Accept: '*/*',
        'X-Country': 'CD',
        'X-Currency': 'CDF',
        Authorization: `Bearer ${user.data.access_token}`,
      };

      axios.get(`${process.env.KYC_MSISDN_URL}/${msisdn}`, { headers })
        .then(({ data } : { data: CheckKYCResponseI }) => {
          if (!data.status.success) {
            reject(
              new AppError(data.status.message, 400),
            );
          } else {
            resolve(data);
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }),
};

export default AirtelMoneyService;
