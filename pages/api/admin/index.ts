import {
  hashPassword,
  validateRegForm,
  validateUserPassword,
  generateToken,
  prepareAdmin,
} from "./../../../utils/auth";
import { MESSAGES } from "./../../../utils/constants";
import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "../../../utils/database";
import Admin from "../../../models/AdminModel";
import Course from "../../../models/CourseModel";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();

  try {
    switch (req.method) {
      case "POST":
        const { type } = req.body;
        if (!type) return res.status(400).json({ msg: MESSAGES.BAD_REQUEST });

        switch (type) {
          case "login":
            await login(req, res);
            break;

          case "register":
            await addAdmin(req, res);
            break;

          case "addCourse":
            await addCourse(req, res);
            break;
          default:
            return res.status(400).json({ msg: MESSAGES.BAD_REQUEST });
        }

        break;
      case "GET":
        break;
      case "PATCH":
        const { update } = req.body;
        if (!update) return res.status(400).json({ msg: MESSAGES.BAD_REQUEST });
        switch (update) {
          case "course":
            await updateCourse(req, res);
            break;
          default:
            return res.status(400).json({ msg: MESSAGES.BAD_REQUEST });
        }
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

const login = async (req: NextApiRequest, res: NextApiResponse) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ msg: MESSAGES.INVALID_CREDENTIALS });

  const admin = await Admin.findOne({ username });
  if (!admin) return res.status(404).json({ msg: MESSAGES.LOGIN_ERR });

  if (!(await validateUserPassword(password, admin.password)))
    return res.status(404).json({ msg: MESSAGES.LOGIN_ERR });

  const token = generateToken({ id: admin._id });

  return res.status(200).json({
    msg: MESSAGES.LOGIN_SUC,
    token,
    user: prepareAdmin(admin),
  });
};
const addAdmin = async (req: NextApiRequest, res: NextApiResponse) => {
  const { username, password, email } = req.body;
  if (
    !username ||
    !password ||
    !email ||
    password !== process.env.MASTER_PASSWORD
  )
    return res.status(400).json({ msg: MESSAGES.INVALID_CREDENTIALS });

  const userExist = await Admin.findOne({ $or: [{ username }, { email }] });
  if (userExist) return res.status(409).json({ msg: MESSAGES.ACCOUNT_EXIST });

  const formErrors = validateRegForm(req.body);
  if (formErrors.length > 0)
    return res
      .status(400)
      .json({ msg: MESSAGES.FORM_ERROR, errors: formErrors });

  await Admin.create({
    username,
    email,
    password: await hashPassword(password),
  });
  return res.status(201).json({ msg: MESSAGES.NEW_ACCOUNT_SUCCESSFUL });
};

const addCourse = async (req: NextApiRequest, res: NextApiResponse) => {
  const { title, questionNum, startDate, dueDate, timeAllowed, optionNum } =
    req.body;

  if (
    !title ||
    !questionNum ||
    !startDate ||
    !dueDate ||
    !timeAllowed ||
    !optionNum
  )
    return res.status(400).json({ msg: MESSAGES.INVALID_CREDENTIALS });

  const courseExist = await Course.findOne({ title });
  if (courseExist) return res.status(409).json({ msg: MESSAGES.COURSE_EXIST });

  const newCourse = await Course.create({
    title,
    questionNum,
    optionNum,
    startDate,
    dueDate,
    timeAllowed,
  });

  res
    .status(201)
    .json({ msg: MESSAGES.NEW_COURSE_SUCCESSFUL, course: newCourse });
};
const updateCourse = async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    _id,
    title,
    questionNum,
    startDate,
    dueDate,
    timeAllowed,
    optionNum,
  } = req.body;

  //console.log(req.body);
  if (
    !title ||
    !questionNum ||
    !startDate ||
    !dueDate ||
    !timeAllowed ||
    !optionNum ||
    !_id
  )
    return res.status(400).json({ msg: MESSAGES.INVALID_CREDENTIALS });

  const course = await Course.findById(_id);
  if (!course) return res.status(409).json({ msg: MESSAGES.COURSE_NOT_FOUND });

  course.title = title;
  course.questionNum = questionNum;
  course.startDate = startDate;
  course.dueDate = dueDate;
  course.timeAllowed = timeAllowed;
  course.optionNum = optionNum;

  await course.save();

  res.status(201).json({ msg: MESSAGES.COURSE_UPDATED_SUCCESSFUL });
};
