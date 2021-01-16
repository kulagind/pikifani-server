import { User } from './../models/user';
import {Request, Response, Router} from 'express';
import validators from 'express-validator';
import { sendError } from '../utils/error';
import {registerValidators} from '../validators/validators';
import bcryptjs from 'bcryptjs';
import {sign} from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';

const router: Router = Router();

router.post('/registry', registerValidators, async (req: Request, res: Response) => {
    try {
        const {name, password} = req.body;

        const errors = validators.validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json(sendError(422, errors.array()[0].msg));
        }
    
        const hashPassword = await bcryptjs.hash(password, 12);
        const user = new User({
            name: name,
            password: hashPassword,
            gamesQuantity: 0,
            winsQuantity: 0,
            friends: [],
            games: [],
            receivedGameInvites: [],
            sentGameInvites: [],
            receivedFriendInvites: [],
            sentFriendInvites: [],
            waitingGames: []
        });
    
        await user.save();

        const _id = user._id;
        const jwt = sign({_id}, fs.readFileSync(path.join(__dirname, '..', 'key.txt'), {encoding: 'utf-8'}));
        res.status(201).json({jwt});
    } catch(e) {
        console.log(e);
    }
});

export default router;