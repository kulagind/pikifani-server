import { User } from '../models/user';
import { UserDB, UserDBWithMethods } from './../interfaces/mongo-models';
import { UserForRes } from './../interfaces/user';

export function getUser(user: UserDB): UserForRes {
    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        winsQuantity: user.winsQuantity,
        gamesQuantity: user.gamesQuantity,
        isSub: user.sub ? true : false
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
    let user: UserDBWithMethods = (await User.findOne({
        name: value
    })) as UserDBWithMethods;

    if (!user) {
        user = (await User.findOne({
            email: value
        })) as UserDBWithMethods;
    }

    if (!user) {
        try {
            user = (await User.findById(value)) as UserDBWithMethods;
        } catch(e) {
            console.log('Friend was not found');
        }
    }

    return user;
};