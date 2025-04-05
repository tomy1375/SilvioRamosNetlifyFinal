import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { deletePlano, getPlanoById } from "../../lib/db.js"

// Obtener el directorio actual
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Directorio donde se guardan los archivos
const uploadDir = path.join(__dirname, "../../../public")

export async function POST({ request }) {
  try {
    console.log("Recibida solicitud para eliminar plano")

    const data = await request.json()
    console.log("Datos recibidos:", data)

    const { id } = data
    const planoId = Number.parseInt(id, 10) // Convertir a número entero

    if (!id || isNaN(planoId)) {
      console.error("ID de plano no proporcionado o inválido")
      return new Response(JSON.stringify({ error: "ID de plano no proporcionado o inválido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Obtener información del plano antes de eliminarlo
    const plano = await getPlanoById(planoId)
    if (!plano) {
      console.error("Plano no encontrado")
      return new Response(JSON.stringify({ error: "Plano no encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    console.log("Plano encontrado:", plano)

    // Eliminar el archivo físico
    try {
      const filePath = path.join(uploadDir, plano.archivo_url)
      console.log("Intentando eliminar archivo:", filePath)

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
        console.log("Archivo eliminado correctamente")
      } else {
        console.log("El archivo no existe en el sistema de archivos")
      }
    } catch (fileError) {
      console.error("Error al eliminar el archivo físico:", fileError)
      // Continuamos con la eliminación del registro en la base de datos
    }

    // Eliminar el registro de la base de datos
    await deletePlano(planoId)
    console.log("Plano eliminado de la base de datos")

    return new Response(JSON.stringify({ success: true, message: "Plano eliminado correctamente" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error al eliminar el plano:", error)
    return new Response(JSON.stringify({ error: "Error al eliminar el plano", details: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

