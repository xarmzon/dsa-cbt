import { MESSAGES } from "../../../utils/constants";
import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "../../../utils/database";
import Admin from "../../../models/AdminModel";
import Course from "../../../models/CourseModel";
import Question from "../../../models/QuestionModel";
import Result from "../../../models/ResultModel";
import Student from "../../../models/StudentModel";
import Cookie from "js-cookie";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();

  try {
    switch (req.method) {
      case "POST":
        await addStudent(req, res);
        break;
      case "GET":
        await getStudents(req, res);
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

const addStudent = async (req: NextApiRequest, res: NextApiResponse) => {
  const { fullName, phoneNumber, course } = req.body;
  if (!fullName || !phoneNumber || !course)
    return res.status(400).json({ msg: MESSAGES.BAD_REQUEST });

  const courseData = await Course.findOne({ _id: course });
  if (!courseData)
    return res.status(404).json({ msg: MESSAGES.NO_COURSE_DATA });

  const startDiff: number = +new Date(courseData.startDate) - +new Date();

  if (startDiff > 0)
    return res.status(400).json({ msg: MESSAGES.CANT_START_EXAM });

  const dueDateDiff = +new Date(courseData.dueDate) - +new Date();
  if (dueDateDiff < 0)
    return res.status(400).json({ msg: MESSAGES.EXPIRED_EXAM });

  const words: string[] = fullName.toLowerCase().split(" ");
  const fullName_ = words
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  let studentData = await Student.findOne({ fullName: fullName_, phoneNumber });
  if (!studentData) {
    studentData = await Student.create({
      fullName,
      phoneNumber,
    });
  } else {
    const alreadyDone = await Result.findOne({
      student: studentData._id,
      course: courseData._id,
      score: { $gt: -1 },
    });
    if (alreadyDone) return res.status(400).json({ msg: MESSAGES.CANT_RESIT });
  }

  const resultData = await Result.create({
    course: courseData._id,
    student: studentData._id,
  });

  return res
    .status(201)
    .json({ id: resultData._id, msg: MESSAGES.NEW_STUDENT_SUCCEFUL });
};

export const getStudents = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    return res.status(200).json({ students: [] });
  } catch (e) {
    console.log(e);
    return res.status(200).json({ students: [] });
  }
};
