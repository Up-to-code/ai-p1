export { DealsWorkspace, DealDetailScreen } from "./components/deals-screen";
export {
  useDealsQuery,
  useDealStatsQuery,
  useDealQuery,
  createDealRequest,
  updateDealRequest,
  deleteDealRequest,
} from "./api/deals";
export type { Deal } from "./store/deals.types";
