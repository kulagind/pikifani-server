export interface NotificationPayload {
    title: string,
    body: string,
    icon: string,
    vibrate: number[],
    data: {
        dateOfArrival: Date,
        primaryKey: number
    }
}