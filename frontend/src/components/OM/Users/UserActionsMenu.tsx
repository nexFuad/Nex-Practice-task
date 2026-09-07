"use client";

import {
  ClipboardList,
  Edit3,
  EllipsisVertical,
  KeyRound,
  MapPin,
  Trash2,
  UserRoundCheck,
  UserRoundX,
  Waypoints,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

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

const items: readonly [typeof Edit3, UserMenuAction][] = [
  [MapPin, "View Assigned Sites"],
  [Waypoints, "Assign to Sites"],
  [ClipboardList, "Bio data"],
  [UserRoundX, "Suspend User"],
  [KeyRound, "Resign User"],
] as const;
export function UserActionsMenu({
  open,
  onToggle,
  onClose,
  userId,
  onAction,
  onDelete,
  userStatus,
}: {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  userId: string;
  onAction: (action: UserMenuAction) => void;
  onDelete: () => Promise<void> | void;
  userStatus: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "RESIGNED";
}) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
    maxHeight: 0,
  });
  const editUrl = `/om/users/edit-employee/${encodeURIComponent(userId)}`;
  const bioDataUrl = `/om/users/bio-data/${encodeURIComponent(userId)}`;

  useEffect(() => {
    if (!open || !triggerRef.current) return;

    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const menuWidth = 240;
      const viewportPadding = 8;
      const gap = 4;
      const naturalMenuHeight = menuRef.current?.scrollHeight ?? 390;
      const spaceBelow = window.innerHeight - rect.bottom - viewportPadding;
      const spaceAbove = rect.top - viewportPadding;
      const openUpward =
        spaceBelow < naturalMenuHeight && spaceAbove > spaceBelow;
      const availableHeight = Math.max(
        120,
        openUpward ? spaceAbove : spaceBelow,
      );
      const menuHeight = Math.min(naturalMenuHeight, availableHeight);

      setMenuPosition({
        top: openUpward
          ? Math.max(viewportPadding, rect.top - menuHeight - gap)
          : Math.min(
              rect.bottom + gap,
              window.innerHeight - menuHeight - viewportPadding,
            ),
        left: Math.max(
          viewportPadding,
          Math.min(
            rect.right - menuWidth,
            window.innerWidth - menuWidth - viewportPadding,
          ),
        ),
        maxHeight: availableHeight,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !rootRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [onClose]);

  const menu = open ? (
    <div
      ref={menuRef}
      className="fixed z-100 w-60 overflow-x-hidden overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 text-sm shadow-xl"
      style={{
        top: menuPosition.top,
        left: menuPosition.left,
        maxHeight: menuPosition.maxHeight || undefined,
      }}
      role="menu"
      aria-label="User actions"
      onMouseDown={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onClose();
          router.push(editUrl);
        }}
        className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-xs text-slate-700 hover:bg-slate-50"
      >
        <Edit3 className="size-4 text-slate-500" />
        Edit User
      </button>
      {items.map(([Icon, label]) => {
        if (
          (label === "Resign User" &&
            (userStatus === "RESIGNED" || userStatus === "SUSPENDED")) ||
          (label === "Suspend User" && userStatus === "SUSPENDED")
        )
          return null;
        if (label === "Bio data") {
          return (
            <button
              key={label}
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onClose();
                router.push(bioDataUrl);
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-xs text-slate-700 hover:bg-slate-50"
            >
              <Icon className="size-4 text-slate-500" />
              {label}
            </button>
          );
        }

        return (
          <button
            key={label}
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onAction(label);
              onClose();
            }}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-xs text-slate-700 hover:bg-slate-50"
          >
            <Icon className="size-4 text-slate-500" />
            {label}
          </button>
        );
      })}
      {(userStatus === "RESIGNED" || userStatus === "SUSPENDED") && (
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onAction("Activate User");
            onClose();
          }}
          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-xs text-emerald-700 hover:bg-emerald-50"
        >
          <UserRoundCheck className="size-4" />
          Activate User
        </button>
      )}
      <div className="my-1 border-t border-slate-200" />
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onClose();
          void onDelete();
        }}
        className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-red-600 hover:bg-red-50"
      >
        <Trash2 className="size-4" />
        Delete User
      </button>
    </div>
  ) : null;

  return (
    <div ref={rootRef} className="relative inline-flex">
      <button
        ref={triggerRef}
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onToggle();
        }}
        className="inline-flex size-9 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100"
        aria-label="User actions"
        aria-expanded={open}
      >
        <EllipsisVertical className="size-4" />
      </button>
      {typeof document !== "undefined" && menu
        ? createPortal(menu, document.body)
        : null}
    </div>
  );
}
