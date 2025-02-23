import { NextFunction, Request, Response } from "express";
import { loginService, logoutService, meService, refreshService } from "../service/auth-service";

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

  try {
    const data = await loginService(req.body, req.client)

    if ('error' in data) {
      res.status(409).json({ error: data.error?.message });
      return
    }
    const { session, deviceId, updateUser: { login, id }, ...result } = data
    res.cookie("refresh_token", session.refreshToken, {
      expires: session.expiresAt,
      httpOnly: true,
      path: "/",
      signed: true,
      secure: false,
    });

    res.cookie("access_token", result.accessToken, {
      expires: new Date(new Date().setMinutes(new Date().getMinutes() + 15)),
      httpOnly: true,
      path: "/",
      signed: true,
      secure: false,
    });

    res.status(201).json({
      deviceId,
      id,
      login
    });
  } catch (error) {
    console.log(error)
    next(error)
  }

}


export const refresh = async (req: Request, res: Response): Promise<void> => {

  try {
    const { session, clientId, error, ...result } = await refreshService(req.signedCookies['refresh_token'], req.client)

    if (error) {
      res.status(403).json(error)
      return
    }

    res.cookie("refresh_token", session.refreshToken, {
      expires: session.expiresAt,
      httpOnly: true,
      path: "/",
      signed: true,
      secure: false,
    });

    res.cookie("access_token", result.accessToken, {
      expires: new Date(new Date().setMinutes(new Date().getMinutes() + 15)),
      httpOnly: true,
      path: "/",
      signed: true,
      secure: false,
    });

    res.status(201).json({ clientId });
    return

  } catch (error) {
    console.log(error)
  }

}

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const message = await logoutService(req.user.account.id, req.client)
    res.cookie("refresh_token", '', {
      expires: new Date(Date.now() + 5000),
      httpOnly: true,
      path: "/",
      signed: true,
      secure: false,
    });

    res.cookie("access_token", '', {
      expires: new Date(Date.now() + 5000),
      httpOnly: true,
      path: "/",
      signed: true,
      secure: false,
    });
    res.status(200).json({ message });
    return 
  } catch (error) {
    console.log(error)
  }
}


export const me = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await meService(req.user.account.id, req.client)

    if ('error' in data) {
      res.status(409).json({ error: data.error?.message });
      return 
    }
    const { session, deviceId, updateUser: { login, id }, ...result } = data
    res.cookie("refresh_token", session.refreshToken, {
      expires: session.expiresAt,
      httpOnly: true,
      path: "/",
      signed: true,
      secure: false,
    });

    res.cookie("access_token", result.accessToken, {
      expires: new Date(new Date().setMinutes(new Date().getMinutes() + 15)),
      httpOnly: true,
      path: "/",
      signed: true,
      secure: false,
    });

    res.status(201).json({
      deviceId,
      id,
      login
    });
    
    return 
  } catch (error) {
    console.log(error)
  }
}