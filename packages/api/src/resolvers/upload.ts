import { ApolloError } from "apollo-server-koa";
import { UploadModel, IUpload, IResource } from "../models/upload";
import { orderFunctions } from "../utils";
import { DocumentModel } from "../models/document";
import { ObjectId, ObjectID } from "bson";
import { ExerciseModel } from "../models/exercise";

const fs = require("fs"); //Load the filesystem module
const { Storage } = require("@google-cloud/storage");

const storage = new Storage(process.env.GCLOUD_PROJECT_ID); // project ID
const bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET); // bucket name
const bucketName: string = process.env.GCLOUD_STORAGE_BUCKET;

let publicUrl: string;
let thumbnailUrl: any | null;
let fileSize: number;

const acceptedFiles = {
  image: [".png", ".gif", ".jpg", ".jpeg", "webp"],
  video: [".mp4", ".webm"],
  sound: [".mp3", ".ocg"],
  object3D: [".stl"]
};

const normalize = (function() {
  let from = "ÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛãàáäâèéëêìíïîòóöôùúüûÑñÇç",
    to = "AAAAAEEEEIIIIOOOOUUUUaaaaaeeeeiiiioooouuuunncc",
    mapping = {};

  for (let i = 0, j = from.length; i < j; i++)
    mapping[from.charAt(i)] = to.charAt(i);

  return function(str) {
    let ret = [];
    for (let i = 0, j = str.length; i < j; i++) {
      let c = str.charAt(i);
      if (mapping.hasOwnProperty(str.charAt(i))) ret.push(mapping[c]);
      else ret.push(c);
    }
    return ret
      .join("")
      .replace(/[^-A-Za-z0-9]+/g, "-")
      .toLowerCase();
  };
})();

const uploadThumbnail = async (createReadStream: any, gcsName: string) => {
  return new Promise((resolve, reject) => {
    const file = bucket.file(gcsName);

    const opts = {
      metadata: {
        cacheControl: "private, max-age=0, no-transform"
      }
    };
    const fileStream = createReadStream();
    const gStream = file.createWriteStream(opts);
    gStream
      .on("error", err => {
        reject(new ApolloError("Error uploading file", "UPLOAD_ERROR"));
      })
      .on("finish", async err => {
        if (err) {
          throw new ApolloError("Error uploading file", "UPLOAD_ERROR");
        }
        file.makePublic().then(async () => {
          const thumbResult: string = getPublicUrl(gcsName);
          resolve(thumbResult);
        });
      });
    fileStream.pipe(gStream);
  });
};

const processUpload = async (input: {
  resolve: any;
  reject: any;
  createReadStream: any;
  gcsName: string;
  documentID?: string;
  filename?: string;
  mimetype?: string;
  encoding?: string;
  userID?: string;
  thumbnailUrl?: string;
  type?: string;
}) => {
  const file = bucket.file(input.gcsName);

  const opts = {
    metadata: {
      cacheControl: "private, max-age=0, no-transform"
    }
  };
  const fileStream = input.createReadStream();
  const gStream = file.createWriteStream(opts);
  gStream
    .on("error", err => {
      input.reject(new ApolloError("Error uploading file", "UPLOAD_ERROR"));
    })
    .on("finish", async err => {
      if (err) {
        throw new ApolloError("Error uploading file", "UPLOAD_ERROR");
      }

      file.makePublic().then(async () => {
        publicUrl = getPublicUrl(input.gcsName);
        fileSize = getFilesizeInBytes(input.createReadStream().path);
        if (fileSize > 10000000) {
          throw new ApolloError(
            "Upload error, image too big.",
            "UPLOAD_SIZE_ERROR"
          );
        }
        let uploaded: IUpload;
        if (
          await UploadModel.findOne({
            document: input.documentID,
            publicUrl,
            user: input.userID
          })
        ) {
          uploaded = await UploadModel.findOneAndUpdate(
            {
              publicUrl,
              user: input.userID,
              type: input.type
            },
            {
              $set: {
                filename: input.filename,
                mimetype: input.mimetype,
                encoding: input.encoding,
                storageName: input.gcsName,
                size: fileSize,
                publicUrl: publicUrl,
                image: input.type === "image" ? publicUrl : null,
                preview: publicUrl,
                thumbnail: input.thumbnailUrl ? input.thumbnailUrl : publicUrl,
                type: input.type,
                deleted: false
              }
            },
            { new: true }
          );
        } else {
          const uploadNew = new UploadModel({
            document: input.documentID,
            filename: input.filename,
            mimetype: input.mimetype,
            encoding: input.encoding,
            publicUrl: publicUrl,
            storageName: input.gcsName,
            size: fileSize,
            user: input.userID,
            image: input.type === "image" ? publicUrl : null,
            preview: publicUrl,
            thumbnail: input.thumbnailUrl ? input.thumbnailUrl : publicUrl,
            type: input.type,
            deleted: false
          });
          uploaded = await UploadModel.create(uploadNew);
        }
        input.resolve(uploaded);
      });
    });

  fileStream.pipe(gStream);
};

