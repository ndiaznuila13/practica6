"use client";

import { confirmarReserva } from "@/app/actions/reservas";
import { useState } from "react";

export function BotonConfirmarReserva({
    id,
    estadoActual,
}: {
    id: number;
    estadoActual: string;
}) {
    const [error, setError] = useState<string | null>(null);

    // Solo aparece si la reserva está pendiente
    if (estadoActual !== "pendiente") return null;

    async function manejarClick() {
        const resultado = await confirmarReserva(id);
        if (!resultado.exito) {
            setError(resultado.mensaje ?? "Error desconocido.");
        }
    }

    return (
        <div className="text-right">
            <button
                onClick={manejarClick}
                className="text-sm text-green-600 hover:text-green-800 transition-colors"
            >
                Confirmar
            </button>
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        </div>
    );
}

// *************** AHORA SE AGREGA EL BOTÓN CONFIRMAR EN /reservas/page.tsx ****************