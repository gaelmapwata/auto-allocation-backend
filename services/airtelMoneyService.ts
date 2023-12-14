import axios from 'axios';
import AppError from '../types/CustomError';

const AirtelMoneyService = {
  login: () : Promise<any> => new Promise((resolve, reject) => {
    const userData = {
      client_id: '3fbe2eb3-1d12-4400-bacb-88ed59f096c0',
      client_secret: '306a42d5-018a-4099-ba6c-73b59555620d',
      grant_type: 'client_credentials',
    };
    axios.post('https://openapiuat.airtel.africa/auth/oauth2/token', userData)
      .then((response) => {
        resolve(response);
      })
      .catch((error) => {
        reject(error);
      });
  }),

  checkKYC: (msisdn:string) => new Promise((resolve, reject) => {
    AirtelMoneyService.login().then((user) => {
      const headers = {
        Accept: '*/*',
        'X-Country': 'CD',
        'X-Currency': 'CDF',
        Authorization: `Bearer ${user.data.access_token}`,
      };

      axios.get(`https://openapiuat.airtel.africa/standard/v1/users/${msisdn}`, { headers })
        .then(({ data }) => {
          if (!data.status.success) {
            reject(
              new AppError(data.status.message, 500),
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
