import { renderHook, act, waitFor } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { useDataTableState } from "@/shared/hooks/use-data-table-state"
import type { ColumnDef } from "@tanstack/react-table"

interface RowData {
  id: string
  name: string
}

const columns: ColumnDef<RowData>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
]

describe("useDataTableState", () => {
  it("filters rows based on search value", async () => {
    const { result } = renderHook(() =>
      useDataTableState<RowData, string>({
        data: [
          { id: "1", name: "Alpha" },
          { id: "2", name: "Beta" },
        ],
        columns,
        filterColumn: "name",
      })
    )

    act(() => {
      result.current.setSearchValue("Al")
    })

    await waitFor(() => {
      expect(result.current.rows).toHaveLength(1)
      expect(result.current.rows[0]?.original.name).toBe("Alpha")
    })
  })

  it("syncs external search value", () => {
    const { result } = renderHook(() =>
      useDataTableState<RowData, string>({
        data: [{ id: "1", name: "Alpha" }],
        columns,
        filterColumn: "name",
        externalSearchValue: "Beta",
      })
    )

    expect(result.current.searchValue).toBe("Beta")
  })
})
