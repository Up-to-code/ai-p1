import zapier, { defineApp } from 'zapier-platform-core';

import packageJson from '../package.json' with { type: 'json' };

import authentication from './authentication.js';
import { befores, afters } from './middleware.js';
import { newOrUpdatedClient, newOrUpdatedDocument, newOrUpdatedTask, projectList } from './triggers.js';
import { createClient, createDocument, createTask, updateClient, updateDocument, updateTask } from './creates.js';

export default defineApp({
  version: packageJson.version,
  platformVersion: zapier.version,
  flags: { cleanInputData: false },

  authentication,
  beforeRequest: [...befores],
  afterResponse: [...afters],

  // Add your triggers here for them to show up!
  triggers: {
    [newOrUpdatedTask.key]: newOrUpdatedTask,
    [newOrUpdatedClient.key]: newOrUpdatedClient,
    [newOrUpdatedDocument.key]: newOrUpdatedDocument,
    [projectList.key]: projectList,
  },

  // Add your creates here for them to show up!
  creates: {
    [createTask.key]: createTask,
    [updateTask.key]: updateTask,
    [createClient.key]: createClient,
    [updateClient.key]: updateClient,
    [createDocument.key]: createDocument,
    [updateDocument.key]: updateDocument,
  },
});
