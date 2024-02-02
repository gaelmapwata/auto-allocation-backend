import superAgent from 'superagent';
import { UBA_MAIL_CONFIGS } from '../config/config';

export default {
  sendEmailNotification: (
    recipient: string,
    cc1Recipient: string,
    sender: string,
    subject: string,
    body: string,
  ) => {
    const request = `<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <SendMail xmlns="http://tempuri.org/">
          <recipient>${recipient}</recipient>
          <sender>${sender}</sender>
          <subject>${subject}</subject>
          <body>${body}</body>
          <CCs>
            <string>${cc1Recipient}</string>
          </CCs>
        </SendMail>
      </soap:Body>
    </soap:Envelope>`;

    return superAgent
      .post(UBA_MAIL_CONFIGS.EMAIL_NOTIFICATION_API_URL)
      .type('text/xml')
      .send(request);
  },

};
