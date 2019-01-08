import * as mongoose from 'mongoose';
import { Document, Schema, Model } from 'mongoose';

interface IDocument extends Document {
  user?: String;
  title?: String;
  type?: String;
  content?: String;
  createdAt?: Date;
  updatedAt?: Date;
  description?: String;
}

const DocumentMongSchema: Schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'UserModel',
  },

  title: {
    type: String,
    trim: true,
  },

  type: {
    type: String,
    required: true,
  },

  content: {
    //type: JSON,
    type: String,
    trim: true,
  },

  description: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date.now(),
  },

  updatedAt: {
    type: Date,
    default: Date.now(),
  },

  versions: [
    {
      //content: JSON,
      type: String,
      date: Date,
      id: Number,
    },
  ],

  exercise: [
    {
      //content: JSON,
      type: String,
      date: Date,
      id: Number,
    },
  ],
});

export const DocumentModel: Model<IDocument> = mongoose.model<IDocument>(
  'DocumentModel',
  DocumentMongSchema,
);
