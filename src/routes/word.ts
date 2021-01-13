import { PostWord } from './../interfaces/request';
import { Router, Request, Response } from 'express';
import { Word } from '../models/word';
import { sendError } from '../utils/error';

const router: Router = Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const words = await Word.findAll();
        res.status(200).json(words);
    } catch(e) {
        console.log(e);
    }
});

router.post('/', async (req: Request, res: Response) => {
    try {
        const body: PostWord = req.body;
        let word: Word | null = null;

        if (body.word && typeof body.word === 'string') {
            word = await Word.findOne({
                where: {
                    word: body.word.toLowerCase()
                }
            });

            if (word) {
                return res.status(200).json(word);
            }

            res.status(200).json('Слово не существует');
        }

        res.status(400).json(sendError(400, 'Отправленное слово не является строкой'));
    } catch(e) {
        console.log(e);
        res.status(500).json({
            message: 'Server error'
        });
    }
});

export default router;