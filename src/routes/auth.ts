import { User } from './../models/user';
import {Request, Response, Router} from 'express';
import validators from 'express-validator';
import { sendError } from '../utils/error';
import {authValidators, registerValidators} from '../validators/validators';
import bcryptjs from 'bcryptjs';
import {sign} from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import {Key} from '../models/key';

const router: Router = Router();

router.post('/registry', registerValidators, async (req: Request, res: Response) => {
    try {
        let {name, password} = req.body;
        const key: string = req.headers['X-PUBLIC-KEY'] || '';

        if (key) {
            const cryptInstance = Key.getInstanceByPublicKey(key);

            if (cryptInstance) {
                password = cryptInstance.decrypt(password);

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
                const jwt = sign({_id}, fs.readFileSync(path.join(__dirname, '..', 'assets', 'key.txt'), {encoding: 'utf-8'}));
                res.status(201).json({jwt});
            }
            return res.status(400).json(sendError(400, 'Время действия ключа истекло'));
        }
        return res.status(424).json(sendError(424, 'Необходим заголовок \'X-PUBLIC-KEY\' со значением полученного публичного ключа'));
    } catch(e) {
        console.log(e);
    }
});

router.post('/login', authValidators, async (req: Request, res: Response) => {
    try {
        const {name, password} = req.body;

        const errors = validators.validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json(sendError(422, errors.array()[0].msg));
        }
    
        const user = await User.findOne({name});
        const _id = user._id;
        const jwt = sign({_id}, fs.readFileSync(path.join(__dirname, '..', 'assets', 'key.txt'), {encoding: 'utf-8'}));
        res.status(200).json({jwt});
    } catch(e) {
        console.log(e);
    }
});

router.get('/key', (req: Request, res: Response) => {
    const crypt = new Key();
    const publicKey = crypt.key;
    res.send(200).json({publicKey});
});

export default router;