function getPublicUrl(filename) {
  //const finalName: string = encodeURIComponent(filename);
  return `https://storage.googleapis.com/${bucketName}/${filename}`;
}

export function getFilesizeInBytes(filename) {
  try {
    const stats = fs.statSync(filename);
    const fileSizeInBytes: number = stats["size"];
    return fileSizeInBytes;
  } catch (e) {
    console.log(e);
  }
}

export async function uploadDocumentImage(
  image,
  documentID,
  userID
): Promise<IUpload> {
  const { createReadStream, filename, mimetype, encoding } = await image;
  if (!createReadStream || !filename || !mimetype || !encoding) {
    throw new ApolloError("Upload error, check file type.", "UPLOAD_ERROR");
  }
  if (String(mimetype).indexOf("image") === -1) {
    throw new ApolloError(
      "Upload error, check image format.",
      "UPLOAD_FORMAT_ERROR"
    );
  }
  if (getFilesizeInBytes(createReadStream().path) > 2000000) {
    // 2megas
    throw new ApolloError("Upload error, image too big.", "UPLOAD_SIZE_ERROR");
  }
  const uniqueName: string = documentID + normalize(filename);
  const gcsName: string = `${userID}/${encodeURIComponent(uniqueName)}`;

  return await new Promise((resolve, reject) => {
    processUpload({
      resolve: resolve,
      reject: reject,
      createReadStream: createReadStream,
      gcsName: gcsName,
      documentID: documentID,
      filename: filename,
      mimetype: mimetype,
      encoding: encoding,
      userID: userID,
      type: "docImage"
    });
  });
}

