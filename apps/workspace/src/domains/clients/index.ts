export { ClientsWorkspace, ClientFormScreen } from "./components/clients-screens";
export { ClientDetailLayout as ClientDetailScreen } from "./components/detail/client-detail-layout";
export { ClientForm } from "./components/client-form";
export { ClientSheet } from "./components/client-sheet";
export {
  useClientsQuery,
  useClientsPagedQuery,
  useClientsIndexQuery,
  useClientStatsQuery,
  useClientOptionsQuery,
  useClientQuery,
  useCreateClientOptimisticMutation,
  useUpdateClientOptimisticMutation,
  useDeleteClientOptimisticMutation,
  useMoveClientInPipelineMutation,
  createClientRequest,
  updateClientRequest,
  deleteClientRequest,
  CLIENTS_PAGE_SIZE,
} from "./api/clients";
export {
  useClientTasksQuery,
  useClientTaskOptionsQuery,
  createClientTaskRequest,
  updateClientTaskRequest,
  deleteClientTaskRequest,
} from "./api/client-tasks";
export * from "./store/clients.types";
export * from "./validation/client.schema";
