"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  Ban,
  Eye,
  FileText,
  LoaderCircle,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserMinus,
  UserPlus,
  UserCheck,
  UserRoundCheck,
  Users,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Toast } from "../../../components/OM/Site/Toast";
import { UserActionDialog } from "../../../components/OM/Users/UserActionDialog";
import type { UserMenuAction } from "../../../components/OM/Users/UserActionsMenu";
import {
  deleteUser,
  getUserFilterOptions,
  getUsers,
  type PaginatedUsers,
} from "@/Services/user";
import type { DemoUser } from "@/Types/userTypes";
import { useSearchBar } from "@/Hooks/useSearchBar";
import { ErrorDisplay } from "@/components/error/ErrorDisplay";
import {
  Table,
  type TableAction,
  type TableColumn,
} from "@/components/Shared/Table";

const PAGE_SIZE = 10;
const userStatCards = [
  ["Total Users", "All registered users", Users, "text-blue-600", ""],
  [
    "Active Officers",
    "Currently active",
    ShieldCheck,
    "text-emerald-600",
    "↑ 12%",
  ],
  ["Operations Managers", "OM accounts", UserCheck, "text-slate-600", ""],
  ["On Duty Now", "Currently working", Activity, "text-amber-500", ""],
] as const;

export default function UsersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { query, debouncedQuery, setQuery } = useSearchBar();
  const [role, setRole] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [activeAction, setActiveAction] = useState<{
    user: DemoUser;
    action: UserMenuAction;
  } | null>(null);
  const [toast, setToast] = useState("");

  const usersQuery = useQuery<PaginatedUsers>({
    queryKey: [
      "users",
      { query: debouncedQuery, role, status, page, pageSize: PAGE_SIZE },
    ],
    queryFn: () =>
      getUsers({
        query: debouncedQuery,
        role,
        status,
        page,
        pageSize: PAGE_SIZE,
      }),
    placeholderData: (previous) => previous,
  });
  const filterOptionsQuery = useQuery({
    queryKey: ["users", "filter-options"],
    queryFn: getUserFilterOptions,
    staleTime: 5 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const users = usersQuery.data?.items ?? [];
  const totalPages = Math.max(
    1,
    Math.ceil((usersQuery.data?.total ?? 0) / PAGE_SIZE),
  );
  const safePage = Math.min(page, totalPages);
  const userStatValues = [
    usersQuery.data?.stats.total ?? 0,
    usersQuery.data?.stats.activeOfficers ?? 0,
    usersQuery.data?.stats.operationManagers ?? 0,
    1,
  ];

  const updateFilters = (update: () => void) => {
    update();
    setPage(1);
  };

  const changePage = (nextPage: number) => {
    if (nextPage === page || nextPage < 1 || nextPage > totalPages) return;
    setPage(nextPage);
  };

  const deleteUserFromMenu = async (user: DemoUser) => {
    try {
      await deleteMutation.mutateAsync(user.databaseId);
      setToast(`${user.name} was deleted successfully.`);
    } catch (cause) {
      window.alert(
        cause instanceof Error ? cause.message : "Unable to delete user.",
      );
    }
  };

  const columns = useMemo<TableColumn<DemoUser>[]>(
    () => [
      {
        id: "user",
        header: "User ↕",
        minWidth: "280px",
        cell: (user) => (
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-blue-100 text-sm text-blue-700">
              {user.name[0]}
            </span>
            <div>
              <p className="font-semibold text-slate-900">{user.name}</p>
              <p className="text-sm text-slate-500">ID: {user.id}</p>
            </div>
          </div>
        ),
      },
      {
        id: "contact",
        header: "Contact",
        minWidth: "240px",
        cell: (user) => (
          <div className="space-y-1 text-sm text-slate-600">
            <p className="flex items-center gap-2">
              <Mail className="size-3" />
              {user.email || "-"}
            </p>
            <p className="flex items-center gap-2">
              <Phone className="size-3" />
              {user.phone}
            </p>
          </div>
        ),
      },
      {
        id: "role",
        header: "Role ↕",
        minWidth: "130px",
        cell: (user) => (
          <span
            className={
              user.role === "OM"
                ? "inline-flex rounded-md border border-purple-200 bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700"
                : user.role === "OFFICER"
                  ? "inline-flex rounded-md border border-blue-200 bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700"
                  : "inline-flex rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
            }
          >
            {user.role}
          </span>
        ),
      },
      {
        id: "site",
        header: "Assigned Site",
        minWidth: "220px",
        cell: (user) => (
          <span className="flex items-center gap-2 text-slate-600">
            <MapPin className="size-3 shrink-0" />
            {user.assignedSite
              ? `${user.assignedSite}${user.additionalSites ? " (+1 more)" : ""}`
              : "Unassigned"}
          </span>
        ),
      },
      {
        id: "status",
        header: "Status ↕",
        minWidth: "130px",
        cell: (user) => (
          <span
            className={
              user.status === "ACTIVE"
                ? "inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
                : user.status === "SUSPENDED"
                  ? "inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800"
                  : "inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
            }
          >
            <UserRoundCheck className="size-3" />
            {user.status}
          </span>
        ),
      },
    ],
    [],
  );
  const actions: TableAction<DemoUser>[] = [
    {
      label: "Edit User",
      icon: Pencil,
      onClick: (user) =>
        router.push(
          `/om/users/${encodeURIComponent(user.databaseId)}`,
        ),
    },
    {
      label: "View Assigned Sites",
      icon: Eye,
      onClick: (user) =>
        setActiveAction({ user, action: "View Assigned Sites" }),
    },
    {
      label: "Assign to Sites",
      icon: MapPin,
      onClick: (user) => setActiveAction({ user, action: "Assign to Sites" }),
    },
    {
      label: "Bio data",
      icon: FileText,
      onClick: (user) =>
        router.push(
          `/om/users/bio-data/${encodeURIComponent(user.databaseId)}`,
        ),
    },
    {
      label: "Suspend User",
      icon: Ban,
      onClick: (user) => setActiveAction({ user, action: "Suspend User" }),
      hidden: (user) =>
        user.status === "SUSPENDED" || user.status === "RESIGNED",
    },
    {
      label: "Resign User",
      icon: UserMinus,
      onClick: (user) => setActiveAction({ user, action: "Resign User" }),
      hidden: (user) =>
        user.status === "SUSPENDED" || user.status === "RESIGNED",
    },
    {
      label: "Activate User",
      icon: UserPlus,
      onClick: (user) => setActiveAction({ user, action: "Activate User" }),
      hidden: (user) =>
        user.status !== "SUSPENDED" && user.status !== "RESIGNED",
    },
    {
      label: "Delete User",
      icon: Trash2,
      danger: true,
      onClick: (user) => void deleteUserFromMenu(user),
    },
  ];
  return (
    <section className="min-w-0 px-5 pb-5 pt-2 text-slate-800">
      <div className="space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">
              Users Management
            </h1>
            <p className="text-sm text-slate-500">
              Manage guards and operations managers
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/om/users/create-new-employee")}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-neutral-900 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800 sm:h-9 sm:self-auto"
          >
            <Plus className="size-4" />
            Add New User
          </button>
        </header>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {userStatCards.map(
            ([title, caption, Icon, iconClass, trend], index) => (
              <article
                key={title}
                className="flex h-full flex-col gap-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-lg 2xl:p-6"
              >
                <div className="flex h-full items-start justify-between">
                  <div className="flex flex-1 flex-col">
                    <p className="text-sm font-medium text-slate-600">{title}</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      {userStatValues[index]}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">{caption}</p>
                    <div className="mt-2 h-5">
                      {trend && (
                        <p className="text-sm text-emerald-600">
                          {trend}{" "}
                          <span className="ml-2 text-slate-500">
                            from last week
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`grid size-12 place-items-center rounded-lg bg-blue-100 ${iconClass}`}
                  >
                    <Icon className="size-6" />
                  </span>
                </div>
              </article>
            ),
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <label className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) =>
                  updateFilters(() => setQuery(event.target.value))
                }
                placeholder="Search users by name, or ID..."
                className="h-10 w-full rounded-md border border-slate-200 bg-white py-1 pl-10 pr-3 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
            <div className="grid grid-cols-2 gap-3 sm:contents">
              <select
                value={role}
                disabled={filterOptionsQuery.isLoading}
                onChange={(event) =>
                  updateFilters(() => setRole(event.target.value))
                }
                className="h-10 min-w-0 w-full rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm outline-none disabled:cursor-wait disabled:bg-slate-50 sm:w-37.5"
              >
                <option value="ALL">
                  {filterOptionsQuery.isLoading ? "Loading roles…" : "All Roles"}
                </option>
                {(filterOptionsQuery.data?.roles ?? []).map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <select
                value={status}
                disabled={filterOptionsQuery.isLoading}
                onChange={(event) =>
                  updateFilters(() => setStatus(event.target.value))
                }
                className="h-10 min-w-0 w-full rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm outline-none disabled:cursor-wait disabled:bg-slate-50 sm:w-37.5"
              >
                <option value="ALL">
                  {filterOptionsQuery.isLoading
                    ? "Loading status…"
                    : "All Status"}
                </option>
                {(filterOptionsQuery.data?.statuses ?? []).map((item) => (
                  <option key={item} value={item}>
                    {item.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
              {filterOptionsQuery.isLoading && (
                <LoaderCircle
                  className="size-4 animate-spin self-center text-slate-400"
                  aria-label="Loading filter options"
                />
              )}
            </div>
          </div>
        </section>
        {usersQuery.error && !usersQuery.data ? (
          <ErrorDisplay
            kind="unexpected"
            variant="inline"
            error={usersQuery.error}
            onRetry={() => void usersQuery.refetch()}
          />
        ) : (
        <Table
          columns={columns}
          rows={users}
          getRowId={(user) => user.databaseId}
          actions={actions}
          loading={usersQuery.isLoading || usersQuery.isFetching}
          page={safePage}
          pageSize={PAGE_SIZE}
          totalItems={usersQuery.data?.total ?? 0}
          onPageChange={changePage}
          emptyMessage="No users found."
        />
        )}
      </div>

      {activeAction && (
        <UserActionDialog
          user={activeAction.user}
          action={activeAction.action}
          onClose={() => setActiveAction(null)}
          onChanged={() =>
            void queryClient.invalidateQueries({ queryKey: ["users"] })
          }
          onToast={setToast}
          onDeleted={() =>
            void queryClient.invalidateQueries({ queryKey: ["users"] })
          }
        />
      )}
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
    </section>
  );
}