const uploadResolver = {
  Query: {
    uploads: () => UploadModel.find({}),
    getUserFiles: async (root: any, args: any, context: any) => {
      const [files] = await bucket.getFiles({
        prefix: `${context.user.userID}`
      });
      console.log("Files:");
      files.forEach(async file => {
        await file.getMetadata().then(result => {
          console.log(file.name);
          console.log(result[0].size);
        });
      });
      return await UploadModel.find({ user: context.user.userID });
    },

    cloudResources: async (root: any, args: any, context: any) => {
      const itemsPerPage: number = 8;
      const skipN: number = (args.currentPage - 1) * itemsPerPage;
      const limit: number = skipN + itemsPerPage;
      const text: string = args.searchTitle;

      const orderFunction = orderFunctions[args.order];
      let filtedOptions = {};
      args.deleted
        ? (filtedOptions = {
            deleted: true
          })
        : (filtedOptions = {
            type: { $in: args.type },
            deleted: false
          });
      const userUploads: IUpload[] = await UploadModel.find({
        filename: { $regex: `.*${text}.*`, $options: "i" },
        user: context.user.userID,
        ...filtedOptions
      });

      const resources: IResource[] = userUploads.map(i => {
        return {
          id: i._id,
          title: i.filename,
          type: i.type,
          size: i.size,
          thumbnail: i.thumbnail,
          preview: i.preview,
          file: i.publicUrl,
          deleted: i.deleted,
          createdAt: i.createdAt
        };
      });
      const pagesNumber: number = Math.ceil(resources.length / itemsPerPage);
      const result: IResource[] = await resources
        .sort(orderFunction)
        .slice(skipN, limit);

      return { resources: result, pagesNumber };
    }
  },
  Mutation: {
    singleUpload: async (file, documentID, userID) => {
      const { createReadStream, filename, mimetype, encoding } = await file;
      if (!createReadStream || !filename || !mimetype || !encoding) {
        throw new ApolloError("Upload error, check file type.", "UPLOAD_ERROR");
      }
      const uniqueName: string = Date.now() + normalize(filename);
      const gcsName: string = `${userID}/${encodeURIComponent(uniqueName)}`;
      return await new Promise((resolve, reject) => {
        processUpload({
          resolve: resolve,
          reject: reject,
          createReadStream: createReadStream,
          gcsName: gcsName,
          documentID: documentID,
          filename: filename,
          mimetype: mimetype,
          encoding: encoding,
          userID: userID,
          type: ""
        });
      });
    },
    uploadCloudResource: async (root: any, args: any, context: any) => {
      if (args.thumbnail) {
        const {
          createReadStream,
          filename,
          mimetype,
          encoding
        } = await args.thumbnail;
        if (!createReadStream || !filename || !mimetype || !encoding) {
          throw new ApolloError(
            "Upload error with thumbnail, check file type.",
            "UPLOAD_ERROR"
          );
        }
        const uniqueName: string =
          "thumbnail" + Date.now() + normalize(filename);
        const gcsName: string = `${context.user.userID}/${encodeURIComponent(
          uniqueName
        )}`;
        thumbnailUrl = await uploadThumbnail(createReadStream, gcsName);
      }
      const {
        createReadStream,
        filename,
        mimetype,
        encoding
      } = await args.file;
      if (!createReadStream || !filename || !mimetype || !encoding) {
        throw new ApolloError("Upload error, check file type.", "UPLOAD_ERROR");
      }
      let fileType: string = "";
      for (const type in acceptedFiles) {
        if (acceptedFiles.hasOwnProperty(type)) {
          for (const item of acceptedFiles[type]) {
            if (filename.indexOf(item) > -1) {
              fileType = type;
              break;
            }
          }
        }
      }
      if (fileType === "") {
        throw new ApolloError(
          "Upload error, check file format",
          "UPLOAD_FORMAT_ERROR"
        );
      }
      const uniqueName: string = Date.now() + normalize(filename);
      const gcsName: string = `${context.user.userID}/${encodeURIComponent(
        uniqueName
      )}`;
      return new Promise(async (resolve, reject) => {
        processUpload({
          resolve: resolve,
          reject: reject,
          createReadStream: createReadStream,
          gcsName: gcsName,
          documentID: undefined,
          filename: filename,
          mimetype: mimetype,
          encoding: encoding,
          userID: context.user.userID,
          thumbnailUrl: await thumbnailUrl,
          type: fileType
        });
      });
    },
    uploadSTLFile: async (root: any, args: any, context: any) => {
      const {
        createReadStream,
        filename,
        mimetype,
        encoding
      } = await args.file;

      if (!createReadStream || !filename || !mimetype || !encoding) {
        throw new ApolloError("Upload error, check file type.", "UPLOAD_ERROR");
      }
      if (String(filename).indexOf("stl") === -1) {
        throw new ApolloError(
          "Upload error, check file format. It must be an STL",
          "UPLOAD_FORMAT_ERROR"
        );
      }
      const uniqueName: string = Date.now() + normalize(filename);
      const gcsName: string = `${context.user.userID}/${encodeURIComponent(
        uniqueName
      )}`;
      return new Promise((resolve, reject) => {
        processUpload({
          resolve: resolve,
          reject: reject,
          createReadStream: createReadStream,
          gcsName: gcsName,
          documentID: args.documentID,
          filename: filename,
          mimetype: mimetype,
          encoding: encoding,
          userID: context.user.userID,
          type: "object3D"
        });
      });
    },

    addResourceToDocument: async (root: any, args: any, context: any) => {
      await DocumentModel.findOneAndUpdate(
        { _id: args.documentID },
        { $push: { resourcesID: args.resourceID } },
        { new: true }
      );
      return UploadModel.findOneAndUpdate(
        { _id: args.resourceID, deleted: false },
        { $push: { documentsID: args.documentID } },
        { new: true }
      );
    },

    addResourceToExercises: async (root: any, args: any, context: any) => {
      await DocumentModel.findOneAndUpdate(
        { _id: args.documentID },
        { $push: { exResourcesID: args.resourceID } },
        { new: true }
      );
      return UploadModel.findOneAndUpdate(
        { _id: args.resourceID },
        { $push: { exercisesWithDocID: args.documentID } },
        { new: true }
      );
    },

    deleteResourceFromExercises: async (root: any, args: any, context: any) => {
      await DocumentModel.findOneAndUpdate(
        { _id: args.documentID },
        { $pull: { exResourcesID: args.resourceID } },
        { new: true }
      );
      return UploadModel.findOneAndUpdate(
        { _id: args.resourceID },
        { $pull: { exercisesWithDocID: args.documentID } },
        { new: true }
      );
    },

    uploadImageFile: async (root: any, args: any, context: any) => {
      const {
        createReadStream,
        filename,
        mimetype,
        encoding
      } = await args.file;
      if (!createReadStream || !filename || !mimetype || !encoding) {
        throw new ApolloError("Upload error, check file type.", "UPLOAD_ERROR");
      }
      const uniqueName: string = Date.now() + normalize(filename);
      const gcsName: string = `${context.user.userID}/${encodeURIComponent(
        uniqueName
      )}`;
      return await new Promise((resolve, reject) => {
        processUpload({
          resolve: resolve,
          reject: reject,
          createReadStream: createReadStream,
          gcsName: gcsName,
          documentID: args.documentID,
          filename: filename,
          mimetype: mimetype,
          encoding: encoding,
          userID: context.user.userID,
          type: "image"
        });
      });
    },
    deleteUserFile: async (root: any, args: any, context: any) => {
      if (args.filename) {
        await bucket.file(`${context.user.userID}/${args.filename}`).delete();
        return await UploadModel.deleteOne({
          publicUrl: {
            $regex: `${context.user.userID}/${args.filename}`,
            $options: "i"
          }
        });
      }
    },
    moveToTrash: async (root: any, args: any, context: any) => {
      const uploaded: IUpload = await UploadModel.findOne({
        _id: args.id,
        user: context.user.userID
      });
      if (!uploaded) {
        throw new ApolloError("File not found", "FILE_NOT_FOUND");
      }
      return await UploadModel.findOneAndUpdate(
        { _id: uploaded._id },
        { $set: { deleted: true } },
        { new: true }
      );
    },
    restoreResource: async (root: any, args: any, context: any) => {
      const uploaded: IUpload = await UploadModel.findOne({
        _id: args.id,
        user: context.user.userID
      });
      if (!uploaded) {
        throw new ApolloError("File not found", "FILE_NOT_FOUND");
      }
      return await UploadModel.findOneAndUpdate(
        { _id: uploaded._id },
        { $set: { deleted: false } },
        { new: true }
      );
    }
  },
  Upload: {
    documents: async (upload: IUpload) => {
      return await DocumentModel.find({ _id: { $in: upload.documentsID } });
    }
  }
};

export default uploadResolver;
