import { Schema, models, model } from "mongoose";

export interface IStudent {
  fullName: string;
  phoneNumber: string;
}
const StudentSchema = new Schema<IStudent>(
  {
    fullName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

StudentSchema.pre("save", function (next) {
  const words = this.fullName.toLowerCase().split(" ");
  this.fullName = words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  next();
});

const StudentModel = models.Student || model("Student", StudentSchema);

export default StudentModel;
