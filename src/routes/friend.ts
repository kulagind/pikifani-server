import { UserForRes } from './../interfaces/user';
import {Router} from 'express';
import { UserDB, UserDBWithMethods } from '../interfaces/mongo-models';
import { User } from '../models/user';
import { sendError } from '../utils/error';
import { getFriend, getUser } from '../utils/user';

const router = Router();

const findUserBySomething = async (value: string): Promise<UserDBWithMethods> => {
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
        const user: UserDBWithMethods = await User.findById(id);
        if (!user) {
            return res.status(401).json(sendError(401, 'Неавторизованный запрос'));
        }

        const {name} = req.body;
        const friend: UserDBWithMethods = await findUserBySomething(name);
        if (!friend) {
            return res.status(422).json(sendError(422, 'Пользователь с такими данными не найден'));
        }

        await user.addSentFriendInvite(friend._id);
        await friend.addReceivedFriendInvite(user._id);
    
        return res.status(201).json({});
    } catch(e) {
        console.log(e);
    }
});

router.get('/all', async (req, res) => {
    try {
        const id = res.locals._id;
        const user: UserDBWithMethods = await User.findById(id);
        if (!user) {
            return res.status(401).json(sendError(401, 'Неавторизованный запрос'));
        }

        const sent = user.sentFriendInvites;
        const received = user.receivedFriendInvites;
        const friends = user.friends;

        const foundFriends: UserForRes[] = [];
        for (let i=0; i<friends.length; i++) {
            const candidate = await User.findById(friends[i]);
            foundFriends.push(getFriend(candidate));
        }

        const foundSent: UserForRes[] = [];
        for (let i=0; i<sent.length; i++) {
            const candidate = await User.findById(sent[i]);
            foundSent.push(getFriend(candidate));
        }

        const foundReceived: UserForRes[] = [];
        for (let i=0; i<received.length; i++) {
            const candidate = await User.findById(received[i]);
            foundReceived.push(getFriend(candidate));
        }

        return res.status(201).json({friends: foundFriends, received: foundReceived, sent: foundSent});
    } catch(e) {
        console.log(e);
    }
});

export default router;