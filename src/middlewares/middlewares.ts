import { NextFunction, Request, Response } from "express";
import path from 'path'
import fs from 'fs'
import { IAuthenticatedUser } from "../service/auth-service";
import jwt, { JwtPayload } from 'jsonwebtoken'
import * as settings from "../settings";

export const uploadFolder = (req: Request, res: Response, next: NextFunction) => {
  const uniqueId = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const uniqueFolder = path.join(process.cwd(), "upload", uniqueId);

  req.uniqueFolder = uniqueFolder;
  if (!fs.existsSync(uniqueFolder)) {
    fs.mkdirSync(uniqueFolder, { recursive: true });
  }
  next();
}

export interface IClientInfo {
  id: string | null;
  host: string;
  agent: string;
}

export interface CustomJWT extends JwtPayload {
  token: string | IAuthenticatedUser
}

export const clientInfo = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.client = {
    id: (req.query['deviceId'] as string | null),
    host: req.headers.forwarded || req.socket.remoteAddress || "unknown",
    agent: req.headers["user-agent"] || "unknown",
  }

  next();
};

export const validateUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    const userData = jwt.verify(req.signedCookies['access_token'], settings.AUTH.jwtKeyAccess) as IAuthenticatedUser
    if (userData) {
      req.user = {
        ...userData
      }
      next()
    }

  } catch (err) {
    if (err instanceof Error) {
      if (err.message == 'jwt expired') {
        res.status(401).send({ error: { message: "Token expired." } });
      } else {
        res.status(401).send({ error: { message: "Invalid token." } });
      }
    }
  }
}

