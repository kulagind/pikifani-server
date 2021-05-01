import webPush, {PushSubscription} from 'web-push';
import { NotificationPayload } from '../interfaces/notification';
import VARIABLES from '../var/var';
import fs from 'fs';

export class Notification {
    protected static readonly KEYS = {
        public: "BE4vrFpj1CV-0oe3PP9Wau0rhUNSLhx1c0FdG0HFV2hsPltWhZ0yuScYgpzhUoU0CYD1AHcoYe1yXni1AU6lrD4",
        private: "dYEspvAVJw_uRtfLZIZtzsVD9UUBjIRKtVvDuSrPUp0"
    };

    public static init(): void {
        webPush.setVapidDetails(
            `http://pikifani.ru`,
            Notification.KEYS.public, // fs.readFileSync(public).toString()
            Notification.KEYS.private // fs.readFileSync(private).toString()
        );
    }

    public static send(sub: PushSubscription | {} = {}, payload: NotificationPayload): void {
        if (Object.getOwnPropertyNames(sub).length) {
            webPush.sendNotification(sub as PushSubscription, JSON.stringify(payload))
                .catch(err => {console.log("Error sending notification, reason: ", err)});   
        }
    }
}

export class NotificationMessage implements NotificationPayload {
    public title: string;
    public body: string;
    public icon: string = '/api/public/icon.png';
    public vibrate: number[] = [100, 50, 100];
    public data = {
        dateOfArrival: new Date(),
        primaryKey: Date.now()
    }

    constructor(title: string, body: string) {
        this.title = title;
        this.body = body;
    }
}
