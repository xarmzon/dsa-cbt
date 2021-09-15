import { Schema, models, model } from "mongoose";

export interface ICourse {
  title: string;
  questionNum: number;
  optionNum: number;
  startDate: Date;
  dueDate: Date;
  timeAllowed: number;
}
const CourseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      index: true,
      uppercase: true,
    },
    optionNum: {
      type: Number,
      required: true,
      default: 4,
    },
    questionNum: {
      type: Number,
      required: true,
      default: 1,
    },
    startDate: {
      type: Date,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    timeAllowed: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const CourseModel = models.Course || model("Course", CourseSchema);

export default CourseModel;
