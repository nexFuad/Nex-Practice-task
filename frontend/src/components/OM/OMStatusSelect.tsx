"use client";

import { AppSelect } from "@/components/Shared/AppSelect";

const statuses = [
  { value: "ALL", label: "All Status" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

export function OMStatusSelect({
  value,
  onChange,
  label,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  className?: string;
}) {
  return (
    <AppSelect
      value={value}
      onValueChange={onChange}
      label={label}
      options={statuses}
      className={className}
    />
  );
}
