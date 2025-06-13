import express from 'express';
import path from "path";
import Decrypt from '../services/Decrypt.js';
import ImageCors from '../middleware/ImageCors.js';
import {fileURLToPath} from "url";

const ManagingStaticFiles = express();

ManagingStaticFiles.get('/staticFiles/photos/:id', ImageCors, (req, res) => {
    const id = req.params.id;
    const decText = Decrypt(id).split(':');
    const ip = decText[decText.length - 1];
    const realIp = req['realIp'].split(':');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const completePath = path.parse(__dirname)['dir'];
    if (ip === realIp[realIp.length - 1]) {
        res.sendFile(path.join(completePath, decText[0]));
    } else {
        res.sendFile(path.join(completePath, '/public/no_access_image.jpg'));
    }
});


export default ManagingStaticFiles;