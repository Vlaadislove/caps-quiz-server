import nodemailer from "nodemailer"
import * as settings from "../settings"

// types.ts
export interface FormContact {
  name: string;
  email: string;
  phone: string;
}

export interface MultipleAnswer {
  question: string;
  answer: string[];
  questionType: 'multiple';
}

export interface SingleAnswer {
  question: string;
  answer: string;
  questionType: 'single' | 'input' | 'dropdownList' | 'calendar';
}

export interface ImageAnswer {
  question: string;
  answer: {
    text: string;
    file: string;
  };
  questionType: 'imageText' | 'imageUrl';
}

export interface FileUploadAnswer {
  question: string;
  answer: {
    file: string;
  };
  questionType: 'fileUpload';
}

export type Answer =
  | MultipleAnswer
  | SingleAnswer
  | ImageAnswer
  | FileUploadAnswer;

export interface QuizData {
  quizId: string;
  answers: {
    [questionId: string]: Answer;
  };
  formContact: FormContact;
}

const transporter = nodemailer.createTransport({
  host: settings.SMTP.host,
  port: Number(settings.SMTP.port),
  secure: false,
  auth: {
    user: settings.SMTP.user,
    pass: settings.SMTP.password,
  }
});

export async function sandEmail(data: QuizData, notificationEmail: string) {
  // Формируем HTML для контактной информации
  let htmlContent = `
    <div style="font-family: sans-serif; padding: 20px;">
      <h1 style="text-align: center;">Результаты CASP quiz</h1>
      <h2>Контактная информация</h2>
      <p><strong>Имя:</strong> ${data.formContact.name}</p>
      <p><strong>Email:</strong> ${data.formContact.email}</p>
      <p><strong>Телефон:</strong> ${data.formContact.phone}</p>
      <hr>
      <h2>Ответы:</h2>
  `;

  // Перебираем все ответы.
  // Задаём тип возвращаемого значения Object.entries как Array<[string, Answer]>
  for (const [key, answerItem] of Object.entries(data.answers) as Array<[string, Answer]>) {
    console.log('текущий вопрос', answerItem.answer)
    htmlContent += `<div style="margin-bottom: 20px; padding: 10px; border: 1px solid #ddd;">
      <p><strong>Вопрос:</strong> ${answerItem.question}</p>`;

    // Обработка ответа в зависимости от типа вопроса
    switch (answerItem.questionType) {
      case 'multiple':
        // Ожидается, что answer – массив строк
        if (Array.isArray(answerItem.answer)) {
          htmlContent += `<p><strong>Ответы:</strong></p><ul>`;
          answerItem.answer.forEach(ans => {
            htmlContent += `<li>${ans}</li>`;
          });
          htmlContent += `</ul>`;
        }
        break;

      case 'single':
      case 'input':
      case 'dropdownList':
      case 'calendar':
        // Ожидается, что answer – строка
        htmlContent += `<p><strong>Ответ:</strong> ${answerItem.answer}</p>`;
        break;

      case 'imageText':
      case 'imageUrl':
        // Ожидается, что answer – объект { test: string, file: string }
        if (answerItem.answer && (answerItem.answer as any).text && (answerItem.answer as any).file) {
          const { text, file } = answerItem.answer as { text: string; file: string };
          htmlContent += `<p><strong>Ответ:</strong> ${text}</p>`;
          htmlContent += `<p><img src="${file}" alt="${text}" style="max-width:300px;"></p>`;
        }
        break;

      case 'fileUpload':
        // Ожидается, что answer – объект { file: string }
        if (answerItem.answer && (answerItem.answer as any).file) {
          const { file } = answerItem.answer as { file: string };
          htmlContent += `<p><strong>Файл:</strong> <a href="${file}" download>Скачать файл</a></p>`;
        } else {
          htmlContent += `<p><strong>Файл:</strong> Файл не загружен</p>`;
        }
        break;

      default:
        // На случай, если тип вопроса не распознан
        const fallback = answerItem as Answer;
        htmlContent += `<p><strong>Ответ:</strong> ${fallback.answer}</p>`;
        break;
    }
    htmlContent += `</div>`;
  }

  htmlContent += `</div>`;

  // Отправляем письмо
  await transporter.sendMail({
    from: settings.SMTP.user,
    to: notificationEmail,
    subject: 'Результаты CASP quiz',
    text: 'Новые результаты квиза', // резервный текст
    html: htmlContent,
  });
}