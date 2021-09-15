import { Schema, models, model } from "mongoose";

export interface IQuestion {
  contents: string;
  options: string[];
}

const QuestionSchema = new Schema(
  {
    contents: {
      type: String,
      required: true,
    },
    options: {
      type: Array,
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
    },
  },
  { timestamps: true }
);

const QuestionModel = models.Question || model("Question", QuestionSchema);

export default QuestionModel;
