import jwt from 'jsonwebtoken'
import { IUserDocument } from '../models/user-model'
import { transformUser } from '../dto/dto'
import * as settings from "../settings";


export const generateTokens = (user: IUserDocument) => {
    const accessToken = jwt.sign(
        {
            account: transformUser(user)
        },
        settings.AUTH.jwtKeyAccess,
        {
            expiresIn: settings.AUTH.jwtExpirationAccess,
            // expiresIn: '15s',
            audience: settings.AUTH.jwtAudience,
            issuer: settings.AUTH.jwtIssuer,
            subject: settings.AUTH.jwtSubject,

        })
    const refreshToken = jwt.sign(
        {
            account: transformUser(user)
        },
        settings.AUTH.jwtKeyRefresh,
        {
            expiresIn: settings.AUTH.jwtExpirationRefresh,
            // expiresIn: '30s',
            audience: settings.AUTH.jwtAudience,
            issuer: settings.AUTH.jwtIssuer,
            subject: settings.AUTH.jwtSubject,
        })
    return {
        accessToken,
        refreshToken
    }
}

export const validateRefreshToken = (token: string) => {
    try {
        const userData = jwt.verify(token, settings.AUTH.jwtKeyRefresh)
        return userData
    } catch (err) {
        return null
    }
}


// export const validateAccessToken = (token: string) => {
//     try {
//         const userData = jwt.verify(token, settings.AUTH.jwtKeyAccess)
//         console.log('USER', userData)
//     } catch (err) {
//         if (err instanceof Error) {
//             if (err.message == 'jwt expired') {
//                 console.log("токен истек")
//             } else {
//                 console.log("другая ошибка", err)
//             }
//         }
//     }
// }

