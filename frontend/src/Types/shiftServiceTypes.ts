import type { Shift } from "./shiftTypes";

export type PaginatedShifts = {
  items: Shift[];
  page: number;
  pageSize: number;
  total: number;
  stats: {
    total: number;
    active: number;
    inactive: number;
    assignedSites: number;
  };
};
