import { Schema, models, model } from "mongoose";

export interface IStudent {
  fullName: string;
  phoneNumber: string;
}

export interface IResult {
  score: number;
  course: Schema.Types.ObjectId;
  student: IStudent;
}

const ResultSchema = new Schema<IResult>(
  {
    score: {
      type: Number,
      required: true,
      default: -1,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
  },
  { timestamps: true }
);

const ResultModel = models.Result || model("Result", ResultSchema);

export default ResultModel;
