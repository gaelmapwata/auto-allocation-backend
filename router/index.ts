// TODO: Should fix this "any" issue
/* eslint-disable @typescript-eslint/no-explicit-any */

import express, { Request, Response } from 'express';
import UserController from '../controllers/UserController';
import AuthController from '../controllers/AuthController';
import authJwt from '../middleware/authJwt';
import Permission from '../models/Permission';
import RessourceController from '../controllers/RessourceController';
import RoleController from '../controllers/RoleController';

const router = express.Router();

router.get('/', (_: Request, res: Response) => {
  res.send('HELLO WORD !!');
});

/**
 * auth routes
 */

router.post('/auth/signin', AuthController.signin as any);
router.get('/auth/user', [authJwt.shouldBeLogged], AuthController.getCurrentUser);

// ----------

/**
 * users routes
 */

router.get(
  '/users',
  [authJwt.shouldBeLogged, authJwt.shouldHavePermission(Permission.USER.READ)],
  UserController.index,
);
router.post(
  '/users',
  [authJwt.shouldBeLogged, authJwt.shouldHavePermission(Permission.USER.CREATE)],
  UserController.store as any,
);
router.get(
  '/users/:id',
  [
    authJwt.shouldBeLogged,
    authJwt.shouldHavePermissionOrParamIdBeLoggedUserId(Permission.USER.READ),
  ],
  UserController.show,
);
router.put(
  '/users/:id',
  [
    authJwt.shouldBeLogged,
    authJwt.shouldHavePermissionOrParamIdBeLoggedUserId(Permission.USER.UPDATE),
  ],
  UserController.update as any,
);
router.delete(
  '/users/:id',
  [authJwt.shouldBeLogged, authJwt.shouldHavePermission(Permission.USER.DELETE)],
  UserController.delete,
);

// ----------

/**
 * roles routes
 */

router.get(
  '/roles',
  [authJwt.shouldBeLogged, authJwt.shouldHavePermission(Permission.ROLE.READ)],
  RoleController.index,
);
router.post(
  '/roles',
  [authJwt.shouldBeLogged, authJwt.shouldHavePermission(Permission.ROLE.CREATE)],
  RoleController.store as any,
);
router.post(
  '/roles/:id/add-permissions',
  [authJwt.shouldBeLogged, authJwt.shouldHavePermission(Permission.ROLE.UPDATE)],
  RoleController.addPermissions as any,
);
router.post(
  '/roles/:id/update-permissions',
  [authJwt.shouldBeLogged, authJwt.shouldHavePermission(Permission.ROLE.UPDATE)],
  RoleController.updatePermissions as any,
);
router.get(
  '/roles/:id',
  [authJwt.shouldBeLogged, authJwt.shouldHavePermission(Permission.ROLE.READ)],
  RoleController.show,
);
router.put(
  '/roles/:id',
  [authJwt.shouldBeLogged, authJwt.shouldHavePermission(Permission.ROLE.UPDATE)],
  RoleController.update as any,
);
router.delete(
  '/roles/:id',
  [authJwt.shouldBeLogged, authJwt.shouldHavePermission(Permission.ROLE.DELETE)],
  RoleController.delete,
);

// ----------

/**
 * ressources routes
 */

router.get(
  '/ressources',
  [authJwt.shouldBeLogged, authJwt.shouldHavePermission(Permission.RESSOURCE.READ)],
  RessourceController.index as any,
);

export default router;
