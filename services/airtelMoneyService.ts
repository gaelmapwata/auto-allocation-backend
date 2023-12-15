import axios from 'axios';
import AppError from '../types/CustomError';
import generateNumeric from '../utils/utilities';
import ActionCodeAutoAllocation from '../utils/actionCodeAutoAllocation';
import { AirtelLoginResponseI, AutoAllocationResponseI, CheckKYCResponseI } from '../types/AirtelMoney';
import Transaction from '../models/Transaction';

const AirtelMoneyService = {
  login: () : Promise<AirtelLoginResponseI> => new Promise((resolve, reject) => {
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

  // eslint-disable-next-line max-len
  autoAllocation: (transaction: Transaction): Promise<AutoAllocationResponseI> => new Promise((resolve, reject) => {
    AirtelMoneyService.login().then((user) => {
      const headers = {
        'Content-Type': 'application/json',
        'X-Country': 'CD',
        'X-Currency': 'CDF',
        Authorization: `Bearer ${user.data.access_token}`,
      };

      const formData = {
        transaction: {
          id: `${transaction.id}00${new Date().getTime()}`,
          amount: transaction.amount.toString(),
          payee: {
            address_type: 'MOBILE',
            msisdn: transaction.msisdn,
          },
        },
        note: transaction.note,
        additional_info: {},
      };

      axios.post(`${process.env.AUTO_ALLOCATION_URL}`, formData, { headers })
        .then(({ data }: { data: AutoAllocationResponseI }) => {
          // eslint-disable-next-line max-len

          if (data.status.success) {
            resolve(data);
          } else {
            const { errorMsg } = ActionCodeAutoAllocation
              .getActionCodeAutoAllocation(data.status.response_code);

            AirtelMoneyService
              .setAirtelMoneyErrorOnTransaction(transaction, errorMsg);
            reject(new AppError(errorMsg, 400));
          }
        })
        .catch((err: Error) => {
          reject(err);
          AirtelMoneyService
            .setAirtelMoneyErrorOnTransaction(transaction, err.message);
        });
    });
  }),

  setAirtelMoneyErrorOnTransaction: (transaction: Transaction, error: string) => {
    Transaction.update({
      errorAirtelMoney: error,
    }, {
      where: {
        id: transaction.id,
      },
    });
  },
};

export default AirtelMoneyService;
