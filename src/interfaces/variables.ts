export interface Variables {
    MONGODB_URI: string
    SESSION_SECRET: string,
    SENDGRID_API_KEY: string,
    EMAIL_FROM: string,
    BASE_URL: string,
    MYSQL: {
        DB_NAME: string,
        USER_NAME: string,
        USER_PASSWORD: string,
    },
    PORT: number
}