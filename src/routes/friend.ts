import {Router} from 'express';
import { UserDBWithMethods } from '../interfaces/mongo-models';
import { Invite, User } from '../models/user';
import { sendError } from '../utils/error';
import { findUserBySomething, getFriend, getUser } from '../utils/user';
import { SSEConnection } from '../models/sse';
import { SSEType } from '../interfaces/sse';

const router = Router();

router.post('/', async (req, res) => {
    try {
        const id = res.locals._id;
        const user: UserDBWithMethods = (await User.findById(id)) as UserDBWithMethods;
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

            const userFriends = await user.getFriends();
            const friendFriends = await friend.getFriends();
            SSEConnection.send(user._id.toString(), {type: SSEType.friends, payload: userFriends});
            SSEConnection.send(friend._id.toString(), {type: SSEType.friends, payload: friendFriends});

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
        const user: UserDBWithMethods = (await User.findById(clientId)) as UserDBWithMethods;
        if (!user) {
            return res.status(401).json(sendError(401, 'Неавторизованный запрос'));
        }

        const {id} = req.body;

        if (id) {
            const friend: UserDBWithMethods = (await User.findById(id)) as UserDBWithMethods;
            if (!friend || id === clientId) {
                return res.status(422).json(sendError(422, 'Пользователь с такими данными не найден'));
            }
    
            await user.addFriend(friend._id);
            await friend.addFriend(user._id);   
            
            const userFriends = await user.getFriends();
            const friendFriends = await friend.getFriends();
            SSEConnection.send(user._id.toString(), {type: SSEType.friends, payload: userFriends});
            SSEConnection.send(friend._id.toString(), {type: SSEType.friends, payload: friendFriends});
        
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
        const user: UserDBWithMethods = (await User.findById(id)) as UserDBWithMethods;
        if (!user) {
            return res.status(401).json(sendError(401, 'Неавторизованный запрос'));
        }

        const friends = await user.getFriends();

        return res.status(200).json(friends);
    } catch(e) {
        console.log(e);
    }
});

export default router;