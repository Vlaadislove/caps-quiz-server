import mongoose, { Document, ObjectId, Schema } from 'mongoose'

interface IUser {
  _id: ObjectId;
  login: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}


export interface IUserDocument extends Omit<Document, '_id'>, IUser {}



const UserSchema = new mongoose.Schema(
  {
    login: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, collection: "users" }
);

export default mongoose.model<IUserDocument>('User', UserSchema)