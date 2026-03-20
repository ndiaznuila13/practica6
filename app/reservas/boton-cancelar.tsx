// *************** EJERCICIO 2: BOTON CANCELAR ****************
"use client";
import { cancelarReserva } from "@/app/actions/reservas";
import { useState } from "react";

export function BotonCancelarReserva({
    id,
    estadoActual,
}: {
    id: number;
    estadoActual: string;
}) {
    const [error, setError] = useState<string | null>(null);

    // Si ya está cancelada, no mostramos el botón
    if (estadoActual === "cancelada") return null;

    async function manejarClick() {
        const resultado = await cancelarReserva(id);
        if (!resultado.exito) {
            setError(resultado.mensaje ?? "Error desconocido.");
        }
    }

    return (
        <div className="text-right">
            <button onClick={manejarClick} className="text-sm text-yellow-600 hover:text-yellow-800 transition-colors">
                Cancelar
            </button>
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        </div>
    );
}

// *************** AHORA SE AGREGA EL BOTÓN CANCELAR EN /reservas/page.tsx ****************