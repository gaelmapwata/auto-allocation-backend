import { Request, Response } from 'express';
import airtelMoneyService from '../services/airtelMoneyService';
import errorHandlerService from '../services/ErrorHandlerService';

const AirtelMoneyController = {
  checkKYCByMsisdn: async (req: Request, res: Response) => {
    try {
      const msisdnResult = await airtelMoneyService.checkKYC(req.params.msisdn);
      return res.status(200).json(msisdnResult.data);
    } catch (error) {
      return errorHandlerService.handleResponseError(res, error as Error);
    }
  },
};

export default AirtelMoneyController;
