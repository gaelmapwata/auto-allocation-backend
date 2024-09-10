// TODO: Should fix this "any" issue
/* eslint-disable @typescript-eslint/no-explicit-any */

import express, { Request, Response } from 'express';
import UserController from '../controllers/UserController';
import AuthController from '../controllers/AuthController';
import authJwt from '../middleware/authJwt';
import rateLimiting from '../middleware/rateLimiting';
// import Permission from '../models/Permission';
import RessourceController from '../controllers/RessourceController';
import RoleController from '../controllers/RoleController';
import AirtelMoneyController from '../controllers/AirtelMoneyController';
import TransactionController from '../controllers/TransactionController';
import CountryController from '../controllers/CountryController';
import BankController from '../controllers/BankController';
import BranchController from '../controllers/BranchController';
import Permission from '../models/Permission';

const router = express.Router();

router.get('/', (_: Request, res: Response) => {
  res.send('HELLO WORD !!');
});

/**
 * auth routes
 */

router.post('/auth/signin', AuthController.signin as any);
router.post(
  '/auth/check-otp',
  [authJwt.verifyPasswordToken, rateLimiting.rateLimitMiddleware],
  AuthController.checkOtp,
);
router.get('/auth/user', [authJwt.verifyToken], AuthController.getCurrentUser);
router.post('/auth/logout', [authJwt.verifyToken], AuthController.logout);

// ----------

/**
 * users routes
 */

router.get(
  '/users',
  [authJwt.verifyToken, authJwt.shouldHaveOneOfPermissions(Permission.USER.READ)],
  UserController.index,
);
router.post(
  '/users',
  [authJwt.verifyToken, authJwt.shouldHaveOneOfPermissions(Permission.USER.CREATE)],
  UserController.store as any,
);
router.get(
  '/users/:id',
  [authJwt.verifyToken, authJwt.shouldHaveOneOfPermissions(Permission.USER.READ)],
  UserController.show,
);
router.put(
  '/users/:id',
  [authJwt.verifyToken, authJwt.shouldHaveOneOfPermissions(Permission.USER.UPDATE)],
  UserController.update as any,
);
router.delete(
  '/users/:id',
  [authJwt.verifyToken, authJwt.shouldHaveOneOfPermissions(Permission.USER.DELETE)],
  UserController.delete,
);

router.put(
  '/users/:id/lock',
  [authJwt.verifyToken, authJwt.shouldHaveOneOfPermissions(Permission.USER.LOCK)],
  UserController.lock as any,
);

router.put(
  '/users/:id/unlock',
  [authJwt.verifyToken, authJwt.shouldHaveOneOfPermissions(Permission.USER.UNLOCK)],
  UserController.unlock as any,
);

router.put(
  '/users/:id/validate',
  [authJwt.verifyToken, authJwt.shouldHaveOneOfPermissions(Permission.USER.VALIDATE)],
  UserController.validate as any,
);

// ----------

/**
 * roles routes
 */

router.get(
  '/roles',
  [authJwt.verifyToken, authJwt.shouldHaveOneOfPermissions(Permission.ROLE.READ)],
  RoleController.index,
);
// router.post(
//   '/roles',
//   [authJwt.verifyToken, authJwt.shouldHaveOneOfPermissions(Permission.ROLE.CREATE)],
//   RoleController.store as any,
// );
// router.post(
//   '/roles/:id/add-permissions',
//   [authJwt.verifyToken, authJwt.shouldHaveOneOfPermissions(Permission.ROLE.ADD_PERMISSIONS)],
//   RoleController.addPermissions as any,
// );
// router.post(
//   '/roles/:id/update-permissions',
//   [authJwt.verifyToken, authJwt.shouldHaveOneOfPermissions(Permission.ROLE.UPDATE_PERMISSIONS)],
//   RoleController.updatePermissions as any,
// );
router.get(
  '/roles/:id',
  [authJwt.verifyToken, authJwt.shouldHaveOneOfPermissions(Permission.ROLE.READ)],
  RoleController.show,
);
// router.put(
//   '/roles/:id',
//   [authJwt.verifyToken, authJwt.shouldHaveOneOfPermissions(Permission.ROLE.UPDATE)],
//   RoleController.update as any,
// );
router.delete(
  '/roles/:id',
  [authJwt.verifyToken, authJwt.shouldHaveOneOfPermissions(Permission.ROLE.DELETE)],
  RoleController.delete,
);

