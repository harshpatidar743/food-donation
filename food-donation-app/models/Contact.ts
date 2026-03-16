import mongoose, { Model, Schema } from "mongoose";

export type ContactDocument = {
  name: string;
  email: string;
  message: string;
  createdAt: Date;
};

const contactSchema = new Schema<ContactDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

const Contact =
  (mongoose.models.Contact as Model<ContactDocument>) ||
  mongoose.model<ContactDocument>("Contact", contactSchema);

export default Contact;
