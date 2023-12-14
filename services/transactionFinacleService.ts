import axios from 'axios';
// eslint-disable-next-line import/no-extraneous-dependencies
import { parseString } from 'xml2js';
// eslint-disable-next-line import/no-extraneous-dependencies
import xmlbuilder from 'xmlbuilder';
import { format } from 'date-fns';
import ActionCodeFinacleUtilities from '../utils/actionCodeFinacle';
import AppError from '../types/CustomError';

export default {
  // eslint-disable-next-line max-len
  sendTransaction: (idTransaction:number, amount:number, currency:string, drAcctNum:string, crAcctNum:string) => new Promise<{ stan: number, tranDateTime: Date }>((resolve, reject) => {
    const tranDateTime = new Date();
    const formatTranDateTime = format(tranDateTime, 'yyyyMMddHHmmss');
    const formatValueDate = format(tranDateTime, 'yyyyMMdd');

    const xmlData = xmlbuilder.create('soapenv:Envelope', {
      version: '1.0',
      encoding: 'UTF-8',
    })
      .att('xmlns:soapenv', 'http://schemas.xmlsoap.org/soap/envelope/')
      .att('xmlns:fin', 'http://finaclews.org')
      .ele('soapenv:Header')
      .up()
      .ele('soapenv:Body')
      .ele('fin:sendTransaction')
      .ele('arg0')
      .dat(`<C24TRANREQ>
            <STAN>${formatTranDateTime}</STAN>
            <TRAN_DATE_TIME>${formatTranDateTime}</TRAN_DATE_TIME>
            <TRAN_AMT>${amount}</TRAN_AMT>
            <PROCESSING_CODE>50</PROCESSING_CODE>
            <TRAN_CRNCY_CODE>${currency}</TRAN_CRNCY_CODE>
            <COUNTRY_CODE>'COD'</COUNTRY_CODE>
            <VALUE_DATE>${formatValueDate}</VALUE_DATE>
            <DR_ACCT_NUM>${drAcctNum}</DR_ACCT_NUM>
            <CR_ACCT_NUM>${crAcctNum}</CR_ACCT_NUM>
            <TERMINAL_NAME_LOC>TIPS</TERMINAL_NAME_LOC>
            <RESERVED_FLD_1>
              Paiement Auto Allocation ${idTransaction}
            </RESERVED_FLD_1>
          </C24TRANREQ>`)
      .up() // End arg0
      .up() // End fin:sendTransaction
      .up() // End soapenv:Body
      .end({ pretty: true });

    const headers = {
      'Content-Type': 'text/xml;charset=UTF-8',
      Authorization: `Basic ${Buffer.from('GUPAY:waterfall').toString('base64')}`,
    };
    axios.post(process.env.FINACLE_URL as string, xmlData, { headers })
      .then((response) => {
        parseString(response.data, (err: Error | null, result: any) => {
          const returnXmlString = result['NS1:Envelope']['NS1:Body'][0]['NS2:sendTransactionResponse'][0].return[0];
          parseString(returnXmlString, (error: Error | null, responseData: any) => {
            if (error) {
              reject(err);
            }
            const actionCode = responseData.C24TRANRES.ACTION_CODE[0];
            const messageStatusCode = ActionCodeFinacleUtilities.getActionCodeFinacle(actionCode);
            if (messageStatusCode.isvalidate) {
              resolve({
                stan: +formatTranDateTime,
                tranDateTime,
              });
            } else {
              reject(new AppError(messageStatusCode.error, 400));
            }
          });
        });
      }).catch((err) => {
        reject(err);
      });
  }),
};
