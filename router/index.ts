// TODO: Should fix this "any" issue
/* eslint-disable @typescript-eslint/no-explicit-any */

import express, { Request, Response } from 'express';
import UserController from '../controllers/UserController';
import AuthController from '../controllers/AuthController';
import authJwt from '../middleware/authJwt';
// import Permission from '../models/Permission';
import RessourceController from '../controllers/RessourceController';
import RoleController from '../controllers/RoleController';
import AirtelMoneyController from '../controllers/AirtelMoneyController';

const router = express.Router();

router.get('/', (_: Request, res: Response) => {
  res.send('HELLO WORD !!');
});

/**
 * auth routes
 */

router.post('/auth/signin', AuthController.signin as any);
router.post('/auth/check-otp', AuthController.checkOtp);
router.get('/auth/user', [authJwt.verifyToken], AuthController.getCurrentUser);
router.post('/auth/logout', AuthController.logout);

// ----------

/**
 * users routes
 */

router.get(
  '/users',
  [authJwt.verifyToken],
  UserController.index,
);
router.post(
  '/users',
  [authJwt.verifyToken],
  UserController.store as any,
);
router.get(
  '/users/:id',
  [
    authJwt.verifyToken,
  ],
  UserController.show,
);
router.put(
  '/users/:id',
  [
    authJwt.verifyToken,
  ],
  UserController.update as any,
);
router.delete(
  '/users/:id',
  [authJwt.verifyToken],
  UserController.delete,
);

// ----------

/**
 * roles routes
 */

router.get(
  '/roles',
  [authJwt.verifyToken],
  RoleController.index,
);
router.post(
  '/roles',
  [authJwt.verifyToken],
  RoleController.store as any,
);
router.post(
  '/roles/:id/add-permissions',
  [authJwt.verifyToken],
  RoleController.addPermissions as any,
);
router.post(
  '/roles/:id/update-permissions',
  [authJwt.verifyToken],
  RoleController.updatePermissions as any,
);
router.get(
  '/roles/:id',
  [authJwt.verifyToken],
  RoleController.show,
);
router.put(
  '/roles/:id',
  [authJwt.verifyToken],
  RoleController.update as any,
);
router.delete(
  '/roles/:id',
  [authJwt.verifyToken],
  RoleController.delete,
);

// ----------

/**
 * ressources routes
 */

router.get(
  '/ressources',
  [authJwt.verifyToken],
  RessourceController.index as any,
);

/**
 * airtelmoney routes
 */

router.get('/check-kyc/:msisdn', [authJwt.verifyToken], AirtelMoneyController.checkKYCMsisdn);

export default router;
