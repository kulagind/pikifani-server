import {body} from 'express-validator';
import {User} from '../models/user';
import bcryptjs from 'bcryptjs';
import { Encrypter } from '../models/key';

const nameRegExp = /^[a-zA-Zа-яА-я0-9-_]{2,20}$/;

export const registerValidators = [
    body('publicKey')
        .custom(async (value: string, {req}) => {
            const encrypter = Encrypter.getInstanceByPublicKey(value);
            if (!encrypter) {
                return Promise.reject('Приватный ключ не найден. Возможно срок действия публичного ключа истек, повторите попытку');
            }
        }),
    body('name')
        .isLength({min: 2, max: 18}).withMessage('Имя должно состоять из 2 - 20 символов')
        .custom(async (value: string, {req}) => {
            if (!nameRegExp.test(value)) {
                return Promise.reject('Имя может содержать только буквы, цифры, нижнее подчеркивание или тире');
            }
        })
        .custom(async (value: string, {req}) => {
            const user = await User.findOne({
                name: value
            });

            if (user) {
                return Promise.reject('Имя занято, придумайте другое');
            }
        }).trim(),
    body('password')
        .custom(async (value: string, {req}) => {
            const encrypter = Encrypter.getInstanceByPublicKey(req.body.publicKey);
            if (!encrypter) {
                return Promise.reject('Приватный ключ не найден');
            }
            const password = encrypter.decrypt(Buffer.from(value, 'base64')) || '';
            if (password?.length < 4 || password?.length > 20) {
                return Promise.reject('Пароль должен содержать 4 - 20 символов');
            }
        }).trim(),
    body('confirmPassword')
        .custom(async (value: string, {req}) => {
            const encrypter = Encrypter.getInstanceByPublicKey(req.body.publicKey);
            if (!encrypter) {
                return Promise.reject('Приватный ключ не найден');
            }
            const password = encrypter.decrypt(Buffer.from(value, 'base64')) || '';
            const confirmPassword = encrypter.decrypt(Buffer.from(req.body?.confirmPassword, 'base64')) || '';
            
            if (password !== confirmPassword) {
                return Promise.reject('Пароли не совпадают');
            }
        }).trim()    
];

export const authValidators = [
    body('publicKey')
        .custom(async (value: string, {req}) => {
            const encrypter = Encrypter.getInstanceByPublicKey(value);
            if (!encrypter) {
                return Promise.reject('Приватный ключ не найден. Возможно срок действия публичного ключа истек, повторите попытку');
            }
        }),
    body('name')
        .custom(async (value: string, {req}) => {
            const user = await User.findOne({
                name: value
            });

            if (!user) {
                return Promise.reject('Пользователь с данным именем не существует');
            }
        }),
    body('password').custom(async (value, {req}) => {
        const encrypter = Encrypter.getInstanceByPublicKey(req.body.publicKey);
        if (!encrypter) {
            return Promise.reject('Приватный ключ не найден');
        }

        const password = encrypter.decrypt(Buffer.from(value, 'base64')) || '';
        const user = await User.findOne({
            name: req.body.name
        });

        const areSamePasswords = await bcryptjs.compare(password, user.password);

        if (!areSamePasswords) {
            return Promise.reject('Неверный пароль');
        }
    })    
];
