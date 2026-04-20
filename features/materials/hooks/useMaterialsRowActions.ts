"use client"

import { updateMaterial, deleteMaterial } from "@/app/actions/materials"
import { MaterialRow } from "@/shared/types/domain/material-row"

export function useMaterialsRowActions() {
    const handleRowUpdate = (id: string, data: Partial<MaterialRow>) => {
        return updateMaterial(id, {
            ...data,
            price: data.price ? Number(data.price) : undefined,
        })
    }

    const handleRowDelete = (id: string) => {
        return deleteMaterial(id)
    }

    return {
        handleRowUpdate,
        handleRowDelete,
    }
}
