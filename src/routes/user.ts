import { UserDBWithMethods } from './../interfaces/mongo-models';
import {NextFunction, Request, Response, Router} from 'express';
import { User } from '../models/user';
import { getFriend, getUser } from '../utils/user';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const id = res.locals._id;
        if (id) {
            const user: UserDBWithMethods = (await User.findById(id)) as UserDBWithMethods;
            if (user) {                
                return res.status(200).json(getUser(user));
            }
        }
        res.status(401).json({});
    } catch(e) {
        console.log(e);
    }
});

router.get('/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const user: UserDBWithMethods = (await User.findById(id)) as UserDBWithMethods;
        if (user) {
            return res.status(200).json(getFriend(user));
        }
        res.status(200).json({});
    } catch(e) {
        console.log(e);
    }
});

export default router;