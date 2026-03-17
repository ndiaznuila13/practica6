"use client";

import { useState } from "react";
import { eliminarReserva } from "@/app/actions/reservas";
import { botonPeligro } from "@/lib/estilos";

export function BotonEliminarReserva({ id }: { id: number }) {
    const [error, setError] = useState<string | null>(null);

    async function manejarClick() {
        const resultado = await eliminarReserva(id);
        if (!resultado.exito) {
            setError(resultado.mensaje ?? "Error desconocido.");
        }
    }

    return (
        <div className="text-right">
            <button onClick={manejarClick} className={botonPeligro}>
                Eliminar
            </button>
            {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        </div>
    );
}
