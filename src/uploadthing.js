import { createUploadthing } from "uploadthing/express";

/** @type {import("uploadthing/express").FileRouter} */
const f = createUploadthing();

export const uploadRouter = {
  chatFiles: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 1,
    },
    video: {
      maxFileSize: "50MB",
      maxFileCount: 1,
    },
    pdf: {
      maxFileSize: "10MB",
      maxFileCount: 1,
    },
    blob: {
      maxFileSize: "10MB",
      maxFileCount: 1, // docs, zip, etc
    },
  }).onUploadComplete((data) => {
    console.log("📎 Upload completed:", data.file.url);
  }),
};
