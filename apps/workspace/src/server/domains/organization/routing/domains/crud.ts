import { Hono } from "hono";
import { handleReadOpportunities, handleReadOpportunity, handleReadOpportunityOptions, handleReadOpportunityStats } from "@/server/domains/opportunities/handlers/opportunities-read";
import { handleReadDeals, handleReadDeal, handleReadDealOptions, handleReadDealStats } from "@/server/domains/deals/handlers/deals-read";
import { handleReadTasks, handleReadTask, handleReadTaskOptions, handleReadTaskStats } from "@/server/domains/clientTasks/handlers/client-tasks-read";
import { handleReadProjects, handleReadProject, handleReadProjectOptions, handleReadProjectStats, handleReadProjectsIndex } from "@/server/domains/projects/handlers/projects-read";
import { handleReadClients, handleReadClientOptions, handleReadClientStats, handleReadClientsIndex } from "@/server/domains/clients/handlers/clients-read";
import { handleReadCalendarEvents, handleReadCalendarIndex, handleReadCalendarStats, handleReadUpcomingCalendarEvents } from "@/server/domains/calendar/handlers/calendar-read";
import { handleReadActivity, handleReadActivityIndex, handleReadActivityStats } from "@/server/domains/organization/handlers/activity-read";
import { handleReadDashboardIndex, handleReadDashboardOverview } from "@/server/domains/organization/handlers/dashboard-read";
import { handleCreateProject, handleDeleteProject, handleUpdateProject } from "@/server/domains/projects/handlers/projects";
import { handleCreateOpportunity, handleDeleteOpportunity, handleUpdateOpportunity } from "@/server/domains/opportunities/handlers/opportunities";
import { handleCreateDeal, handleDeleteDeal, handleUpdateDeal } from "@/server/domains/deals/handlers/deals";
import { handleCreateClient, handleDeleteClient, handleUpdateClient } from "@/server/domains/clients/handlers/clients";
import { handleCreateClientTask, handleDeleteClientTask, handleUpdateClientTask } from "@/server/domains/clientTasks/handlers/client-tasks";
import { handleCreateFollowUp, handleDeleteFollowUp, handleMarkFollowUpComplete, handleUpdateFollowUp } from "@/server/domains/clientFollowUps/handlers/follow-ups";
import { handleCreateCalendarEvent, handleDeleteCalendarEvent, handleUpdateCalendarEvent } from "@/server/domains/calendar/handlers/calendar";

export const crudSubRouter = new Hono();

crudSubRouter.get("/:organizationId/read/projects", handleReadProjects);
crudSubRouter.get("/:organizationId/read/projects/stats", handleReadProjectStats);
crudSubRouter.get("/:organizationId/read/projects/options", handleReadProjectOptions);
crudSubRouter.get("/:organizationId/read/projects/index", handleReadProjectsIndex);
crudSubRouter.get("/:organizationId/read/projects/:projectId", handleReadProject);

crudSubRouter.get("/:organizationId/read/opportunities", handleReadOpportunities);
crudSubRouter.get("/:organizationId/read/opportunities/stats", handleReadOpportunityStats);
crudSubRouter.get("/:organizationId/read/opportunities/options", handleReadOpportunityOptions);
crudSubRouter.get("/:organizationId/read/opportunities/:opportunityId", handleReadOpportunity);

crudSubRouter.get("/:organizationId/read/deals", handleReadDeals);
crudSubRouter.get("/:organizationId/read/deals/stats", handleReadDealStats);
crudSubRouter.get("/:organizationId/read/deals/options", handleReadDealOptions);
crudSubRouter.get("/:organizationId/read/deals/:dealId", handleReadDeal);

crudSubRouter.get("/:organizationId/read/tasks", handleReadTasks);
crudSubRouter.get("/:organizationId/read/tasks/stats", handleReadTaskStats);
crudSubRouter.get("/:organizationId/read/tasks/options", handleReadTaskOptions);
crudSubRouter.get("/:organizationId/read/tasks/:taskId", handleReadTask);

crudSubRouter.get("/:organizationId/read/clients", handleReadClients);
crudSubRouter.get("/:organizationId/read/clients/stats", handleReadClientStats);
crudSubRouter.get("/:organizationId/read/clients/options", handleReadClientOptions);
crudSubRouter.get("/:organizationId/read/clients/index", handleReadClientsIndex);

crudSubRouter.get("/:organizationId/read/calendar", handleReadCalendarEvents);
crudSubRouter.get("/:organizationId/read/calendar/stats", handleReadCalendarStats);
crudSubRouter.get("/:organizationId/read/calendar/upcoming", handleReadUpcomingCalendarEvents);
crudSubRouter.get("/:organizationId/read/calendar/index", handleReadCalendarIndex);

crudSubRouter.get("/:organizationId/read/activity", handleReadActivity);
crudSubRouter.get("/:organizationId/read/activity/stats", handleReadActivityStats);
crudSubRouter.get("/:organizationId/read/activity/index", handleReadActivityIndex);

crudSubRouter.get("/:organizationId/read/dashboard", handleReadDashboardOverview);
crudSubRouter.get("/:organizationId/read/dashboard/index", handleReadDashboardIndex);

crudSubRouter.post("/:organizationId/opportunities", handleCreateOpportunity);
crudSubRouter.patch("/:organizationId/opportunities/:opportunityId", handleUpdateOpportunity);
crudSubRouter.delete("/:organizationId/opportunities/:opportunityId", handleDeleteOpportunity);

crudSubRouter.post("/:organizationId/deals", handleCreateDeal);
crudSubRouter.patch("/:organizationId/deals/:dealId", handleUpdateDeal);
crudSubRouter.delete("/:organizationId/deals/:dealId", handleDeleteDeal);

crudSubRouter.post("/:organizationId/projects", handleCreateProject);
crudSubRouter.patch("/:organizationId/projects/:projectId", handleUpdateProject);
crudSubRouter.delete("/:organizationId/projects/:projectId", handleDeleteProject);

crudSubRouter.post("/:organizationId/clients", handleCreateClient);
crudSubRouter.patch("/:organizationId/clients/:clientId", handleUpdateClient);
crudSubRouter.delete("/:organizationId/clients/:clientId", handleDeleteClient);

crudSubRouter.post("/:organizationId/tasks", handleCreateClientTask);
crudSubRouter.patch("/:organizationId/tasks/:taskId", handleUpdateClientTask);
crudSubRouter.delete("/:organizationId/tasks/:taskId", handleDeleteClientTask);

crudSubRouter.post("/:organizationId/client-tasks", handleCreateClientTask);
crudSubRouter.patch("/:organizationId/client-tasks/:taskId", handleUpdateClientTask);
crudSubRouter.delete("/:organizationId/client-tasks/:taskId", handleDeleteClientTask);

crudSubRouter.post("/:organizationId/client-follow-ups", handleCreateFollowUp);
crudSubRouter.patch("/:organizationId/client-follow-ups/:followUpId", handleUpdateFollowUp);
crudSubRouter.delete("/:organizationId/client-follow-ups/:followUpId", handleDeleteFollowUp);
crudSubRouter.patch("/:organizationId/client-follow-ups/:followUpId/complete", handleMarkFollowUpComplete);

crudSubRouter.post("/:organizationId/calendar-events", handleCreateCalendarEvent);
crudSubRouter.patch("/:organizationId/calendar-events/:eventId", handleUpdateCalendarEvent);
crudSubRouter.delete("/:organizationId/calendar-events/:eventId", handleDeleteCalendarEvent);
