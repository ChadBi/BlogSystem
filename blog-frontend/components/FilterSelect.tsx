'use client';

import * as Select from '@radix-ui/react-select';
import { useId, useState } from 'react';

type Props = {
  label: string;
  name?: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  hideLabel?: boolean;
};

export function FilterSelect({ label, name, options, defaultValue, value, onChange, hideLabel }: Props) {
  const id = useId();
  const [localValue, setLocalValue] = useState(defaultValue ?? options[0]?.value);
  const selected = options.find((option) => option.value === (value ?? localValue)) ?? options[0];

  function choose(next: string) {
    setLocalValue(next);
    onChange?.(next);
  }

  const trigger = 'flex w-full min-w-0 items-center justify-between gap-2 rounded-xl border border-[var(--line-soft)] bg-[var(--surface)] px-3 py-2.5 text-left text-sm font-semibold hover:border-accent focus-visible:ring-2 focus-visible:ring-accent';
  return (
    <div className="min-w-0">
      <label htmlFor={id} className={hideLabel ? 'sr-only' : 'mb-2 block text-sm font-bold'}>{label}</label>
      <Select.Root value={`option:${selected.value}`} onValueChange={(key) => choose(key.slice('option:'.length))}>
        <Select.Trigger id={id} className={`filter-trigger ${trigger}`}>
          <Select.Value>{selected.label}</Select.Value>
          <Select.Icon asChild>
            <svg aria-hidden="true" width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content position="popper" sideOffset={6} collisionPadding={12} className="z-50 max-h-[var(--radix-select-content-available-height)] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-2xl border border-[var(--line-soft)] bg-[var(--surface)] shadow-soft">
            <Select.Viewport className="max-h-72 p-1.5">
              {options.map((option) => (
                <Select.Item key={option.value} value={`option:${option.value}`} className="relative cursor-pointer select-none rounded-xl py-2.5 pl-3 pr-8 text-sm outline-none data-[state=checked]:font-bold data-[highlighted]:bg-[var(--bg-soft)] data-[highlighted]:text-[var(--accent)]">
                  <Select.ItemText>{option.label}</Select.ItemText>
                  <Select.ItemIndicator className="absolute right-3 text-[var(--accent)]">✓</Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
      {name && (
        <select aria-label={label} name={name} value={selected.value} onChange={(event) => choose(event.target.value)} className={`filter-native ${trigger}`}>
          {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      )}
    </div>
  );
}
