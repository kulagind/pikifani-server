import {NextFunction, Request, Response, Router} from 'express';
import { nextTick } from 'process';
import { FromDB } from '../interfaces/mongo-models';
import { User } from '../models/user';
import { getUserIdByJWT } from '../utils/jwt';
import { headerJWT } from './auth';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    const id = res.locals._id;
    if (id) {
        const user: FromDB = await User.findById(id);
        if (user) {
            return res.status(200).json({...user._doc, password: ''});
        }
    }
    res.status(200).json({});
});

router.get('/:id', async (req: Request, res: Response) => {
    const id = res.locals._id;
    if (id) {
        const user: FromDB = await User.findById(req.params.id);
        if (user) {
            return res.status(200).json({...user._doc, password: ''});
        }
    }
    res.status(200).json({});
});

export default router;