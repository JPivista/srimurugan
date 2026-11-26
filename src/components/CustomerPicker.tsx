"use client";

import { useState } from "react";

const field =
  "mt-1 w-full rounded-xl border border-line bg-white px-3 py-3 text-base outline-none focus:ring-2 focus:ring-maroon/30";

function RequiredMark() {
  return (
    <span className="text-red-600" aria-hidden="true">
      {" "}
      *
    </span>
  );
}

export function CustomerPicker({
  id,
  name,
  label,
  names,
  defaultValue,
  required = false,
  onValueChange,
}: {
  id: string;
  name: string;
  label: string;
  names: string[];
  defaultValue: string;
  required?: boolean;
  onValueChange?: (value: string) => void;
}) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const query = value.trim().toLowerCase();
  const matches = (query
    ? names.filter((item) => item.toLowerCase().includes(query))
    : names
  ).slice(0, 12);
  const exact = names.some((item) => item.toLowerCase() === query);
  const showList = open && (matches.length > 0 || (query.length > 0 && !exact));

  return (
    <div className="relative">
      <label className="block text-sm font-medium" htmlFor={id}>
        {label}
        {required ? <RequiredMark /> : null}
      </label>
      <input
        id={id}
        name={name}
        required={required}
        value={value}
        autoComplete="off"
        role="combobox"
        aria-expanded={showList}
        aria-autocomplete="list"
        aria-controls={`${id}-list`}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setValue(event.target.value);
          onValueChange?.(event.target.value);
          setOpen(true);
        }}
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 150);
        }}
        className={field}
      />
      {showList ? (
        <ul
          id={`${id}-list`}
          role="listbox"
          className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-line bg-white py-1 shadow-lg"
        >
          {matches.map((item) => (
            <li key={item} role="option" aria-selected={item.toLowerCase() === query}>
              <button
                type="button"
                className="w-full px-3 py-3 text-left text-sm hover:bg-gold/40"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  setValue(item);
                  onValueChange?.(item);
                  setOpen(false);
                }}
              >
                {item}
              </button>
            </li>
          ))}
          {query && !exact ? (
            <li role="option" aria-selected={false}>
              <button
                type="button"
                className="w-full px-3 py-3 text-left text-sm text-ink/70 hover:bg-gold/40"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => setOpen(false)}
              >
                Use “{value.trim()}”
              </button>
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
