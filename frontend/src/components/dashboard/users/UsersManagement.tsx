"use client";

import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { UserStats } from "./UserStats";
import { UsersFilters } from "./UsersFilters";
import { UsersPagination } from "./UsersPagination";
import { UsersTable, UsersTableSkeleton } from "./UsersTable";
import type { UserRole, UserStatus } from "./types";
import { users } from "./users.data";
import { getUsers } from "./users.api";
import type { DemoUser } from "./types";

const PAGE_SIZE = 10;
export function UsersManagement() {
  const router = useRouter(); const [query, setQuery] = useState(""); const [role, setRole] = useState<"ALL" | UserRole>("ALL"); const [status, setStatus] = useState<"ALL" | UserStatus>("ALL"); const [page, setPage] = useState(1); const [isPageLoading, setIsPageLoading] = useState(false); const [openMenuId, setOpenMenuId] = useState<string | null>(null); const [databaseUsers, setDatabaseUsers] = useState<DemoUser[]>([]);
  useEffect(() => { getUsers().then(setDatabaseUsers).catch(() => undefined); }, []);
  const allUsers = useMemo(() => [...databaseUsers, ...users.filter((mock) => !databaseUsers.some((saved) => saved.id === mock.id))], [databaseUsers]);
  const filteredUsers = useMemo(() => allUsers.filter((user) => { const search = query.trim().toLowerCase(); return (!search || user.name.toLowerCase().includes(search) || user.id.toLowerCase().includes(search)) && (role === "ALL" || user.role === role) && (status === "ALL" || user.status === status); }), [allUsers, query, role, status]);
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE)); const visibleUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const updateFilters = (fn: () => void) => { fn(); setPage(1); setOpenMenuId(null); };
  const changePage = (next: number) => { if (next === page || next < 1 || next > totalPages) return; setOpenMenuId(null); setIsPageLoading(true); window.setTimeout(() => { setPage(next); setIsPageLoading(false); }, 450); };
  return <section className="p-5 text-slate-800 sm:p-7 lg:p-8"><header className="flex items-start justify-between gap-4"><div><h1 className="text-2xl font-bold">Users Management</h1><p className="mt-1 text-base text-slate-500">Manage guards and operations managers</p></div><button type="button" onClick={() => router.push("/om/users/create-new-employee")} className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-neutral-900 px-4 text-sm text-white"><Plus className="size-4" />Add New User</button></header><UserStats total={filteredUsers.length} activeOfficers={filteredUsers.filter((user) => user.role === "OFFICER" && user.status === "ACTIVE").length} operationManagers={filteredUsers.filter((user) => user.role === "OM").length} /><UsersFilters query={query} role={role} status={status} onQueryChange={(value) => updateFilters(() => setQuery(value))} onRoleChange={(value) => updateFilters(() => setRole(value))} onStatusChange={(value) => updateFilters(() => setStatus(value))} /><section className="mt-7 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:p-3">{isPageLoading ? <UsersTableSkeleton /> : <UsersTable users={visibleUsers} openMenuId={openMenuId} onToggleMenu={(id) => setOpenMenuId((current) => current === id ? null : id)} onCloseMenu={() => setOpenMenuId(null)} />}<UsersPagination page={page} totalPages={totalPages} onPageChange={changePage} /></section></section>;
}
