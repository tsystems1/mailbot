import { Request as ExpressRequest } from 'express';
import { IUser } from '../models/User';

export default interface AuthenticatedRequest extends ExpressRequest {
    user: IUser;
}