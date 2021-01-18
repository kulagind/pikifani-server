import {Router} from 'express';
import { Model } from 'mongoose';
import { UserDB } from '../interfaces/mongo-models';
import { FriendInvite } from '../models/invites';
import { User } from '../models/user';
import { sendError } from '../utils/error';

const router = Router();

const findUserBySomething = async (value: string): Promise<UserDB> => {
    let user = await User.findOne({
        name: value
    });

    if (!user) {
        user = await User.findOne({
            email: value
        });
    }

    if (!user) {
        user = await User.findOne({
            _id: value
        });
    }

    return user;
};

router.post('/', async (req, res) => {
    try {
        const id = res.locals._id;
        const user = await User.findById(id);
        if (!user) {
            return res.status(401).json(sendError(401, 'Неавторизованный запрос'));
        }

        const {name} = req.body;    
        const friend = await findUserBySomething(name);    
        if (!friend) {
            return res.status(422).json(sendError(422, 'Пользователь с такими данными не найден'));
        }

        const friendRequest = new FriendInvite({
            authorId: id,
            recepientId: friend._id,
        });

        await friendRequest.save();
    } catch(e) {
        console.log(e);
    }
});

export default router;