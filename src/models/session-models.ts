import mongoose, { Model, Document, Types } from "mongoose";
import { IUserDocument } from "./user-model";

export interface IUserAgent {
  raw: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IIPAddress {
  address: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface ISession {
  user: Types.ObjectId | IUserDocument;
  device: string;
  agents: Types.Array<IUserAgentDocument>;
  hosts: Types.Array<IIPAddressDocument>;
  refreshToken: string;
  revokedReason: string;
  revokedAt: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
export interface IIPAddressDocument extends IIPAddress, Document { }

export interface IUserAgentDocument extends IUserAgent, Document { }

export interface ISessionDocument extends ISession, Document { }

const IPAddressSchema = new mongoose.Schema(
  {
    address: { type: String, required: true, },
  },
  { timestamps: true }
);

const UserAgentSchema = new mongoose.Schema(
  {
    raw: { type: String, required: true, },
  },
  { timestamps: true }
);

export const SessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, },
    device: { type: String, required: true, },
    agents: { type: [UserAgentSchema], required: true, },
    hosts: { type: [IPAddressSchema], required: true, },
    refreshToken: { type: String, required: true, },
    expiresAt: {
      type: Date,
      default: () => {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        return date;
      },
    },
    revokedAt: Date,
    revokedReason: { type: String, },
  },
  { timestamps: true, collection: "auth_sessions" }
);

export default mongoose.model<ISessionDocument>('Session', SessionSchema)