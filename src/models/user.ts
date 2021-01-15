import mongoose, {Schema} from 'mongoose';
import {UserDB} from '../interfaces/mongo-models';

const user: Schema = new Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    gamesQuantity: {
        type: Number,
        required: true
    },
    winsQuantity: {
        type: Number,
        required: true
    },
    friends: {
        type: [Schema.Types.ObjectId],
        required: true
    },
    games: {
        type: [Schema.Types.ObjectId],
        required: true
    },
    receivedGameInvites: {
        type: [Schema.Types.ObjectId],
        required: true
    },
    sentGameInvites: {
        type: [Schema.Types.ObjectId],
        required: true
    },
    receivedFriendInvites: {
        type: [Schema.Types.ObjectId],
        required: true
    },
    sentFriendInvites: {
        type: [Schema.Types.ObjectId],
        required: true
    },
    waitingGames: {
        type: [Schema.Types.ObjectId],
        required: true
    }
});

export const User = mongoose.model<UserDB>('User', user);