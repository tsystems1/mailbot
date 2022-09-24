import { NextFunction, Request, Response } from "express";
import jsonwebtoken from "jsonwebtoken";
import User from "../../models/User";
import AuthenticatedRequest from "../../types/AuthenticatedRequest";

export default async function AuthMiddleware(req: Request, res: Response, next: NextFunction) {
    if (!req.headers.authorization) {
        res.status(400).send({
            error: 'No authorization header provided in the request'
        });

        return;
    }

    const { authorization } = req.headers;

    if (!/Bearer ([^\s]+)/gi.test(authorization)) {
        res.status(400).send({
            error: 'Invalid authorization header provided'
        });

        return;
    }

    const [, token] = authorization.split(' ');

    const user = await User.findOne({ token });

    if (!user) {
        res.status(401).send({
            error: 'Invalid authorization token provided'
        });

        return;
    }

    try {
        jsonwebtoken.verify(token, process.env.JWT_TOKEN!);
    }
    catch (e) {
        console.log(e);

        res.status(401).send({
            error: 'Invalid authorization token provided'
        });

        return;
    }

    (req as AuthenticatedRequest).user = user;
    next();
}