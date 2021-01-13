import { Variables } from './../interfaces/variables';

const variables: Variables = {
    MONGODB_URI: ``,
    SESSION_SECRET: 'some secret value',
    SENDGRID_API_KEY: '',
    EMAIL_FROM: 'd1mka.47@yandex.ru',
    BASE_URL: `http://localhost:8000`,
    MYSQL: {
        DB_NAME: 'pfWords',
        USER_NAME: 'admin',
        USER_PASSWORD: 'admin',
    },
    PORT: 8000
};

export default variables;