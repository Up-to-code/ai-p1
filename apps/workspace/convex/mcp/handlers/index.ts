import { registerReadHandler, registerWriteHandler } from "./registry";
import { organizationInfo } from "./organization";
import { clientsList, clientsGet, clientsCreate, clientsUpdate, clientsDelete } from "./clients";
import { projectsList, projectsGet, projectsCreate, projectsUpdate, projectsDelete } from "./projects";
import { dealsList, dealsGet, dealsCreate, dealsUpdate, dealsDelete } from "./deals";
import { calendarListToday, calendarListRange, calendarListMonth, calendarGet, calendarCreate, calendarUpdate, calendarDelete } from "./calendar";
import { tasksList, tasksGet, tasksCreate, tasksUpdate, tasksComplete, tasksDelete } from "./tasks";
import { mediaList, mediaAttachUrl } from "./media";
import { notificationsSchedule, notificationsUpdateSchedule, notificationsCancelSchedule } from "./notifications";

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
}
