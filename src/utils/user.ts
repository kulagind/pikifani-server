import { User } from '../models/user';
import { UserDBWithMethods } from './../interfaces/mongo-models';
import { UserForRes } from './../interfaces/user';

export function getUser(user: UserDBWithMethods): UserForRes {
    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        winsQuantity: user.winsQuantity,
        gamesQuantity: user.gamesQuantity,
    };
}

export function getFriend(user: UserDBWithMethods): UserForRes {
    return {
        name: user.name,
        email: user.email,
        winsQuantity: user.winsQuantity,
        gamesQuantity: user.gamesQuantity,
    };
}

export const findUserBySomething = async (value: string): Promise<UserDBWithMethods> => {
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