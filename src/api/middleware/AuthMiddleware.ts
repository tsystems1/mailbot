import { NextFunction } from "express";

export default function AuthMiddleware(req: Express.Request, res: Express.Response, next: NextFunction) {
    next();
}