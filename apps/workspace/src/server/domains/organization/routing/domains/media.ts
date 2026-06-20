import { Hono } from "hono";
import {
  handleAttachMedia,
  handleCreateMediaFolder,
  handleDeleteMedia,
  handleDeleteMediaFolder,
  handleUpdateMedia,
} from "@/server/domains/media/handlers/media";

export const mediaSubRouter = new Hono();

mediaSubRouter.post("/:organizationId/media/attach", handleAttachMedia);
mediaSubRouter.post("/:organizationId/media/folders", handleCreateMediaFolder);
mediaSubRouter.delete("/:organizationId/media/folders/:folderId", handleDeleteMediaFolder);
mediaSubRouter.patch("/:organizationId/media/:mediaId", handleUpdateMedia);
mediaSubRouter.delete("/:organizationId/media/:mediaId", handleDeleteMedia);
