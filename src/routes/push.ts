import { UserDBWithMethods } from './../interfaces/mongo-models';
import {Router} from 'express';
import { User } from '../models/user';
import { getUser } from '../utils/user';
import { sendError } from '../utils/error';

const router = Router();

router.post('/', async (req, res) => {
    try {
        const id = res.locals._id;
        const user: UserDBWithMethods = (await User.findById(id)) as UserDBWithMethods;
        if (!user) {
            return res.status(401).json(sendError(401, 'Неавторизованный запрос'));
        }

        const sub = req.body.sub;

        if (!sub) {
            return res.status(422).json(sendError(422, 'Необходимо отправить тело {sub: PushSubscription}'));
        }

        await user.subscribeToPush(sub);

        return res.status(200).json(getUser(user));
    } catch(e) {
        console.log(e);
    }
});

router.delete('/', async (req, res) => {
    try {
        const id = res.locals._id;
        const user: UserDBWithMethods = (await User.findById(id)) as UserDBWithMethods;
        if (!user) {
            return res.status(401).json(sendError(401, 'Неавторизованный запрос'));
        }
        
        await user.unsubscribeFromPush();

        return res.status(200).json(getUser(user));
    } catch(e) {
        console.log(e);
    }
});

export default router;