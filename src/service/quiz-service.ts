import exp from 'constants';
import { createQuize } from './../controllers/quiz';
import { QuizModel } from '../models/quiz-model';

export const createQuizeService = async () => {

}


export const getQuizeService = async (quizId: string) => {
  try {
    const quiz = await QuizModel.findOne({ quizId })
    return quiz
  } catch (error) {
    console.log(error)
  }
}  