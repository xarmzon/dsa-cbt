import { MESSAGES } from "../../../utils/constants";
import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "../../../utils/database";
import Admin from "../../../models/AdminModel";
import Course from "../../../models/CourseModel";
import Question from "../../../models/QuestionModel";
import Cookie from "js-cookie";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();

  try {
    switch (req.method) {
      case "POST":
        await addQuestion(req, res);
        break;
      case "GET":
        await getQuestions(req, res);
        break;
      case "PATCH":
        break;
      case "DELETE":
        break;
      default:
        return;
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ msg: MESSAGES.UNKNOWN_ERROR });
  }
};

const addQuestion = async (req: NextApiRequest, res: NextApiResponse) => {
  //const token = Cookie.get()
  //console.log(req);
  const { contents, options, course } = req.body;
  if (!contents || !options || !course)
    return res.status(400).json({ msg: MESSAGES.INVALID_QUESTION_DATA });

  const courseData = await Course.findOne({ _id: course });
  if (!courseData)
    return res.status(400).json({ msg: MESSAGES.INVALID_COURSE });

  await Question.create({
    contents,
    options,
    course: courseData._id,
  });

  return res.status(200).json({ msg: MESSAGES.NEW_QUESTION_SUCCESSFUL });
};

export const getQuestions = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const questions = await Question.find({});
    return res.status(200).json({ questions });
  } catch (e) {
    console.log(e);
    return [];
  }
};
