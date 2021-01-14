export interface SSEMessage {
    chatId: number,
    word: string,
    creationTime: Date,
    winnerId: number
}