import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { BotonEliminarReserva } from "./boton-eliminar";
import { tarjeta } from "@/lib/estilos";
import { BotonCancelarReserva } from "./boton-cancelar"; //importamos el nuevo botón
import { BotonConfirmarReserva } from "./boton-confirmar";
const etiquetaEstado: Record<string, string> = {
    pendiente: "bg-yellow-50 text-yellow-700 border-yellow-200",
    confirmada: "bg-green-50 text-green-700 border-green-200",
    cancelada: "bg-gray-100 text-gray-500 border-gray-200",
};

// **************** EJERCICIO 3 ****************
export default async function PaginaReservas({
    searchParams,
}: {                                            //Se agregan los searchParams para recibir el estado
    searchParams: Promise<{ estado?: string }>;
}) {

    // const reservas = await prisma.reserva.findMany({  || Se reempleaza esto por el nuevo metodo
    //     orderBy: { fecha: "asc" },
    //     include: { servicio: true },

    const params = await searchParams;
    const estadoFiltro = params.estado;

    const reservas = await prisma.reserva.findMany({
        orderBy: { fecha: "asc" },
        include: { servicio: true },
        where:
            estadoFiltro && estadoFiltro !== "todos"
                ? { estado: estadoFiltro }
                : {},
    });
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold">Reservas</h1>
                <Link
                    href="/reservas/nueva"
                    className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800 transition-colors"
                >
                    Nueva reserva
                </Link>
            </div>

            {/* Filtro por estado  (ejercicio 3)*/} 
            <div className="flex gap-2 mb-6 flex-wrap">
                {["todos", "pendiente", "confirmada", "cancelada"].map((e) => {
                    const isActivo =
                        e === "todos"
                            ? !estadoFiltro || estadoFiltro === "todos"
                            : estadoFiltro === e;
                    return (
                        <Link
                            key={e}
                            href={e === "todos" ? "/reservas" : `/reservas?estado=${e}`}
                            className={`px-3 py-1 rounded text-sm border capitalize transition-colors ${isActivo
                                    ? "bg-black text-white border-black"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                                }`}
                        >
                            {e}
                        </Link>
                    );
                })}
            </div>
            {/* fin del filtro del ejercicio 3 */}

            {reservas.length === 0 ? (
                <p className="text-sm text-gray-400">No hay reservas registradas.</p>
            ) : (
                <ul className="space-y-3">
                    {reservas.map((reserva) => (
                        <li
                            key={reserva.id}
                            className={`${tarjeta} flex items-start justify-between`}
                        >
                            <div>
                                <p className="font-medium text-sm">{reserva.nombre}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{reserva.correo}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {reserva.servicio.nombre} —{" "}
                                    {new Date(reserva.fecha).toLocaleString("es-SV")}
                                </p>
                                <span
                                    className={`inline-block mt-2 text-xs px-2 py-0.5 rounded border ${etiquetaEstado[reserva.estado] ?? etiquetaEstado.pendiente
                                        }`}
                                >
                                    {reserva.estado}
                                </span>
                            </div>
                            <div className="flex gap-2 shrink-0 ml-4"> {/* Se agrega un div donde estan los dos botones */}
                                <BotonConfirmarReserva id={reserva.id} estadoActual={reserva.estado} />
                                <BotonCancelarReserva id={reserva.id} estadoActual={reserva.estado} />
                                <BotonEliminarReserva id={reserva.id} />
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
