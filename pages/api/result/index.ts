import { FETCH_LIMIT } from "./../../../utils/constants";
import { getPagination } from "./../course/index";
import { MESSAGES } from "../../../utils/constants";
import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "../../../utils/database";
import Admin from "../../../models/AdminModel";
import Course from "../../../models/CourseModel";
import Question from "../../../models/QuestionModel";
import Result from "../../../models/ResultModel";
import Student from "../../../models/StudentModel";

export interface IResultModelOptions {
  match?: any;
  resultMatch?: any;
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();

  try {
    switch (req.method) {
      case "POST":
        break;
      case "GET":
        await getResults(req, res);
        break;
      case "PATCH":
        await updateResult(req, res);
        break;
      case "DELETE":
        await deleteResult(req, res);
        break;
      default:
        return;
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ msg: MESSAGES.UNKNOWN_ERROR });
  }
};

const getResults = async (req: NextApiRequest, res: NextApiResponse) => {
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
  const filter = {
    match: null,
  };
  if (searchTerm) {
    filter.match = {
      $or: [
        { fullName: { $regex: searchTerm, $options: "i" } },
        { phoneNumber: { $regex: searchTerm } },
      ],
    };
    page = 0;
  }
  const pg = await getResultsData(page, limit, filter);

  return res.status(200).json(pg);
};

export const getResultsData = async (
  page: number,
  perPage: number,
  modelOptions?: IResultModelOptions
) => {
  const { limit, offset } = getPagination(page, perPage);

  //console.log(modelOptions);

  // const pipelines = [
  //   {
  //     $lookup: {
  //       from: "courses",
  //       localField: "course",
  //       foreignField: "_id",
  //       as: "course",
  //     },
  //   },
  //   {
  //     $unwind: "$course",
  //   },
  //   {
  //     $lookup: {
  //       from: "students",
  //       localField: "student",
  //       foreignField: "_id",
  //       as: "student",
  //     },
  //   },
  //   {
  //     $unwind: "$student",
  //   },
  //   { $match: modelOptions?.match ? modelOptions.match : {} },
  //   {
  //     $sort: { createdAt: -1 },
  //   },
  //   { $skip: offset },
  //   { $limit: limit },
  //   {
  //     $project: {
  //       _id: 1,
  //       student: { fullName: 1, phoneNumber: 1 },
  //       course: { title: 1 },
  //       createdAt: 1,
  //       score: {
  //         $cond: [{ $gte: ["$score", 0] }, "$score", "0"],
  //       },
  //       status: {
  //         $cond: [{ $gt: ["$score", -1] }, "Submitted", "Not Submitted"],
  //       },
  //     },
  //   },
  // ];
  const pipelines = [
    {
      $match: modelOptions?.match ? modelOptions.match : {},
    },

    {
      $lookup: {
        from: "results",
        let: {
          id: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$student", "$$id"],
              },
            },
          },
          {
            $lookup: {
              from: "courses",
              localField: "course",
              foreignField: "_id",
              as: "course",
            },
          },
          {
            $unwind: "$course",
          },
          {
            $project: {
              course: {
                title: 1,
                questionNum: 1,
              },
              score: {
                $cond: [
                  {
                    $gte: ["$score", 0],
                  },
                  {
                    $round: [
                      {
                        $multiply: [
                          { $divide: ["$score", "$course.questionNum"] },
                          100,
                        ],
                      },
                      2,
                    ],
                  },
                  "---",
                ],
              },
              status: {
                $cond: [
                  {
                    $gte: ["$score", 0],
                  },
                  "Submitted",
                  "Not Submitted",
                ],
              },
              examAddedAt: "$createdAt",
            },
          },
        ],
        as: "result",
      },
    },
    {
      $unwind: {
        path: "$result",
      },
    },
    {
      $sort: {
        "result.examAddedAt": -1,
      },
    },
    {
      $project: {
        fullName: 1,
        phoneNumber: 1,
        result: 1,
        course: 1,
      },
    },
    { $skip: offset },
    { $limit: limit },
  ];

  const countPiplines = [
    ...pipelines.filter(
      (_, i) =>
        i !== pipelines.length - 1 &&
        i !== pipelines.length - 2 &&
        i !== pipelines.length - 3
    ),
    {
      $count: "totalItems",
    },
  ];

  const items = await Student.aggregate(pipelines).exec();
  const countQ = (await Student.aggregate(countPiplines).exec())[0];

  const totalItems = countQ?.totalItems ? countQ.totalItems : 1;
  const totalPages = Math.ceil(totalItems / limit);

  return {
    items,
    paging: {
      totalPages,
      page: page + 1,
      totalItems,
      perPage,
    },
  };
};

const updateResult = async (req: NextApiRequest, res: NextApiResponse) => {
  const { exam, answers } = req.body;
  if (!exam || !answers)
    return res.status(400).json({ msg: MESSAGES.INVALID_CREDENTIALS });

  const examData = await Result.findById(exam);

  if (!examData) return res.status(404).json({ msg: MESSAGES.EXAM_NOT_FOUND });

  const answersParsed: { answer: boolean; value: string }[] =
    JSON.parse(answers);

  const studentScore: number = answersParsed.filter(
    (v) => v.answer === true
  ).length;

  examData.score = studentScore;

  //console.log(examData);
  await examData.save();

  return res.status(200).json({ msg: MESSAGES.EXAM_SUCCESSFUL });
};

const deleteResult = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ msg: MESSAGES.BAD_REQUEST });

  const deleted = await Result.deleteOne({ _id: id });
  if (deleted.deletedCount && deleted.deletedCount > 0)
    return res.status(200).json({ msg: MESSAGES.RESULT_DELETED });
  else return res.status(404).json({ msg: MESSAGES.RESULT_NOT_FOUND });
};
