import { FETCH_LIMIT, MESSAGES } from "../../../utils/constants";
import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "../../../utils/database";
import Admin from "../../../models/AdminModel";
import Course from "../../../models/CourseModel";
import Question from "../../../models/QuestionModel";
import { getPaginatedData } from "../course";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();

  try {
    switch (req.method) {
      case "POST":
        break;
      case "GET":
        await getCourseQuestions(req, res);
        break;
      case "PATCH":
        await updateQuestion(req, res);
        break;
      case "DELETE":
        await deleteQuestion(req, res);
        break;
      default:
        return;
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ msg: MESSAGES.UNKNOWN_ERROR });
  }
};

const updateQuestion = async (req: NextApiRequest, res: NextApiResponse) => {
  const { contents, options, qId } = req.body;
  if (!contents || !options || !qId)
    return res.status(400).json({ msg: MESSAGES.INVALID_CREDENTIALS });

  const question = await Question.findById(qId);

  if (!question)
    return res.status(404).json({ msg: MESSAGES.QUESTION_NOT_FOUND });

  question.contents = contents;
  question.options = options;

  const result = await question.save();
  //console.log(result);

  return res.status(200).json({ msg: MESSAGES.QUESTION_UPDATED_SUCCESSFUL });
};

const deleteQuestion = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ msg: MESSAGES.BAD_REQUEST });

  const deleted = await Question.deleteOne({ _id: id as string });
  //console.log(deleted);
  if (deleted.deletedCount && deleted.deletedCount > 0)
    return res.status(200).json({ msg: MESSAGES.QUESTION_DELETED });
  else return res.status(404).json({ msg: MESSAGES.QUESTION_NOT_FOUND });
};

export const getCourseQuestions = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { id } = req.query;
  //console.log("id=%s\nsearch=%s\npage=%s", id, search, page);
  const course =
    id.length > 24 || id.length < 24 ? "61dddddddd44444444343434" : id;
  let limit: number = req.query.limit
    ? parseInt(req.query.limit as string)
    : FETCH_LIMIT;
  let page: number = req.query.page
    ? parseInt(req.query.page as string) - 1
    : 0;
  const searchTerm: string = req.query.search
    ? (req.query.search as string)
    : "";

  //console.log(searchTerm);
  let options = {};
  if (searchTerm) {
    options = { course, contents: { $regex: searchTerm, $options: "i" } };
    page = 0;
  } else {
    options = { course };
  }
  //console.log(options);
  const pg = await getPaginatedData(page, limit, Question, options);
  return res.status(200).json(pg);
};
