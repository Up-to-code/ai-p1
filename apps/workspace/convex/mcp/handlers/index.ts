import { registerReadHandler, registerWriteHandler } from "./registry";
import { organizationInfo } from "./organization";
import { clientsList, clientsGet, clientsCreate, clientsUpdate, clientsDelete } from "./clients";
import { projectsList, projectsGet, projectsCreate, projectsUpdate, projectsDelete } from "./projects";
import { dealsList, dealsGet, dealsCreate, dealsUpdate, dealsDelete } from "./deals";
import { calendarListToday, calendarListRange, calendarListMonth, calendarGet, calendarCreate, calendarUpdate, calendarDelete } from "./calendar";
import { tasksList, tasksGet, tasksCreate, tasksUpdate, tasksComplete, tasksDelete } from "./tasks";
import { mediaList, mediaAttachUrl } from "./media";
import { notificationsSchedule, notificationsUpdateSchedule, notificationsCancelSchedule } from "./notifications";
import {
  spaces_list,
  spaces_get,
  spaces_create,
  spaces_update,
  spaces_delete,
  space_members_list,
  space_members_add,
  space_members_remove,
  space_members_update_role,
} from "./spaces";

export function registerAllHandlers() {
  // Read handlers
  registerReadHandler("organization_info", organizationInfo);
  registerReadHandler("clients_list", clientsList);
  registerReadHandler("clients_get", clientsGet);
  registerReadHandler("projects_list", projectsList);
  registerReadHandler("projects_get", projectsGet);
  registerReadHandler("deals_list", dealsList);
  registerReadHandler("deals_get", dealsGet);
  registerReadHandler("calendar_list_today", calendarListToday);
  registerReadHandler("calendar_list_range", calendarListRange);
  registerReadHandler("calendar_list_month", calendarListMonth);
  registerReadHandler("calendar_get", calendarGet);
  registerReadHandler("tasks_list", tasksList);
  registerReadHandler("tasks_get", tasksGet);
  registerReadHandler("media_list", mediaList);
  registerReadHandler("spaces_list", spaces_list);
  registerReadHandler("spaces_get", spaces_get);
  registerReadHandler("space_members_list", space_members_list);

  // Write handlers
  registerWriteHandler("clients_create", clientsCreate);
  registerWriteHandler("clients_update", clientsUpdate);
  registerWriteHandler("clients_delete", clientsDelete);
  registerWriteHandler("projects_create", projectsCreate);
  registerWriteHandler("projects_update", projectsUpdate);
  registerWriteHandler("projects_delete", projectsDelete);
  registerWriteHandler("deals_create", dealsCreate);
  registerWriteHandler("deals_update", dealsUpdate);
  registerWriteHandler("deals_delete", dealsDelete);
  registerWriteHandler("calendar_create", calendarCreate);
  registerWriteHandler("calendar_update", calendarUpdate);
  registerWriteHandler("calendar_delete", calendarDelete);
  registerWriteHandler("tasks_create", tasksCreate);
  registerWriteHandler("tasks_update", tasksUpdate);
  registerWriteHandler("tasks_complete", tasksComplete);
  registerWriteHandler("tasks_delete", tasksDelete);
  registerWriteHandler("media_attach_url", mediaAttachUrl);
  registerWriteHandler("notifications_schedule", notificationsSchedule);
  registerWriteHandler("notifications_update_schedule", notificationsUpdateSchedule);
  registerWriteHandler("notifications_cancel_schedule", notificationsCancelSchedule);
  registerWriteHandler("spaces_create", spaces_create);
  registerWriteHandler("spaces_update", spaces_update);
  registerWriteHandler("spaces_delete", spaces_delete);
  registerWriteHandler("space_members_add", space_members_add);
  registerWriteHandler("space_members_remove", space_members_remove);
  registerWriteHandler("space_members_update_role", space_members_update_role);
}
