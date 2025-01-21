// multer utility service

import multer from 'multer';

import path from 'path';

const storage = multer.diskStorage({
    destination:(req, file, cb) => {
        cb(null, './uploads');
    },
    filename:(req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png','application/pdf'];
    if(allowedTypes.includes(file.mimetype)){
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, PDF is allowed.'));
    }
};

const upload = multer({ storage, fileFilter });
export default upload;;