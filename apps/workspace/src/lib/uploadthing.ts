import { genUploader } from "uploadthing/client";
import type { UploadRouter } from "@/server/uploadthing/router";

export const { uploadFiles } = genUploader<UploadRouter>({
  url: "/api/uploadthing",
  package: "qentrah-workspace",
});
