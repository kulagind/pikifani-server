import {body} from 'express-validator';
import {User} from '../models/user';
import bcryptjs from 'bcryptjs';
import { Encrypter } from '../models/key';
import { Word } from '../models/word';

const nameRegExp = /^[a-zA-Zа-яА-Я0-9-_]{2,20}$/;
const wordRegExp = /^[а-яА-Я]{4}$/;

export const registerValidators = [
    body('publicKey')
        .custom(async (value: string, {req}) => {
            const encrypter = Encrypter.getInstanceByPublicKey(value);
            if (!encrypter) {
                return Promise.reject('Приватный ключ не найден. Возможно срок действия публичного ключа истек, повторите попытку');
            }
        }),
    body('email', 'Введите корретный Email').isEmail().trim(),
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
            const userByName = await User.findOne({
                name: value
            });

            if (!userByName) {
                const userByEmail = await User.findOne({
                    email: value
                });

                if (!userByEmail) {
                    return Promise.reject('Пользователь с данным именем или email не существует');
                }
            }
        }),
    body('password').custom(async (value, {req}) => {
        const encrypter = Encrypter.getInstanceByPublicKey(req.body.publicKey);
        if (!encrypter) {
            return Promise.reject('Приватный ключ не найден');
        }

        const password = encrypter.decrypt(Buffer.from(value, 'base64')) || '';
        let user = await User.findOne({
            name: req.body.name
        });

        if (!user) {
            user = await User.findOne({
                email: req.body.name
            });
        }

        const areSamePasswords = await bcryptjs.compare(password, user.password);

        if (!areSamePasswords) {
            return Promise.reject('Неверный пароль');
        }
    })    
];

export const wordValidators = [
    body('word', 'Слово должно состоять из 4 букв').isLength({min: 4, max: 4})
        .custom(async (value, {req}) => {
            if (!wordRegExp.test(value)) {
                return Promise.reject('Слово должно состоять из русских букв');
            }
        })
        .toLowerCase()
        .custom(async (value, {req}) => {
            const word = await Word.findOne({
                where: {
                    word: value
                }
            });
            if (!word) {
                return Promise.reject('Заявленное слово не существует (отсутствует в коллекции слов, если Вы уверены, что данное слово существует, пожалуйста, свяжитесь с разработчиком)')
            }
        })
];
