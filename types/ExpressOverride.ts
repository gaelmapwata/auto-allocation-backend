import { Request as ExpressRequest } from 'express';
import User from '../models/User';

export type Request = ExpressRequest & {
  userId?: number | null,
  user?: User | null,
}
