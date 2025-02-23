import { clientInfo } from './../middlewares/middlewares';
import { IClientInfo } from "../middlewares/middlewares";
import sessionModel, { ISessionDocument } from "../models/session-models";
import userModel, { IUserDocument } from "../models/user-model";
import bcrypt from 'bcryptjs'
import { v1 as uuidv1 } from 'uuid'
import { generateTokens, validateRefreshToken } from "./token-service";
import { IUserReturn, transformUser } from '../dto/dto';

export interface IUserInput {
    login: string;
    password: string;
}

export interface IAuthenticatedUser {
    account: {
        id: string;
        login: string;
        createdAt: string;
        updatedAt: string;
    }
}

interface ExtendedError extends Error {
    code?: number;
}
interface IUserCredentials {
    updateUser: IUserReturn
    deviceId: string;
    accessToken: string;
    session: {
        refreshToken: string;
        expiresAt: Date;
    };
}

interface IErrorMessage {
    error: {
        message: string
    }
}

type AuthServiceResponse = IUserCredentials | IErrorMessage;


const getCredentials = async (user: IUserDocument, client: IClientInfo) => {
    let device: string;

    if (client.id) device = client.id
    else device = uuidv1() + `-${new Date().getTime()}`

    const tokens = generateTokens(user)

    const findSession = await sessionModel.findOne({
        device: client.id,
        user: user.id,
        revokedAt: { $exists: false }
    })

    if (findSession) {
        const newExp = new Date();
        newExp.setDate(newExp.getDate() + 30);

        findSession.refreshToken = tokens.refreshToken,
        findSession.expiresAt = newExp
        await findSession.save()

        return {
            deviceId: device,
            accessToken: tokens.accessToken,
            session: {
                refreshToken: tokens.refreshToken,
                expiresAt: findSession.expiresAt,
            }
        }
    }

    const session = new sessionModel({
        user: user._id,
        device,
        refreshToken: tokens.refreshToken,
        agents: [{ raw: client.agent }],
        hosts: [{ address: client.host }]
    })
    session.save()
    return {
        deviceId: device,
        accessToken: tokens.accessToken,
        session: {
            refreshToken: session.refreshToken,
            expiresAt: session.expiresAt,
        }
    }
}
const authenticate = async (user: IUserDocument, password: string, client: IClientInfo) => {
    if (password === user.password) {
        return await getCredentials(user, client)
    } else {
        return { error: { message: 'Неверный email или пароль' } }
    }
}

export const loginService = async (data: IUserInput, client: IClientInfo): Promise<AuthServiceResponse> => {
    try {
        const { login, password } = data
        console.log(login, password)
        const user = await userModel.findOne({ login })
        if (user) {
            const credentials = await authenticate(user, password, client)
            const updateUser = transformUser(user)

            if ('error' in credentials) {
                return { error: { message: 'Неверный email или пароль' } }
            }
            return {
                updateUser,
                deviceId: credentials.deviceId,
                accessToken: credentials.accessToken,
                session: credentials.session
            };
        } else {
            return { error: { message: 'Неверный email или пароль' } }
        }

    } catch (error) {
        console.log(error)
        throw new Error()
    }
}

export const refreshService = async (token: string, client: IClientInfo) => {
    try {
        const user = validateRefreshToken(token) as IAuthenticatedUser
        let tokens;
        if (user) {
            const userId = await userModel.findById(user.account.id)
            if (userId == null) return { error: { message: 'User not found' } }
            else tokens = generateTokens(userId)
        }
        else {
            return { error: { message: 'Token expired or invalid' } }
        }
        const session = await sessionModel.findOne({
            device: client.id,
            refreshToken: token,
            revokedAt: { $exists: false }
        })

        if (!session) return { error: { message: 'Session not found' } }

        const newExp = new Date();
        newExp.setDate(newExp.getDate() + 30);

        session.expiresAt = newExp;
        session.refreshToken = tokens.refreshToken

        if (session.hosts[session.hosts.length - 1].address !== client.host)
            session.hosts.push({ address: client.host });

        if (session.agents[session.agents.length - 1].raw !== client.agent)
            session.agents.push({ raw: client.agent });

        await session.save();

        return {
            clientId: session.device,
            accessToken: tokens.accessToken,
            session: {
                refreshToken: tokens.refreshToken,
                expiresAt: session.expiresAt,
            }
        }
    } catch (error) {
        console.log(error)
        throw new Error()
    }
}
export const logoutService = async (user: string, client: IClientInfo) => {
    try {
        const session = await sessionModel.find({
            device: client.id,
            user,
            revokedAt: { $exists: false }
        })
        session.forEach((s) => {
            const date = new Date();
            date.setDate(date.getDate() + 30);
            s.refreshToken = ' '
            s.expiresAt = date;
            s.revokedAt = new Date();
            s.revokedReason = "logout";
            s.save()
        })
        return "Successfully logged out."
    } catch (error) {
        console.log(error)
        throw new Error()
    }
}

export const meService = async (userId: string, client: IClientInfo): Promise<AuthServiceResponse> => {
    try {
        const user = await userModel.findById(userId)
        if (user) {
            const credentials = await getCredentials(user, client)
            const updateUser = transformUser(user)
            return {
                updateUser,
                deviceId: credentials.deviceId,
                accessToken: credentials.accessToken,
                session: credentials.session
            }
        } else {
            return { error: { message: 'User not found' } }
        }

    } catch (error) {
        console.log(error)
        throw new Error()
    }
}