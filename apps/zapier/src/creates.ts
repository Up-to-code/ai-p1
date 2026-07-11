import type { Bundle, InputField, ZObject } from 'zapier-platform-core';
import { writeResource } from './api.js';

const taskFields: InputField[] = [
  { key: 'title', label: 'Title', type: 'string', required: true },
  { key: 'status', label: 'Status', type: 'string', required: false, default: 'todo' },
  { key: 'priority', label: 'Priority', type: 'string', choices: ['low', 'normal', 'high', 'urgent'], required: false },
  { key: 'description', label: 'Description', type: 'text', required: false },
  { key: 'projectId', label: 'Project', type: 'string', dynamic: 'project_list.id.name', required: false },
  { key: 'dueDate', label: 'Due Date', type: 'datetime', required: false },
];

const updateTaskFields: InputField[] = [
  { key: 'taskId', label: 'Task', type: 'string', dynamic: 'new_or_updated_task.id.title', required: true },
  { key: 'title', label: 'Title', type: 'string', required: false },
  { key: 'status', label: 'Status', type: 'string', required: false },
  { key: 'priority', label: 'Priority', type: 'string', choices: ['low', 'normal', 'high', 'urgent'], required: false },
  { key: 'description', label: 'Description', type: 'text', required: false },
  { key: 'projectId', label: 'Project', type: 'string', dynamic: 'project_list.id.name', required: false },
  { key: 'dueDate', label: 'Due Date', type: 'datetime', required: false },
];

export const createTask = {
  key: 'create_task', noun: 'Task',
  display: { label: 'Create Task', description: 'Creates a task in Qentrah.' },
  operation: { inputFields: taskFields, perform: (z: ZObject, bundle: Bundle) => writeResource(z, bundle, 'tasks', 'POST'), sample: { id: 'task_id', title: 'Follow up' } },
};

export const updateTask = {
  key: 'update_task', noun: 'Task',
  display: { label: 'Update Task', description: 'Updates an existing Qentrah task.' },
  operation: { inputFields: updateTaskFields, perform: (z: ZObject, bundle: Bundle) => writeResource(z, bundle, 'tasks', 'PATCH', String(bundle.inputData.taskId)), sample: { id: 'task_id', status: 'completed' } },
};

export const createClient = {
  key: 'create_client', noun: 'Client',
  display: { label: 'Create Client', description: 'Creates a client in Qentrah.' },
  operation: {
    inputFields: [
      { key: 'name', label: 'Name', required: true },
      { key: 'type', label: 'Type', choices: ['person', 'organization'], default: 'person' },
      { key: 'email', label: 'Email', type: 'string', required: false },
      { key: 'phone', label: 'Phone', type: 'string', required: false },
      { key: 'company', label: 'Company', type: 'string', required: false },
      { key: 'status', label: 'Status', choices: ['new', 'active', 'nurture', 'inactive', 'archived'], default: 'new' },
    ] as InputField[],
    perform: (z: ZObject, bundle: Bundle) => writeResource(z, bundle, 'clients', 'POST'), sample: { id: 'client_id', name: 'Acme' },
  },
};

export const updateClient = {
  key: 'update_client', noun: 'Client',
  display: { label: 'Update Client', description: 'Updates an existing Qentrah client.' },
  operation: {
    inputFields: [
      { key: 'clientId', label: 'Client', dynamic: 'new_or_updated_client.id.name', required: true },
      { key: 'name', label: 'Name', required: false },
      { key: 'email', label: 'Email', required: false },
      { key: 'phone', label: 'Phone', required: false },
      { key: 'status', label: 'Status', choices: ['new', 'active', 'nurture', 'inactive', 'archived'], required: false },
    ] as InputField[],
    perform: (z: ZObject, bundle: Bundle) => writeResource(z, bundle, 'clients', 'PATCH', String(bundle.inputData.clientId)), sample: { id: 'client_id', status: 'active' },
  },
};

const documentFields: InputField[] = [
  { key: 'title', label: 'Title', required: true },
  { key: 'content', label: 'Content', type: 'text', required: false },
  { key: 'visibility', label: 'Visibility', choices: ['private', 'team', 'workspace'], default: 'private' },
  { key: 'projectId', label: 'Project', dynamic: 'project_list.id.name', required: false },
];

const updateDocumentFields: InputField[] = [
  { key: 'docId', label: 'Document', type: 'string', dynamic: 'new_or_updated_document.id.title', required: true },
  { key: 'title', label: 'Title', type: 'string', required: false },
  { key: 'content', label: 'Content', type: 'text', required: false },
  { key: 'visibility', label: 'Visibility', choices: ['private', 'team', 'workspace'], required: false },
  { key: 'projectId', label: 'Project', dynamic: 'project_list.id.name', required: false },
];

export const createDocument = {
  key: 'create_document', noun: 'Document',
  display: { label: 'Create Document', description: 'Creates a document in Qentrah.' },
  operation: { inputFields: documentFields, perform: (z: ZObject, bundle: Bundle) => writeResource(z, bundle, 'documents', 'POST'), sample: { id: 'document_id', title: 'Campaign brief' } },
};

export const updateDocument = {
  key: 'update_document', noun: 'Document',
  display: { label: 'Update Document', description: 'Updates an existing Qentrah document.' },
  operation: { inputFields: updateDocumentFields, perform: (z: ZObject, bundle: Bundle) => writeResource(z, bundle, 'documents', 'PATCH', String(bundle.inputData.docId)), sample: { id: 'document_id', title: 'Updated brief' } },
};
