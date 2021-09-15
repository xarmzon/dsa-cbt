import { USER_TYPES } from "./../utils/constants";
import { Schema, model, models } from "mongoose";

export interface IAdmin {
  username: string;
  password: string;
  email: string;
  userType?: string;
}

const AdminSchema = new Schema<IAdmin>(
  {
    username: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    password: {
      type: String,
    },
    userType: {
      type: String,
      default: USER_TYPES.ADMIN,
    },
  },
  { timestamps: true }
);

//AdminSchema.method.

const Admin = models.Admin || model<IAdmin>("Admin", AdminSchema);

export default Admin;
