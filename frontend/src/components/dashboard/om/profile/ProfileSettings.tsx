"use client";

import { ArrowLeft, LockKeyhole, UserRound } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  changePassword,
  getProfile,
  updateProfile,
} from "@/components/auth/auth.api";
import {
  getSignedInUser,
  setSignedInUser,
  type SignedInUser,
} from "@/components/auth/auth.session";
import { ChangePasswordModal } from "./ChangePasswordModal";
import { ProfilePhotoCard } from "./ProfilePhotoCard";

const uploadPhoto = async (file: File) => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !uploadPreset)
    throw new Error(
      "Cloudinary is not configured. Add its cloud name and unsigned upload preset to frontend/.env.local.",
    );
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", uploadPreset);
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: data },
  );
  if (!response.ok) throw new Error("Profile image upload failed.");
  return ((await response.json()) as { secure_url: string }).secure_url;
};
const relativePasswordDate = (value: string) => {
  const days = Math.max(
    0,
    Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000),
  );
  return days === 0
    ? "Last changed today"
    : `Last changed ${days} ${days === 1 ? "day" : "days"} ago`;
};

export function ProfileSettings() {
  const signedIn = getSignedInUser();
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState(signedIn?.fullName ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const profileQuery = useQuery<SignedInUser>({
    queryKey: ["profile", signedIn?.employeeId],
    queryFn: () => getProfile(signedIn!.employeeId),
    enabled: Boolean(signedIn?.employeeId),
    initialData: signedIn ?? undefined,
  });
  const user = profileQuery.data ?? null;
  const saveProfileMutation = useMutation({
    mutationFn: ({
      employeeId,
      values,
    }: {
      employeeId: string;
      values: { fullName: string; profileImageUrl?: string };
    }) => updateProfile(employeeId, values),
    onSuccess: (updated) => {
      setSignedInUser(updated);
      queryClient.setQueryData(["profile", updated.employeeId], updated);
    },
  });
  const passwordMutation = useMutation({
    mutationFn: ({
      employeeId,
      values,
    }: {
      employeeId: string;
      values: {
        currentPassword: string;
        newPassword: string;
        confirmPassword: string;
      };
    }) => changePassword(employeeId, values),
    onSuccess: (updated) => {
      setSignedInUser(updated);
      queryClient.setQueryData(["profile", updated.employeeId], updated);
    },
  });
  const preview = useMemo(
    () => (file ? URL.createObjectURL(file) : (user?.profileImageUrl ?? null)),
    [file, user?.profileImageUrl],
  );
  const saveProfile = async () => {
    if (!user || !fullName.trim()) return;
    setError(null);
    setMessage(null);
    try {
      const profileImageUrl = file
        ? await uploadPhoto(file)
        : user.profileImageUrl;
      await saveProfileMutation.mutateAsync({
        employeeId: user.employeeId,
        values: { fullName, profileImageUrl: profileImageUrl ?? undefined },
      });
      setFile(null);
      setMessage("Profile changes saved successfully.");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to save profile.",
      );
    }
  };
  const savePassword = async (values: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    if (!user) return;
    try {
      await passwordMutation.mutateAsync({
        employeeId: user.employeeId,
        values,
      });
      setModalOpen(false);
      setMessage("Password changed successfully.");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to change password.",
      );
    }
  };
  if (!user)
    return (
      <section className="p-8 text-sm text-slate-500">
        Loading profile...
      </section>
    );
  const saving = saveProfileMutation.isPending || passwordMutation.isPending;
  return (
    <section className="min-h-screen p-5 sm:p-8">
      <Link
        href="/om/dashboard"
        className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        <ArrowLeft className="size-5" />
        Back to Home
      </Link>
      <div className="mx-auto mt-8 grid max-w-7xl gap-8 lg:grid-cols-[28rem_1fr]">
        <ProfilePhotoCard
          fullName={fullName}
          imageUrl={preview}
          onFileChange={setFile}
        />
        <div className="space-y-8">
          <section className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-1 flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-blue-100 text-blue-600">
                <UserRound className="size-5" />
              </span>
              <h1 className="text-lg font-semibold text-slate-900">
                Profile Information
              </h1>
            </div>
            <div className="space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-900">
                  Full Name
                </span>
                <input
                  value={fullName}
                  placeholder="Enter your full name"
                  onChange={(event) => setFullName(event.target.value)}
                  className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-900">
                  Email Address
                </span>
                <input
                  value={user.email ?? "Not provided"}
                  disabled
                  readOnly
                  placeholder="Email address"
                  className="h-12 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-4 text-sm text-slate-700"
                />
                <span className="mt-2 block text-xs text-slate-500">
                  Email address is managed by administrators
                </span>
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-900">
                  Company
                </span>
                <input
                  value={user.company}
                  disabled
                  readOnly
                  placeholder="Company name"
                  className="h-12 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-4 text-sm text-slate-700"
                />
                <span className="mt-2 block text-xs text-slate-500">
                  Company name is managed at the tenant level
                </span>
              </label>
            </div>
          </section>
          <section className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <LockKeyhole className="size-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-900">Security</h2>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50 p-4">
              <div className="flex items-center gap-3">
                <LockKeyhole className="size-5 text-blue-600" />
                <div>
                  <p className="font-medium text-slate-900">Password</p>
                  <p className="text-sm text-slate-500">
                    {relativePasswordDate(user.passwordChangedAt)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(true)}
                className="h-9 rounded-md border border-blue-200 bg-transparent px-4 text-sm font-medium text-blue-600 shadow-sm transition hover:cursor-pointer hover:bg-blue-100"
              >
                Change
              </button>
            </div>
          </section>
        </div>
      </div>
      {error && (
        <p className="fixed right-5 top-5 z-50 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 shadow-lg">
          {error}
        </p>
      )}
      {message && (
        <p className="fixed right-5 top-5 z-50 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-lg">
          {message}
        </p>
      )}
      <footer className="mx-auto mt-10 flex max-w-7xl justify-end gap-3">
        <button
          type="button"
          onClick={() => {
            setFullName(user.fullName);
            setFile(null);
          }}
          className="h-11 rounded-xl border border-slate-200 px-7 text-sm font-medium hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          disabled={saving || !fullName.trim()}
          type="button"
          onClick={() => void saveProfile()}
          className="h-11 rounded-xl bg-blue-600 px-7 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </footer>
      {modalOpen && (
        <ChangePasswordModal
          saving={saving}
          onClose={() => setModalOpen(false)}
          onSave={savePassword}
        />
      )}
    </section>
  );
}
