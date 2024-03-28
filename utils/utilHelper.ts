import axios from 'axios';
// eslint-disable-next-line import/no-extraneous-dependencies
import xmlbuilder from 'xmlbuilder';
import { UBA_MAIL_CONFIGS } from '../config/config';
import LogHelper from './logHelper';

export default {
  sendEmailNotification: (
    recipient: string,
    cc1Recipient: string,
    sender: string,
    subject: string,
    body: string,
  ) => {
    const soapEnvelope = xmlbuilder.create('soapenv:Envelope', {
      version: '1.0',
      encoding: 'UTF-8',
    })
      .att('xmlns:soapenv', 'http://schemas.xmlsoap.org/soap/envelope/')
      .att('xmlns:tem', 'http://tempuri.org/')
      .ele('soapenv:Header')
      .up()
      .ele('soapenv:Body')
      .ele('tem:SendMail')
      .ele('tem:recipient', `${recipient}`)
      .up()
      .ele('tem:sender', `${sender}`)
      .up()
      .ele('tem:subject', `${subject}`)
      .up()
      .ele('tem:body', `${body}`)
      .up()
      .ele('tem:CCs')
      .ele('tem:string', `${cc1Recipient}`)
      .up()
      .end({ pretty: true });

    axios.post(UBA_MAIL_CONFIGS.EMAIL_NOTIFICATION_API_URL, soapEnvelope, {
      headers: {
        'Content-Type': 'text/xml;charset=UTF-8',
        SOAPAction: 'http://tempuri.org/SendMail',
      },
    })
      .then((response) => {
        LogHelper.info('Creating OTP for the user');
      })
      .catch((error) => {
        console.error('Erreur lors de la requête:', error);
      });
  },

};
