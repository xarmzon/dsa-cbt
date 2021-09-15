import { MESSAGES } from "../../../utils/constants";
import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "../../../utils/database";
import Admin from "../../../models/AdminModel";
import Course from "../../../models/CourseModel";
import Question from "../../../models/QuestionModel";
import Result from "../../../models/ResultModel";
import Student from "../../../models/StudentModel";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();

  try {
    switch (req.method) {
      case "POST":
        break;
      case "GET":
        await getDashboardData(req, res);
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

const getDashboardData = async (req: NextApiRequest, res: NextApiResponse) => {
  const data = {
    totalStudents: await Student.find({}).count(),
    totalCourses: await Course.find({}).count(),
    doneExam: await Result.find({ score: { $gt: -1 } }).count(),
    undoneExam: await Result.find({ score: -1 }).count(),
    recentResults: await Result.find({ score: { $gt: -1 } })
      .populate("course student")
      .sort("-createdAt")
      .limit(10)
      .exec(),
    recentStudents: await Student.find({}).sort("-createdAt").limit(10),
  };
  return res.status(200).json(data);
};
