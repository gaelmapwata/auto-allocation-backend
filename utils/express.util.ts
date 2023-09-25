import { validationResult } from 'express-validator';
import { Response, Request } from 'express';

// eslint-disable-next-line import/prefer-default-export
export const handleExpressValidators = (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ msg: errors.array() });
  }
  return null;
};
