import { Request, Response } from "express";
import { createQuizeService, getQuizeService } from "../service/quiz-service";
import path from "path";
import { QuizModel } from "../models/quiz-model";
import { sandEmail } from "../service/mail-service";
import multer from "multer";
import fs from 'fs'

export const createQuize = async (req: Request, res: Response): Promise<void> => {
  try {
    const jsonData = JSON.parse(req.body.data);
    const folderId = path.basename(req.uniqueFolder as string);

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const relativeFolder = path.relative(path.join(process.cwd(), "upload"), req.uniqueFolder as string);

    if (Array.isArray(req.files)) {
      req.files.forEach((file) => {
        const fieldPath = file.fieldname.split(/\.|\[|\]\.?/).filter(Boolean);
        let current = jsonData;

        for (let i = 0; i < fieldPath.length - 1; i++) {
          const key = fieldPath[i];

          if (!isNaN(parseInt(key))) {
            const index = parseInt(key);
            if (!Array.isArray(current)) {
              current = [];
            }
            if (!current[index]) {
              current[index] = {};
            }
            current = current[index];
          } else {
            if (!current[key] || typeof current[key] !== "object") {
              current[key] = {};
            }
            current = current[key];
          }
        }

        const lastField = fieldPath[fieldPath.length - 1];
        current[lastField] = `${baseUrl}/upload/${relativeFolder}/${path.basename(file.path)}`;
      });

      const { startPage, questions, contactForm, design, quizInfo} = jsonData;

      const newQuiz = new QuizModel({
        quizId: folderId,
        startPage,
        questions,
        contactForm,
        design,
        quizInfo
      });

      await newQuiz.save();
    } else {
      console.error("req.files is not an array or is undefined");
    }

    // const data = await createQuizeService();
    // return res.status(200).json(data);
  } catch (error) {
    console.error("Error in createQuize:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getQuiz = async (req: Request, res: Response): Promise<void> => {
  try {
    if (typeof req.query['quizID'] !== 'string') return
    const data = await getQuizeService(req.query['quizID']);
    res.status(200).json(data);
    return
  } catch (error) {
    console.error("Error in createQuize:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};




const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const quizId = req.body.quizId;
    if (!quizId) {
      return cb(new Error("quizId is missing in request body"), "");
    }

    const quizFolder = path.join(process.cwd(), "upload", quizId, "files");

    if (!fs.existsSync(quizFolder)) {
      fs.mkdirSync(quizFolder, { recursive: true });
    }

    cb(null, quizFolder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueNumber = Date.now().toString() + Math.floor(Math.random() * 1e6).toString();
    cb(null, uniqueNumber + ext);
  },
});
export const uploadAnswer = multer({ storage });

export const sendAnswer = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = JSON.parse(req.body.data);
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const quizFolder = path.join(process.cwd(), "upload", data.quizId);
    const filesFolder = path.join(quizFolder, "files");

    console.log("Received data:", data);

    if (!fs.existsSync(quizFolder)) {
      res.status(400).json({ error: "Invalid quizId: folder does not exist" });
      return;
    }

    if (Array.isArray(req.files) && req.files.length > 0 && !fs.existsSync(filesFolder)) {
      fs.mkdirSync(filesFolder, { recursive: true });
    }

    if (Array.isArray(req.files)) {
      req.files.forEach((file) => {
        const fieldPath = file.fieldname.split(/\.|\[|\]\.?/).filter(Boolean);

        let current = data;
        // Проходим по пути кроме последнего поля
        for (let i = 0; i < fieldPath.length - 1; i++) {
          const key = fieldPath[i];

          if (!isNaN(parseInt(key))) {
            const index = parseInt(key);
            if (!Array.isArray(current)) {
              current = [];
            }
            if (!current[index]) {
              current[index] = {};
            }
            current = current[index];
          } else {
            if (!current[key] || typeof current[key] !== "object") {
              current[key] = {};
            }
            current = current[key];
          }
        }

        const lastField = fieldPath[fieldPath.length - 1];
        // Гарантируем, что конечное поле является объектом
        if (!current[lastField] || typeof current[lastField] !== "object") {
          current[lastField] = {};
        }

        // Записываем URL загруженного файла прямо в объект ответа,
        // чтобы не было лишней вложенности (т.е. не будет answer.answer.file)
        current[lastField].file = `${baseUrl}/upload/${data.quizId}/files/${path.basename(file.path)}`;
      });
    }

    console.log("Updated answers:", data.answers)

    const quiz = await QuizModel.findOne({ quizId: data.quizId })

    if(!quiz) return
    await sandEmail(data, quiz.quizInfo.notificationEmail)


    res.status(200).json({ message: "Quiz saved successfully", quizId: data.quizId, answers: data.answers });
  } catch (error) {
    console.error("Error in sendAnswer:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
