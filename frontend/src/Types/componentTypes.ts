import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import type { Site } from "./siteTypes";
import type { DemoUser } from "./userTypes";


export type ErrorDisplayProps = {
  kind: "not-found" | "unexpected";
  onRetry?: () => void;
  reference?: string;
  variant?: "page" | "inline";
  error?: unknown;
};

export type SiteActionsMenuProps = {
  site: Site;
  onView: () => void;
  onEdit: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
  floating?: boolean;
  position?: { top: number; right: number };
};

export type TableColumn<T> = {
  id: string;
  header: ReactNode;
  cell: (row: T, index: number) => ReactNode;
  className?: string;
  headerClassName?: string;
  minWidth?: string;
};

export type TableAction<T> = {
  label: string;
  icon?: LucideIcon;
  onClick: (row: T) => void;
  danger?: boolean;
  hidden?: (row: T) => boolean;
};

export type TableProps<T> = {
  columns: TableColumn<T>[];
  rows: T[];
  getRowId: (row: T, index: number) => string | number;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  page?: number;
  pageSize?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  minHeight?: string;
  tableMinWidth?: string;
  className?: string;
  loading?: boolean;
  skeletonRows?: number;
  actions?: TableAction<T>[];
};

export type LoadingProps = { message?: string; backgroundClassName?: string };

export type PaginationProps = {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export type OMDashboardHeaderProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export type AppSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type AppSelectProps = {
  options: AppSelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  label: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

export type SidebarLink = { label: string; href: string; icon: LucideIcon };

export type UserMenuAction =
  | "View Assigned Sites"
  | "Assign to Sites"
  | "View Schedule"
  | "Bio data"
  | "Reset Password"
  | "Suspend User"
  | "Resign User"
  | "Activate User"
  | "Delete User";

export type UserActionDialogProps = {
  user: DemoUser;
  action: UserMenuAction;
  onClose: () => void;
  onChanged: () => void;
  onDeleted: (databaseId: string) => void;
  onToast?: (message: string) => void;
};
