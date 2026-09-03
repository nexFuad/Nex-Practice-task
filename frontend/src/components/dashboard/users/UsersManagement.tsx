"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { UserStats } from "./UserStats";
import { UsersFilters } from "./UsersFilters";
import { UsersPagination } from "./UsersPagination";
import { UsersTable, UsersTableSkeleton } from "./UsersTable";
import { UserActionDialog } from "./UserActionDialog";
import { Toast } from "../sites/Toast";
import type { UserMenuAction } from "./UserActionsMenu";
import type { UserRole, UserStatus } from "./types";
import { deleteUser, getUsers } from "./users.api";
import type { DemoUser } from "./types";

const PAGE_SIZE = 10;
export function UsersManagement() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<"ALL" | UserRole>("ALL");
  const [status, setStatus] = useState<"ALL" | UserStatus>("ALL");
  const [page, setPage] = useState(1);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<{ user: DemoUser; action: UserMenuAction } | null>(null);
  const [toast, setToast] = useState("");
  const queryClient = useQueryClient();
  const { data: databaseUsers = [] } = useQuery<DemoUser[]>({ queryKey: ["users"], queryFn: getUsers });
  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
  const allUsers = databaseUsers;
  const filteredUsers = useMemo(
    () =>
      allUsers.filter((user) => {
        const search = query.trim().toLowerCase();
        return (
          (!search ||
            user.name.toLowerCase().includes(search) ||
            user.id.toLowerCase().includes(search)) &&
          (role === "ALL" || user.role === role) &&
          (status === "ALL" || user.status === status)
        );
      }),
    [allUsers, query, role, status],
  );
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const visibleUsers = filteredUsers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );
  const updateFilters = (fn: () => void) => {
    fn();
    setPage(1);
    setOpenMenuId(null);
  };
  const changePage = (next: number) => {
    if (next === page || next < 1 || next > totalPages) return;
    setOpenMenuId(null);
    setIsPageLoading(true);
    window.setTimeout(() => {
      setPage(next);
      setIsPageLoading(false);
    }, 450);
  };
  const deleteUserFromMenu = async (user: DemoUser) => {
    try {
      await deleteMutation.mutateAsync(user.databaseId);
      setToast(`${user.name} was deleted successfully.`);
    } catch (cause) {
      console.error("Unable to delete user:", cause);
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
          <h1 className="text-2xl font-semibold text-slate-800">Users Management</h1>
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
        total={filteredUsers.length}
        activeOfficers={
          filteredUsers.filter(
            (user) => user.role === "OFFICER" && user.status === "ACTIVE",
          ).length
        }
        operationManagers={
          filteredUsers.filter((user) => user.role === "OM").length
        }
      />
      <UsersFilters
        query={query}
        role={role}
        status={status}
        onQueryChange={(value) => updateFilters(() => setQuery(value))}
        onRoleChange={(value) => updateFilters(() => setRole(value))}
        onStatusChange={(value) => updateFilters(() => setStatus(value))}
      />
      <section className="flex min-h-160 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white py-6 shadow-sm">
        {isPageLoading ? (
          <UsersTableSkeleton />
        ) : (
          <UsersTable
            users={visibleUsers}
            openMenuId={openMenuId}
            onToggleMenu={(id) =>
              setOpenMenuId((current) => (current === id ? null : id))
            }
            onCloseMenu={() => setOpenMenuId(null)}
            onAction={(user, action) => setActiveAction({ user, action })}
            onDeleteUser={deleteUserFromMenu}
          />
        )}
      <UsersPagination
          page={page}
          totalPages={totalPages}
          onPageChange={changePage}
      />
      </section>
      </div>
      {activeAction && <UserActionDialog user={activeAction.user} action={activeAction.action} onClose={() => setActiveAction(null)} onChanged={() => void queryClient.invalidateQueries({ queryKey: ["users"] })} onToast={setToast} onDeleted={() => void queryClient.invalidateQueries({ queryKey: ["users"] })} />}
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
    </section>
  );
}
