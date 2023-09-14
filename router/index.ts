import express, { Request, Response } from 'express';
import MailService from '../services/MailService';

const router = express.Router();

router.get('/', (_: Request, res: Response) => {
  res.send('HELLO WORD !!');
});

router.get('/welcome/:username', (req: Request, res: Response) => {
  try {
    MailService.sendMailFromEmailTemplates({
      template: 'welcome',
      locals: {
        username: req.params.username,
      },
      mailTo: process.env.MAIL_TO_ADDRESS, // in logic it should be email of the user
    });
    res.send(`Email sended to ${req.params.username} !!`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }
});

export default router;
