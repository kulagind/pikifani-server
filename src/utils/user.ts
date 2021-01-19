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