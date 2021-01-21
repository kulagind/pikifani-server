import mongoose, { Schema } from 'mongoose';
import { GameDB } from '../interfaces/mongo-models';

const gameChat: Schema<GameDB> = new Schema({
    user1: {
        id: {
            type: Schema.Types.ObjectId,
            required: true
        },
        word: {
            type: String,
            required: true
        }
    },
    user2: {
        id: {
            type: Schema.Types.ObjectId,
            required: true
        },
        word: {
            type: String,
            required: true
        }
    },
    turnId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    messages: [{
        creationTime: {
            type: Date,
            required: true
        },
        word: {
            type: String,
            required: true
        },
        p: {
            type: Number,
            required: true
        },
        f: {
            type: Number,
            required: true
        },
        authorId: {
            type: Schema.Types.ObjectId,
            required: true
        }
    }]
});

export const GameChat = mongoose.model<GameDB>('GameChat', gameChat);