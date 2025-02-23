import { Router } from "express";
import { createQuize, getQuiz, sendAnswer, uploadAnswer } from "../controllers/quiz";
import multer from "multer";
import { uploadFolder, validateUser } from "../middlewares/middlewares";

const router = Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    req
    cb(null, req.uniqueFolder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage });


// https://localhost:5000/api/quiz
router.post('/create-quiz', validateUser, uploadFolder, upload.any(),  createQuize)

router.post('/send-answer', uploadAnswer.any(), sendAnswer)
router.get('/get-quiz', getQuiz)

export default router  