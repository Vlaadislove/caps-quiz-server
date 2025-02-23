import { IUserDocument } from "../models/user-model";

export interface IUserReturn {
    id: string;
    login: string;
    createdAt: Date;
    updatedAt: Date;
}

export const transformUser = (user: IUserDocument) => {
    return {
        id: user._id.toString(),
        login: user.login,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    }
}