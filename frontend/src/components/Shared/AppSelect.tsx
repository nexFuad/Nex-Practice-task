"use client";
import type { AppSelectProps } from "@/Types/componentTypes";
export type { AppSelectOption } from "@/Types/componentTypes";

import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

export function AppSelect({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder,
  label,
  name,
  required,
  disabled,
  className = "",
}: AppSelectProps) {
  return (
    <Select.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      name={name}
      required={required}
      disabled={disabled}
    >
      <Select.Trigger
        aria-label={label}
        className={`inline-flex h-9 min-w-36 items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 text-left text-sm font-medium text-slate-700 shadow-sm outline-none transition-colors hover:bg-slate-50 focus-visible:border-slate-400 focus-visible:ring-2 focus-visible:ring-slate-200 data-placeholder:text-slate-400 data-[state=open]:border-slate-400 data-[state=open]:ring-2 data-[state=open]:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60 ${className}`}
      >
        <Select.Value placeholder={placeholder} />
        <Select.Icon className="shrink-0">
          <ChevronDown className="size-4 text-slate-500" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={6}
          className="z-100 max-h-64 min-w-(--radix-select-trigger-width) overflow-hidden rounded-md border border-slate-200 bg-white p-1 shadow-lg"
        >
          <Select.Viewport>
            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="relative flex min-h-9 cursor-pointer select-none items-center rounded-sm py-1.5 pl-3 pr-8 text-sm text-slate-700 outline-none data-disabled:pointer-events-none data-disabled:opacity-40 data-highlighted:bg-slate-100 data-highlighted:text-slate-900 data-[state=checked]:font-medium"
              >
                <Select.ItemText>{option.label}</Select.ItemText>
                <Select.ItemIndicator className="absolute right-2 inline-flex items-center">
                  <Check className="size-4" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
