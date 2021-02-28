import { UserForRes } from './../interfaces/user';
import {Router} from 'express';
import { UserDB, UserDBWithMethods } from '../interfaces/mongo-models';
import { Invite, User } from '../models/user';
import { sendError } from '../utils/error';
import { findUserBySomething, getFriend, getUser } from '../utils/user';

const router = Router();

router.post('/', async (req, res) => {
    try {
        const id = res.locals._id;
        const user: UserDBWithMethods = await User.findById(id);
        if (!user) {
            return res.status(401).json(sendError(401, 'Неавторизованный запрос'));
        }

        const {name} = req.body;

        if (name) {
            const friend: UserDBWithMethods = await findUserBySomething(name);
            if (!friend || friend._id == id) {
                return res.status(422).json(sendError(422, 'Пользователь с такими данными не найден'));
            }

            await user.receiveInvite(friend._id, Invite.sentFriendInvites);
            await friend.receiveInvite(user._id, Invite.receivedFriendInvites);

            return res.status(201).json({});
        }
        return res.status(200).json();
    } catch(e) {
        console.log(e);
    }
});

router.post('/add', async (req, res) => {
    try {
        const clientId = res.locals._id;
        const user: UserDBWithMethods = await User.findById(clientId);
        if (!user) {
            return res.status(401).json(sendError(401, 'Неавторизованный запрос'));
        }

        const {id} = req.body;

        if (id) {
            const friend: UserDBWithMethods = await User.findById(id);
            if (!friend || id === clientId) {
                return res.status(422).json(sendError(422, 'Пользователь с такими данными не найден'));
            }
    
            await user.addFriend(friend._id);
            await friend.addFriend(user._id);            
        
            return res.status(201).json(getUser(friend));
        }
        return res.status(422).json(sendError(422, 'Необходимо отправить тело {id: string}'));
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
            foundFriends.push(getUser(candidate));
        }

        const foundSent: UserForRes[] = [];
        for (let i=0; i<sent.length; i++) {
            const candidate = await User.findById(sent[i]);
            foundSent.push(getUser(candidate));
        }

        const foundReceived: UserForRes[] = [];
        for (let i=0; i<received.length; i++) {
            const candidate = await User.findById(received[i]);
            foundReceived.push(getUser(candidate));
        }

        return res.status(200).json({friends: foundFriends, received: foundReceived, sent: foundSent});
    } catch(e) {
        console.log(e);
    }
});

export default router;