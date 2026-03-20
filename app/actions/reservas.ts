"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Esquema de validación para el formulario de reserva.
// servicioID llega como sttring desde el select y se convierte a número con z.coerce.
const EsquemaReserva = z.object({
    nombre: z.string().min(1, "El nombre es obligatorio."),
    correo: z.string().email("El correo no es válido."),
    fecha: z.string().min(1, "La fecha es obligatoria."),
    servicioId: z.coerce.number({ message: "Debe seleccionar un servicio." }),
});

// Crea una nueva reserva asociada a un servicio existente.
// La fecha se convierte a objeto Date antes de guardarse en la base de datos.
export async function crearReserva(_estadoPrevio: any, datos: FormData) {
    const campos = EsquemaReserva.safeParse({
        nombre: datos.get("nombre"),
        correo: datos.get("correo"),
        fecha: datos.get("fecha"),
        servicioId: datos.get("servicioId"),
    });

    // Si la validación falla, se retorna el objeto de errores al componente
    if (!campos.success) {
        return {
            errores: campos.error.flatten().fieldErrors,
            mensaje: "Error de validación."
        };
    }
// *************** EJERCICIO 1 ****************
    // Buscar el servicio para saber cuánto dura
const servicio = await prisma.servicio.findUnique({
    where: { id: campos.data.servicioId },
});

if (!servicio) {
    return { errores: {}, mensaje: "El servicio seleccionado no existe." };
}

// convertir la fecha del formulario a Date
const fechaInicio = new Date(campos.data.fecha);

//  Calcular cuándo terminaría esta reserva
const fechaFin = new Date(
    fechaInicio.getTime() + servicio.duracion * 60 * 1000 //multiplicacion para convertir minutos a milisegundos
);

// Buscar en la base todas las reservas del mismo servicio
//    que empiecen ANTES de que termine la nueva 
const reservasCandidatas = await prisma.reserva.findMany({
    where: {
        servicioId: campos.data.servicioId, // mismo servicio
        estado: { not: "cancelada" },        // las canceladas no cuentan
        fecha: { lt: fechaFin },             // empiezan antes de que termine la nueva
    },
});

// verificar si realmente hay choque
for (const existente of reservasCandidatas) {
    // Calculamos cuándo termina la reserva existente
    const finExistente = new Date(
        existente.fecha.getTime() + servicio.duracion * 60 * 1000
    );

    const haySolapamiento =
        fechaInicio < finExistente &&   // nueva empieza antes que termine existente
        fechaFin > existente.fecha;     // nueva termina después que empiece existente

    if (haySolapamiento) {
        // Si chocan, devolvemos error en el campo "fecha"
        return {
            errores: {
                fecha: [
                    `Horario ocupado de ${existente.fecha.toLocaleTimeString("es-SV")}` +
                    ` a ${finExistente.toLocaleTimeString("es-SV")}. Elige otro horario.`
                ],
            },
            mensaje: "Horario no disponible.",
        };
    }
}
//*************** FIN DE EJERCICIO 1 ****************

    await prisma.reserva.create({
        data: {
            nombre: campos.data.nombre,
            correo: campos.data.correo,
            fecha: new Date(campos.data.fecha),
            servicio: { connect: { id: campos.data.servicioId } },
        },
    });

    revalidatePath("/reservas");
    redirect("/reservas");
}

// Elimina una reserva por ID.
// Retorna un objeto de resultado para que el componente pueda mostrar un error si falla.
export async function eliminarReserva(id: number) {
    try {
        await prisma.reserva.delete({ where: { id } });
        revalidatePath("/reservas");
        return { exito: true };
    } catch {
        return { exito: false, mensaje: "No se pudo eliminar la reserva." };
    }
}

// *************** EJERCICIO 2 ****************
export async function cancelarReserva(id: number) {
    try {
        await prisma.reserva.update({
            where: { id },
            data: { estado: "cancelada" },
        });

        // Invalidamos la caché de reservas para que la lista se actualice
        revalidatePath("/reservas");
        return { exito: true };
    } catch {
        return { exito: false, mensaje: "No se pudo cancelar la reserva." };
    }
}
// *************** SIGUE EN app/reservas/boton-cancelar.tsx ****************

// *************** EJERCICIO 4 ****************
export async function confirmarReserva(id: number) {
    try {
        await prisma.reserva.update({
            where: { id },
            data: { estado: "confirmada" },
        });

        revalidatePath("/reservas");
        return { exito: true };
    } catch {
        return { exito: false, mensaje: "No se pudo confirmar la reserva." };
    }
}
// *************** SIGUE EN app/reservas/boton-confirmar.tsx ****************