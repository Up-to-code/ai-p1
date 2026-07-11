import type { Bundle, ZObject } from 'zapier-platform-core';
import { listResource } from './api.js';

function pollingTrigger(key: string, noun: string, resource: string, hidden = false) {
  return {
    key,
    noun,
    display: {
      label: `New or Updated ${noun}`,
      description: `Triggers when a ${noun.toLowerCase()} is created or updated in Qentrah.`,
      hidden,
    },
    operation: {
      perform: (z: ZObject, bundle: Bundle) => listResource(z, bundle, resource),
      sample: { id: 'sample_id', title: `Sample ${noun}`, createdAt: 0, updatedAt: 0 },
    },
  };
}

export const newOrUpdatedTask = pollingTrigger('new_or_updated_task', 'Task', 'tasks');
export const newOrUpdatedClient = pollingTrigger('new_or_updated_client', 'Client', 'clients');
export const newOrUpdatedDocument = pollingTrigger('new_or_updated_document', 'Document', 'documents');
export const projectList = pollingTrigger('project_list', 'Project', 'projects', true);
