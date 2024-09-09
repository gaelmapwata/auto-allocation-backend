import axios from 'axios';
// eslint-disable-next-line import/no-extraneous-dependencies
import { parseString } from 'xml2js';
// eslint-disable-next-line import/no-extraneous-dependencies
import xmlbuilder from 'xmlbuilder';
import https from 'https';
import LogHelper from '../utils/logHelper';

const agent = new https.Agent({
  rejectUnauthorized: false,
});

export default {
  async sendEntrustToken(email: string, clearOtp: string): Promise<boolean> {
    LogHelper.info('Entrust API | sending Token to Entrust');
    const updatedEmail = email.replace('@ubagroup.com', '');
    const xmlData = xmlbuilder.create('soapenv:Envelope', {
      version: '1.0',
      encoding: 'UTF-8',
    })
      .att('xmlns:soapenv', 'http://schemas.xmlsoap.org/soap/envelope/')
      .att('xmlns:ws', 'http://ws.waei.uba.com/')
      .ele('soapenv:Header')
      .up()
      .ele('soapenv:Body')
      .ele('ws:authenticateToken')
      .ele('request')
      .ele('response')
      .text(`${clearOtp}`)
      .up()
      .ele('userGroup')
      .text('')
      .up()
      .ele('username')
      .text(`${updatedEmail}`)
      .up()
      .ele('requesterId')
      .text('?')
      .up()
      .ele('requesterIp')
      .text('?')
      .up() // End request
      .up() // End ws:authenticateToken
      .up() // End soapenv:Body
      .end({ pretty: true });

    const headers = {
      'Content-Type': 'text/xml;charset=UTF-8',
      Authorization: `Basic ${Buffer.from('AUTOALLO:MA7uhdgaQA').toString('base64')}`,
    };

    try {
      // eslint-disable-next-line max-len
      const response = await axios.post(process.env.ENTRUST_URL as string, xmlData, { headers, httpsAgent: agent });
      const xmlResponse = response.data;
      return new Promise((resolve, reject) => {
        parseString(xmlResponse, { explicitArray: false }, (err, result) => {
          if (err) {
            return reject(err);
          }
          try {
            const isSuccessful = result['NS1:Envelope']['NS1:Body']['NS2:authenticateTokenResponse'].return.isSuccessful === 'true';
            resolve(isSuccessful);
          } catch (parseError) {
            reject(parseError);
          }
        });
      });
    } catch (err) {
      console.error(err);
      return false;
    }
  },
};
