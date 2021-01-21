import mongoose, { Schema } from 'mongoose';
import { GamesInviteDB, WaitingGameDB } from '../interfaces/mongo-models';

const gameInvite: Schema<GamesInviteDB> = new Schema({
    authorId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    word: {
        type: String,
        required: true
    },
    recepientId: {
        type: Schema.Types.ObjectId,
        required: true
    }
});

export const GameInvite = mongoose.model<GamesInviteDB>('GameInvite', gameInvite);

const waitingGame: Schema<WaitingGameDB> = new Schema({
    authorId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    word: {
        type: String,
        required: true
    }
});

export const WaitingGame = mongoose.model<WaitingGameDB>('WaitingGame', waitingGame);