import mongoose, { Schema } from "mongoose";

interface IFile {
  file: string;
}

interface IContactForm {
  backgroundImage: IFile | null;
  leftInputs: {
    id: string;
    placeholder: string;
    value: string;
  }[];
  rightInputs: {
    id: string;
    placeholder: string;
    required: boolean;
  }[];
}

interface IDesign {
  backgroundColor: string;
  buttonColor: string;
  buttonTextColor: string;
  textColor: string;
}

interface IQuestion {
  id: string;
  question: string;
  required: boolean;
  type: string;
  answers: string[];
  typeFile?: string;
}

interface IStartPage {
  alignment: string | null;
  backgroundImage: string | null;
  backgroundImageMobile: string | null;
  formData: {
    buttonText: string;
    companyName: string;
    companySlogan: string;
    description: string;
    phoneNumber: string;
    title: string;
  };
  layout: string;
  logoImage: string | null;
}

interface IQuizPage {
  nameQuiz: string;
  notificationEmail: string;
  personalDataPolicy:  string
  privacyPolicy: string
}

export interface IQuizModel extends Document {
  contactForm: IContactForm;
  design: IDesign;
  questions: IQuestion[];
  startPage: IStartPage;
  quizInfo: IQuizPage;
  notificationEmail:string;
}


const FileSchema = new Schema({
  file: { type: String, required: false },
});


const ContactFormSchema = new Schema({
  backgroundImage: { type: FileSchema, default: null },
  leftInputs: [
    {
      id: { type: String, required: false },
      placeholder: { type: String, required: false },
      value: { type: String, required: false },
    },
  ],
  rightInputs: [
    {
      id: { type: String, required: false },
      placeholder: { type: String, required: false },
      required: { type: Boolean, required: false },
    },
  ],
});


const DesignSchema = new Schema({
  backgroundColor: { type: String, required: false },
  buttonColor: { type: String, required: false },
  buttonTextColor: { type: String, required: false },
  textColor: { type: String, required: false },
});


const QuestionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  question: { type: String, required: true },
  required: { type: Boolean, required: true },
  type: { type: String, required: true },
  typeFile: { type: String, required: false },

  answers: {
    type: Array,
    validate: {
      validator: function (answers: any[]): boolean {
        if (!Array.isArray(answers)) return false;
        if (answers.length === 0) return true;

        const isStringArray = answers.every((item) => typeof item === "string");

        const isTextAndFileArray = answers.every(
          (item) =>
            typeof item === "object" &&
            item !== null && 
            typeof item.file === "string" && 
            (item.text === undefined || typeof item.text === "string") 
        );

        return isStringArray || isTextAndFileArray;
      },
      message: "Answers must be a valid array of strings or objects with 'text' (optional) and 'file' (required).",
    },
  },
});

QuestionSchema.pre("save", function (next) {
  if (Array.isArray(this.answers)) {
    this.answers.forEach((answer: any) => {
      if (typeof answer === "object" && answer.preview !== undefined) {
        delete answer.preview;
      }
    });
  }
  next();
});


const StartPageSchema = new Schema({
  alignment: { type: String, default: null },
  backgroundImage: FileSchema,
  backgroundImageMobile: FileSchema,
  formData: {
    buttonText: { type: String, required: false },
    companyName: { type: String, required: false },
    companySlogan: { type: String, required: false },
    description: { type: String, required: false },
    phoneNumber: { type: String, required: false },
    title: { type: String, required: false },
  },
  layout: { type: String, required: false },
  logoImage: FileSchema,
});


const QuizInfoPageSchema = new Schema({
  nameQuiz:{ type: String, required: false },
  notificationEmail:{ type: String, required: false },
  personalDataPolicy:{ type: String, required: false },
  privacyPolicy:{ type: String, required: false },
});



const QuizModelSchema = new Schema({
  quizId: { type: String, required: false },
  contactForm: { type: ContactFormSchema, required: false },
  design: { type: DesignSchema, required: false },
  questions: { type: [QuestionSchema], required: false },
  startPage: { type: StartPageSchema, required: false },
  quizInfo: { type: QuizInfoPageSchema, required: false },
}, { collection: 'quiz_models', timestamps: true },);

export const QuizModel = mongoose.model<IQuizModel>('QuizModel', QuizModelSchema);
