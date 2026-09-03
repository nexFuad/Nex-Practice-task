"use client";

import { useDeferredValue, useState } from "react";
import { Plus } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Toast } from "../sites/Toast";
import { UserActionDialog } from "./UserActionDialog";
import type { UserMenuAction } from "./UserActionsMenu";
import { UsersFilters } from "./UsersFilters";
import { UsersPagination } from "./UsersPagination";
import { UserStats } from "./UserStats";
import { UsersTable, UsersTableSkeleton } from "./UsersTable";
import { deleteUser, getUsers, type PaginatedUsers } from "./users.api";
import type { DemoUser, UserRole, UserStatus } from "./types";

const PAGE_SIZE = 10;

export function UsersManagement() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<"ALL" | UserRole>("ALL");
  const [status, setStatus] = useState<"ALL" | UserStatus>("ALL");
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<{
    user: DemoUser;
    action: UserMenuAction;
  } | null>(null);
  const [toast, setToast] = useState("");
  const deferredQuery = useDeferredValue(query);

  const usersQuery = useQuery<PaginatedUsers>({
    queryKey: [
      "users",
      { query: deferredQuery, role, status, page, pageSize: PAGE_SIZE },
    ],
    queryFn: () =>
      getUsers({
        query: deferredQuery,
        role,
        status,
        page,
        pageSize: PAGE_SIZE,
      }),
    placeholderData: (previous) => previous,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const users = usersQuery.data?.items ?? [];
  const totalPages = Math.max(
    1,
    Math.ceil((usersQuery.data?.total ?? 0) / PAGE_SIZE),
  );
  const safePage = Math.min(page, totalPages);

  const updateFilters = (update: () => void) => {
    update();
    setPage(1);
    setOpenMenuId(null);
  };

  const changePage = (nextPage: number) => {
    if (nextPage === page || nextPage < 1 || nextPage > totalPages) return;
    setOpenMenuId(null);
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

        <UserStats
          total={usersQuery.data?.stats.total ?? 0}
          activeOfficers={usersQuery.data?.stats.activeOfficers ?? 0}
          operationManagers={usersQuery.data?.stats.operationManagers ?? 0}
        />

        <UsersFilters
          query={query}
          role={role}
          status={status}
          onQueryChange={(value) => updateFilters(() => setQuery(value))}
          onRoleChange={(value) => updateFilters(() => setRole(value))}
          onStatusChange={(value) => updateFilters(() => setStatus(value))}
        />

        <section className="flex min-h-[640px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white py-6 shadow-sm">
          {usersQuery.isLoading ||
          (usersQuery.isFetching && !usersQuery.data) ? (
            <div className="flex-1">
              <UsersTableSkeleton />
            </div>
          ) : (
            <div className="flex-1">
              <UsersTable
                users={users}
                openMenuId={openMenuId}
                onToggleMenu={(id) =>
                  setOpenMenuId((current) => (current === id ? null : id))
                }
                onCloseMenu={() => setOpenMenuId(null)}
                onAction={(user, action) => setActiveAction({ user, action })}
                onDeleteUser={deleteUserFromMenu}
              />
            </div>
          )}

          <UsersPagination
            page={safePage}
            totalPages={totalPages}
            onPageChange={changePage}
          />
        </section>
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
