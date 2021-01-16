import validators from 'express-validator';
import {User} from '../models/user';
import bcryptjs from 'bcryptjs';

const nameRegExp = /^[a-zA-Zа-яА-я0-9-_]{2,20}$/;

export const registerValidators = [
    validators.body('name')
        .isLength({min: 2, max: 18}).withMessage('Имя должно состоять из 2 - 20 символов')
        .custom((value: string, {req}) => {
            if (!nameRegExp.test(value)) {
                return Promise.reject('Имя может содержать только буквы, цифры, нижнее подчеркивание или тире');
            }
        })
        .custom(async (value: string, {req}) => {
            try {
                const user = await User.findOne({
                    name: value
                });

                if (user) {
                    return Promise.reject('Имя занято, придумайте другое');
                }
            } catch (e) {
                console.log(e);
            }
        }).trim(),
    validators.body('password', 'Пароль должен состоять из 4 - 20 символов').isLength({min: 4, max: 20}).isAlphanumeric().trim(),
    validators.body('confirmPassword').custom((value, {req}) => {
        if (value !== req.body.password) {
            throw new Error('Пароли не совпадают');
        }
        return true;
    }).trim()    
];

export const authValidators = [
    validators.body('name')
        .custom(async (value: string, {req}) => {
            try {
                const user = await User.findOne({
                    name: value
                });

                if (!user) {
                    return Promise.reject('Пользователь с данным именем не существует');
                }
            } catch (e) {
                console.log(e);
            }
        }),
    validators.body('password').custom(async (value, {req}) => {
        const user = await User.findOne({
            name: req.body.name
        });

        const areSamePasswords = await bcryptjs.compare(value, user.password);

        if (!areSamePasswords) {
            return Promise.reject('Неверный пароль');
        }
    })    
];
