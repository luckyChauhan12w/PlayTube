import multer from "multer";
import { nanoid } from "nanoid";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, nanoid() + "-" + file.originalname);
    },
});

const upload = multer({ storage });

export default upload;
