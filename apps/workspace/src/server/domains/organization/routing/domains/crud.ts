import { Hono } from "hono";
import { handleReadOpportunities, handleReadOpportunity, handleReadOpportunityOptions, handleReadOpportunityStats } from "@/server/domains/opportunities/handlers/opportunities-read";
import { handleReadDeals, handleReadDeal, handleReadDealOptions, handleReadDealStats } from "@/server/domains/deals/handlers/deals-read";
import { handleReadTasks, handleReadTask, handleReadTaskOptions, handleReadTaskStats } from "@/server/domains/clientTasks/handlers/client-tasks-read";
import { handleReadProjects, handleReadProject, handleReadProjectOptions, handleReadProjectStats, handleReadProjectsIndex, handleReadProjectTaskCounts } from "@/server/domains/projects/handlers/projects-read";
import { handleReadClients, handleReadClientOptions, handleReadClientStats, handleReadClientsIndex } from "@/server/domains/clients/handlers/clients-read";
import { handleReadCalendarEvents, handleReadCalendarIndex, handleReadCalendarStats, handleReadUpcomingCalendarEvents } from "@/server/domains/calendar/handlers/calendar-read";
import { handleReadActivity, handleReadActivityIndex, handleReadActivityStats } from "@/server/domains/organization/handlers/activity-read";
import { handleReadDashboardIndex, handleReadDashboardOverview } from "@/server/domains/organization/handlers/dashboard-read";
import { handleCreateProject, handleDeleteProject, handleUpdateProject } from "@/server/domains/projects/handlers/projects";
import { handleCreateSpace, handleDeleteSpace, handleUpdateSpace } from "@/server/domains/spaces/handlers/spaces";
import { handleReadSpaceOptions } from "@/server/domains/spaces/handlers/spaces-read";
import { handleReadSpaces, handleReadSpace } from "@/server/domains/spaces/handlers/spaces-junction";
import { handleCreateOpportunity, handleDeleteOpportunity, handleUpdateOpportunity } from "@/server/domains/opportunities/handlers/opportunities";
import { handleCreateDeal, handleDeleteDeal, handleUpdateDeal } from "@/server/domains/deals/handlers/deals";
import { handleCreateClient, handleDeleteClient, handleUpdateClient } from "@/server/domains/clients/handlers/clients";
import { handleCreateClientTask, handleDeleteClientTask, handleUpdateClientTask } from "@/server/domains/clientTasks/handlers/client-tasks";
import { handleAssignTasksToProject } from "@/server/domains/clientTasks/handlers/assign-to-project";
import { handleCreateFollowUp, handleDeleteFollowUp, handleMarkFollowUpComplete, handleUpdateFollowUp } from "@/server/domains/clientFollowUps/handlers/follow-ups";
import { handleCreateInvoice, handleDeleteInvoice, handleUpdateInvoice } from "@/server/domains/clientInvoices/handlers/invoices";
import { handleCreateCalendarEvent, handleDeleteCalendarEvent, handleUpdateCalendarEvent } from "@/server/domains/calendar/handlers/calendar";
import { handleCreateTheory, handleUpdateTheory, handleDeleteTheory } from "@/server/domains/theories/handlers/theories";
import { handleCreateDoc, handleUpdateDoc, handleDeleteDoc, handleMoveDoc } from "@/server/domains/docs/handlers/docs";
import { handleCreateDocFolder, handleRenameDocFolder, handleDeleteDocFolder } from "@/server/domains/docs/handlers/doc-folders";
import {
  handleAddReaction,
  handleCreateChannel,
  handleCreateThread,
  handleDeleteChannel,
  handleDeleteMessage,
  handlePinMessage,
  handleRemoveReaction,
  handleSendMessage,
  handleUnpinMessage,
  handleUpdateChannel,
  handleUpdateMessage,
} from "@/server/domains/inbox/handlers/inbox";

export const crudSubRouter = new Hono();

crudSubRouter.get("/:organizationId/read/projects", handleReadProjects);
crudSubRouter.get("/:organizationId/read/projects/stats", handleReadProjectStats);
crudSubRouter.get("/:organizationId/read/projects/options", handleReadProjectOptions);
crudSubRouter.get("/:organizationId/read/projects/task-counts", handleReadProjectTaskCounts);
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

crudSubRouter.get("/:organizationId/read/spaces/options", handleReadSpaceOptions);
crudSubRouter.post("/:organizationId/spaces", handleCreateSpace);
crudSubRouter.patch("/:organizationId/spaces/:spaceId", handleUpdateSpace);
crudSubRouter.delete("/:organizationId/spaces/:spaceId", handleDeleteSpace);

