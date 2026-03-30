"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { cn } from "@/lib/utils"
import { ChevronDownIcon, CheckIcon, ChevronUpIcon } from "lucide-react"

function Select({ ...props }) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup({ className, ...props }) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("p-2", className)}
      {...props} />
  );
}

function SelectValue({ ...props }) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({ className, children, ...props }) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        // Udaan Premium Styling
        "flex w-full items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-slate-50/50 px-6 text-sm font-semibold text-[#151941] transition-all outline-none select-none hover:bg-white hover:border-[#474f83]/40 focus:ring-4 focus:ring-indigo-500/5 focus:border-[#474f83] disabled:cursor-not-allowed disabled:opacity-50 data-placeholder:text-slate-400 [&_svg]:text-slate-400",
        className
      )}
      {...props}>
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 opacity-50 transition-transform duration-300 group-data-[state=open]:rotate-180" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({ className, children, position = "popper", ...props }) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          // Floating Glass Design
          "relative z-50 max-h-96 min-w-(--radix-select-trigger-width) overflow-hidden rounded-2xl bg-white/95 backdrop-blur-xl text-[#151941] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 data-[side=bottom]:translate-y-2 data-[side=top]:-translate-y-2 animate-in fade-in-0 zoom-in-95",
          className
        )}
        position={position}
        {...props}>
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport className="p-1.5">
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectItem({ className, children, ...props }) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        // Item styling with focus state matching brand color
        "relative flex w-full cursor-pointer items-center rounded-xl py-3.5 pl-4 pr-10 text-sm font-medium outline-none select-none transition-colors focus:bg-[#474f83] focus:text-white data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      {...props}>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <span className="absolute right-4 flex size-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
    </SelectPrimitive.Item>
  );
}

function SelectLabel({ className, ...props }) {
  return (
    <SelectPrimitive.Label
      className={cn("px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]", className)}
      {...props} />
  );
}

function SelectSeparator({ className, ...props }) {
  return (
    <SelectPrimitive.Separator
      className={cn("-mx-1 my-1 h-px bg-slate-100", className)}
      {...props} />
  );
}

function SelectScrollUpButton({ className, ...props }) {
  return (
    <SelectPrimitive.ScrollUpButton
      className={cn("flex cursor-default items-center justify-center py-1", className)}
      {...props}>
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({ className, ...props }) {
  return (
    <SelectPrimitive.ScrollDownButton
      className={cn("flex cursor-default items-center justify-center py-1", className)}
      {...props}>
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}