// ----------

/**
 * countries routes
 */

router.get(
  '/countries',
  [authJwt.verifyToken],
  CountryController.index as any,
);

router.post(
  '/countries',
  [authJwt.verifyToken],
  CountryController.store as any,
);

router.get(
  '/countries/:id',
  [authJwt.verifyToken],
  CountryController.show,
);

router.put(
  '/countries/:id',
  [authJwt.verifyToken],
  CountryController.update as any,
);

router.delete(
  '/countries/:id',
  [authJwt.verifyToken],
  CountryController.delete,
);

// ----------

/**
 * banks routes
 */

router.get(
  '/banks',
  [authJwt.verifyToken],
  BankController.index as any,
);

router.post(
  '/banks',
  [authJwt.verifyToken],
  BankController.store as any,
);

router.get(
  '/banks/:id',
  [authJwt.verifyToken],
  BankController.show,
);

router.put(
  '/banks/:id',
  [authJwt.verifyToken],
  BankController.update as any,
);

router.delete(
  '/banks/:id',
  [authJwt.verifyToken],
  BankController.delete,
);

// ----------

/**
 * branches routes
 */

router.get(
  '/branches',
  [authJwt.verifyToken],
  BranchController.index as any,
);

router.post(
  '/branches',
  [authJwt.verifyToken],
  BranchController.store as any,
);

router.get(
  '/branches/:id',
  [authJwt.verifyToken],
  BranchController.show,
);

router.put(
  '/branches/:id',
  [authJwt.verifyToken],
  BranchController.update as any,
);

router.delete(
  '/branches/:id',
  [authJwt.verifyToken],
  BranchController.delete,
);
// ----------

/**
 * ressources routes
 */

router.get(
  '/ressources',
  [authJwt.verifyToken, authJwt.shouldHaveOneOfPermissions(Permission.RESSOURCE.READ)],
  RessourceController.index as any,
);

/**
 * airtelmoney routes
 */

router.get(
  '/check-kyc/:msisdn',
  [authJwt.verifyToken, authJwt.shouldHaveOneOfPermissions(Permission.AIRTEL.CHECK_KYC)],
  AirtelMoneyController.checkKYCByMsisdn,
);

/**
 * transactions routes
 */

router.get(
  '/transactions',
  [
    authJwt.verifyToken,
    authJwt.shouldHaveOneOfPermissions(
      Permission.TRANSACTION.READ,
      Permission.TRANSACTION.READ_OWN_TRANSACTIONS,
    ),
  ],
  TransactionController.index,
);
router.get(
  '/transactions/to-validate',
  [
    authJwt.verifyToken,
    authJwt.shouldHaveOneOfPermissions(
      Permission.TRANSACTION.READ,
      Permission.TRANSACTION.READ_TRANSACTIONS_TO_VALIDATE,
    ),
  ],
  TransactionController.getTransactionsToValidate,
);
router.get(
  '/transactions/download-csv',
  [authJwt.verifyToken, authJwt.shouldHaveOneOfPermissions(Permission.TRANSACTION.EXPORT)],
  TransactionController.exportInCSV,
);
router.post(
  '/transactions',
  [authJwt.verifyToken, authJwt.shouldHaveOneOfPermissions(Permission.TRANSACTION.CREATE)],
  TransactionController.storeTransaction as any,
);
router.put(
  '/transactions/:id/validate',
  [authJwt.verifyToken, authJwt.shouldHaveOneOfPermissions(Permission.TRANSACTION.VALIDATE)],
  TransactionController.validateTransaction,
);
router.get(
  '/transactions/stats',
  [
    authJwt.verifyToken,
    authJwt.shouldHaveOneOfPermissions(
      Permission.TRANSACTION.READ,
      Permission.TRANSACTION.READ_OWN_TRANSACTIONS,
    ),
  ],
  TransactionController.getStats,
);

export default router;
