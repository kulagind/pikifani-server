import { ChatForRes } from "../utils/chat";
import { MessageDB } from "./mongo-models";

export interface ChatMessageForRes {
    info: ChatForRes,
    messages: MessageDB[],
    winner?: string
}

export interface GameResult {
    gameId: string,
    word: string,
    friend: string,
    friendWord: string,
    winner: string
}