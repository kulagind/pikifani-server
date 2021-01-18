import { UserDB } from './../interfaces/mongo-models';
import { NextFunction, Request, Response } from "express";
import { FromDB } from "../interfaces/mongo-models";
import { User } from "../models/user";
import { headerJWT } from "../routes/auth";
import { getUserIdByJWT } from "../utils/jwt";

export const auth = async function (req: Request, res: Response, next: NextFunction) {
    res.locals._id = getUserIdByJWT(req.header(headerJWT) as string);
    next();
}