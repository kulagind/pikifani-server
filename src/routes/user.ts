import {Request, Response, Router} from 'express';
import { FromDB } from '../interfaces/mongo-models';
import { User } from '../models/user';
import { getUserIdByJWT } from '../utils/jwt';
import { headerJWT } from './auth';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    if (req.header(headerJWT)) {
        const user: FromDB = await User.findById(getUserIdByJWT(req.header(headerJWT) as string));
        return res.status(200).json({...user._doc, password: ''});
    }
    res.status(200).json({});
});

export default router;