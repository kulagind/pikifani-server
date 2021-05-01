export interface Variables {
    MONGODB_URI: string,
    MYSQL: {
        DB_NAME: string,
        HOST: string,
        USER_NAME: string,
        USER_PASSWORD: string,
    },
    PORT: number,
    SSL_PORT: number,
    SSL_CERT: string,
    SSL_KEY: string,
    VAPID_PUBLIC: string,
    VAPID_PRIVATE: string,
    DOMAIN: string
}