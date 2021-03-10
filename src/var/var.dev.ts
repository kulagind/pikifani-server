import { Variables } from './../interfaces/variables';

const variables: Variables = {
    MONGODB_URI: 'mongodb://mongodb:27017/pikifani',
    MYSQL: {
        DB_NAME: 'pfWords',
        USER_NAME: 'admin',
        USER_PASSWORD: 'admin',
        HOST: 'mysql',
    },
    PORT: 8000,
    SSL_PORT: 8001
};

export default variables;