// Project-space junction reads (legitimately need project context)
crudSubRouter.get("/:organizationId/read/projects/:projectId/spaces", handleReadSpaces);
crudSubRouter.get("/:organizationId/read/projects/:projectId/spaces/:spaceId", handleReadSpace);

crudSubRouter.post("/:organizationId/clients", handleCreateClient);
crudSubRouter.patch("/:organizationId/clients/:clientId", handleUpdateClient);
crudSubRouter.delete("/:organizationId/clients/:clientId", handleDeleteClient);

crudSubRouter.post("/:organizationId/tasks", handleCreateClientTask);
crudSubRouter.patch("/:organizationId/tasks/:taskId", handleUpdateClientTask);
crudSubRouter.delete("/:organizationId/tasks/:taskId", handleDeleteClientTask);
crudSubRouter.post("/:organizationId/tasks/assign-to-project", handleAssignTasksToProject);

crudSubRouter.post("/:organizationId/client-tasks", handleCreateClientTask);
crudSubRouter.patch("/:organizationId/client-tasks/:taskId", handleUpdateClientTask);
crudSubRouter.delete("/:organizationId/client-tasks/:taskId", handleDeleteClientTask);

crudSubRouter.post("/:organizationId/client-follow-ups", handleCreateFollowUp);
crudSubRouter.patch("/:organizationId/client-follow-ups/:followUpId", handleUpdateFollowUp);
crudSubRouter.delete("/:organizationId/client-follow-ups/:followUpId", handleDeleteFollowUp);
crudSubRouter.patch("/:organizationId/client-follow-ups/:followUpId/complete", handleMarkFollowUpComplete);

crudSubRouter.post("/:organizationId/client-invoices", handleCreateInvoice);
crudSubRouter.patch("/:organizationId/client-invoices/:invoiceId", handleUpdateInvoice);
crudSubRouter.delete("/:organizationId/client-invoices/:invoiceId", handleDeleteInvoice);

crudSubRouter.post("/:organizationId/calendar-events", handleCreateCalendarEvent);
crudSubRouter.patch("/:organizationId/calendar-events/:eventId", handleUpdateCalendarEvent);
crudSubRouter.delete("/:organizationId/calendar-events/:eventId", handleDeleteCalendarEvent);

crudSubRouter.post("/:organizationId/theories", handleCreateTheory);
crudSubRouter.patch("/:organizationId/theories/:theoryId", handleUpdateTheory);
crudSubRouter.delete("/:organizationId/theories/:theoryId", handleDeleteTheory);

crudSubRouter.post("/:organizationId/docs", handleCreateDoc);
crudSubRouter.patch("/:organizationId/docs/:docId", handleUpdateDoc);
crudSubRouter.delete("/:organizationId/docs/:docId", handleDeleteDoc);
crudSubRouter.post("/:organizationId/docs/:docId/move", handleMoveDoc);

crudSubRouter.post("/:organizationId/doc-folders", handleCreateDocFolder);
crudSubRouter.patch("/:organizationId/doc-folders/:folderId", handleRenameDocFolder);
crudSubRouter.delete("/:organizationId/doc-folders/:folderId", handleDeleteDocFolder);

crudSubRouter.post("/:organizationId/inbox/channels", handleCreateChannel);
crudSubRouter.patch("/:organizationId/inbox/channels/:channelId", handleUpdateChannel);
crudSubRouter.delete("/:organizationId/inbox/channels/:channelId", handleDeleteChannel);
crudSubRouter.post("/:organizationId/inbox/channels/:channelId/messages", handleSendMessage);
crudSubRouter.patch("/:organizationId/inbox/channels/:channelId/messages/:messageId", handleUpdateMessage);
crudSubRouter.delete("/:organizationId/inbox/channels/:channelId/messages/:messageId", handleDeleteMessage);
crudSubRouter.post("/:organizationId/inbox/channels/:channelId/messages/:messageId/reactions", handleAddReaction);
crudSubRouter.delete("/:organizationId/inbox/channels/:channelId/messages/:messageId/reactions", handleRemoveReaction);
crudSubRouter.post("/:organizationId/inbox/channels/:channelId/messages/:messageId/pin", handlePinMessage);
crudSubRouter.delete("/:organizationId/inbox/channels/:channelId/pin", handleUnpinMessage);
crudSubRouter.post("/:organizationId/inbox/channels/:channelId/threads", handleCreateThread);
