import { createHistorial, getPlanoById, getUserById } from "../../lib/db.js"

export async function POST({ request }) {
  try {
    console.log("Recibida solicitud para registrar descarga")

    const data = await request.json()
    console.log("Datos recibidos:", data)

    const { plano_id, usuario_id } = data
    const planoId = Number.parseInt(plano_id, 10) // Convertir a número entero
    const userId = Number.parseInt(usuario_id, 10) // Convertir a número entero

    // Validar que se recibieron todos los datos necesarios
    if (!plano_id || !usuario_id || isNaN(planoId) || isNaN(userId)) {
      console.error("Faltan datos requeridos o IDs inválidos")
      return new Response(JSON.stringify({ error: "Faltan datos requeridos o IDs inválidos" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Verificar que el plano existe
    const plano = await getPlanoById(planoId)
    if (!plano) {
      console.error(`El plano con ID ${planoId} no existe`)
      return new Response(JSON.stringify({ error: `El plano con ID ${planoId} no existe` }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Verificar que el usuario existe
    const usuario = await getUserById(userId)
    if (!usuario) {
      console.error(`El usuario con ID ${userId} no existe`)
      return new Response(JSON.stringify({ error: `El usuario con ID ${userId} no existe` }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Obtener la fecha y hora actual
    const ahora = new Date()
    const fecha = ahora.toISOString().split("T")[0] // formato YYYY-MM-DD
    const hora = ahora.toTimeString().split(" ")[0] // formato HH:MM:SS

    console.log(
      `Creando registro de historial: plano=${planoId} (${plano.nombre}), usuario=${userId} (${usuario.nombre}), fecha=${fecha}, hora=${hora}`,
    )

    // Registrar la descarga en el historial
    const historial = await createHistorial({
      usuario_id: userId,
      plano_id: planoId,
      fecha,
      hora,
    })

    console.log("Descarga registrada correctamente:", historial)

    return new Response(JSON.stringify({ success: true, historial }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error al registrar descarga:", error)
    return new Response(
      JSON.stringify({
        error: "Error al procesar la solicitud",
        details: error.message,
        stack: error.stack, // Incluir stack trace para depuración
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

