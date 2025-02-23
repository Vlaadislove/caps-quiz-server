import dotenv from 'dotenv'
dotenv.config()

export const MONGO_DB_URL = process.env.MONGO_DB_URL || " "
export const SERVER_PORT = process.env.SERVER_PORT || 4400

export const COOKIE_SECRET = process.env.COOKIE_SECRET;

export const AUTH = {
  jwtExpirationAccess:process.env.JWT_EXPIRATION_ACCESS || '',
  jwtExpirationRefresh:process.env.JWT_EXPIRATION_REFRESH || '',
  jwtKeyAccess: process.env.JWT_ACCESS_SECRET || '',
  jwtKeyRefresh: process.env.JWT_REFRESH_SECRET || '',
  jwtAudience: process.env.JWT_AUDIENCE || '',
  jwtIssuer: process.env.JWT_ISSUER || '' ,
  jwtSubject: process.env.JWT_SUBJECT || '',
}

export const SMTP = {
  host: process.env.SMTP_HOST || '',
  port: process.env.SMTP_PORT || '',
  user: process.env.SMTP_USER || '',
  password: process.env.SMTP_PASSWORD || '',
}