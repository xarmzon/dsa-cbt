import mongoose from "mongoose";
import { FETCH_LIMIT, MESSAGES } from "../../../utils/constants";
import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "../../../utils/database";
import Admin from "../../../models/AdminModel";
import Course from "../../../models/CourseModel";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();

  try {
    switch (req.method) {
      case "POST":
        break;
      case "GET":
        await getCourse(req, res);
        break;
      case "PATCH":
        break;
      case "DELETE":
        await deleteCourse(req, res);
        break;
      default:
        return;
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ msg: MESSAGES.UNKNOWN_ERROR });
  }
};

const getCourse = async (req: NextApiRequest, res: NextApiResponse) => {
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
    options = { title: { $regex: searchTerm, $options: "i" } };
    page = 0;
  }
  const pg = await getPaginatedData(page, limit, Course, options);
  //console.log(pg);
  return res.status(200).json(pg);
  //const courses = await Course.find();
};

const deleteCourse = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ msg: MESSAGES.BAD_REQUEST });

  //console.log(id);
  const deleted = await Course.deleteOne({ _id: id });
  //console.log(deleted);
  if (deleted.deletedCount && deleted.deletedCount > 0)
    return res.status(200).json({ msg: MESSAGES.COURSE_DELETED });
  else return res.status(404).json({ msg: MESSAGES.COURSE_NOT_FOUND });
};

export const getCourseData = async (id: string) => {
  try {
    const course = await Course.findOne({ _id: id });
    return course;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getPagination = (page: number, size?: number) => {
  const limit = size ? +size : FETCH_LIMIT;
  const offset = page ? +page * limit : 0 * FETCH_LIMIT;

  //console.log(offset, limit);
  return { limit, offset };
};

export const getPaginatedData = async (
  page: number,
  perPage: number,
  Model: any,
  modelOptions: any
) => {
  const { limit, offset } = getPagination(page, perPage);
  //console.log("limit=%d offset=%d", limit, offset);
  const results = await Model.find(modelOptions)
    .sort("-createdAt")
    .skip(offset)
    .limit(limit);
  const totalItems = await Model.find(modelOptions).count();

  const totalPages = Math.ceil(totalItems / limit);
  return {
    results,
    paging: {
      totalPages,
      page: page + 1,
      totalItems,
      perPage,
    },
  };
};
