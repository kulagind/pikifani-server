import { UserDBWithMethods } from './../interfaces/mongo-models';
import { User } from './../models/user';
import {Request, Response, Router} from 'express';
import {validationResult} from 'express-validator';
import { sendError } from '../utils/error';
import {authValidators, registerValidators} from '../validators/validators';
import bcryptjs from 'bcryptjs';
import {sign} from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import {Encrypter} from '../models/key';

const router: Router = Router();

const headerPublicKey = 'x-public-key';
export const headerJWT = 'x-jwt';

router.post('/register', registerValidators, async (req: Request, res: Response) => {
    try {
        let {name, email, password, publicKey} = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json(sendError(422, errors.array()[0].msg));
        }

        const encrypter = Encrypter.getInstanceByPublicKey(publicKey) as Encrypter;
        password = encrypter.decrypt(Buffer.from(password, 'base64'));
        encrypter.clearKey();
        
        const hashPassword = await bcryptjs.hash(password, 12);
        const user = new User({
            name: name,
            email: email,
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
        res.status(201).json({jwt, header: headerJWT});
    } catch(e) {
        console.log(e);
    }
});

router.post('/login', authValidators, async (req: Request, res: Response) => {
    try {
        let {name, publicKey} = req.body;

        const errors = validationResult(req);        
        if (!errors.isEmpty()) {
            return res.status(422).json(sendError(422, errors.array()[0].msg));
        }

        const encrypter = Encrypter.getInstanceByPublicKey(publicKey) as Encrypter;
        encrypter.clearKey();
        
        let user: UserDBWithMethods = (await User.findOne({name})) as UserDBWithMethods;        
        if (!user) {
            user = (await User.findOne({email: name})) as UserDBWithMethods;
        }

        const _id = user._id;
        const jwt = sign({_id}, fs.readFileSync(path.join(__dirname, '..', 'assets', 'key.txt'), {encoding: 'utf-8'}));
        res.status(200).json({jwt, header: headerJWT});        
    } catch(e) {
        console.log(e);
    }
});

router.get('/key', (req: Request, res: Response) => {
    const encrypter = new Encrypter();
    const publicKey = encrypter.key;
    res.status(200).json({publicKey, header: headerPublicKey});
});

export default router;