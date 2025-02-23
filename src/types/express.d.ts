import { Request } from "express";
import { IClientInfo } from "../middlewares/middlewares";
import { IAuthenticatedUser } from "../service/auth-service";

declare module "express-serve-static-core" {
  interface Request {
    uniqueFolder: string;
  }
}

declare global {
  namespace Express {
    interface Request {
      client: IClientInfo;
      user: IAuthenticatedUser;
    }
  }
}