import { Request, Response } from 'express';
import path from 'path';

export const uploadFile = (req: Request, res: Response) => {
    if (!req.files || Object.keys(req.files).length === 0 || !req.files.file) {
        res.status(400).send('No files were uploaded.');
        return;
    }

    const { file } = req.files as { file: any };

    const uploadPath = path.join(__dirname, '../uploads/', file.name);

    file.mv(uploadPath, (err: any) => {
        if (err) {
            return res.status(500).json({ error: err.message }); // Enviar un mensaje de error más descriptivo
        }

        res.json({ msg: 'File uploaded to ' + uploadPath });
    });
}