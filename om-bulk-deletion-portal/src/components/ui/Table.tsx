import type { ReactNode } from "react";

type Column<T> = {
  key: keyof T | string;
  header: string;
  render?: (row: T) => ReactNode;
};

type TableProps<T> = {
  columns: Column<T>[];
  data: T[];
};

export function Table<T extends Record<string, unknown>>({
  columns,
  data,
}: TableProps<T>) {
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-zinc-200 text-left dark:border-zinc-800">
          {columns.map((col) => (
            <th key={String(col.key)} className="px-4 py-2 font-medium">
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr
            key={idx}
            className="border-b border-zinc-100 dark:border-zinc-900"
          >
            {columns.map((col) => (
              <td key={String(col.key)} className="px-4 py-2">
                {col.render ? col.render(row) : String(row[col.key as keyof T] ?? "")}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
