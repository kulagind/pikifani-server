import express, { Application } from 'express';
import VARIABLES from './var/var';
import wordRoutes from './routes/word';

const app: Application = express();

app.use(express.json());

app.use('/api/word', wordRoutes);

const PORT = process.env.PORT || VARIABLES.PORT;

app.listen(+PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});