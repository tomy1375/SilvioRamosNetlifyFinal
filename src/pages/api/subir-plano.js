import { createPlano } from "../../lib/db.js"
import { uploadFile } from "../../lib/storage.js"

export async function POST({ request }) {
  try {
    const formData = await request.formData()

    // Obtener los datos del formulario
    const nombre = formData.get("nombre")
    const tipo = formData.get("tipo")
    const usuario_id = formData.get("cliente")
    const descripcion = formData.get("descripcion")
    const archivo = formData.get("archivo")

    // Validar que se recibieron todos los datos necesarios
    if (!nombre || !tipo || !usuario_id || !archivo) {
      return new Response(JSON.stringify({ error: "Faltan datos requeridos" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Validar que el archivo es un PDF
    if (archivo.type !== "application/pdf") {
      return new Response(JSON.stringify({ error: "El archivo debe ser un PDF" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    try {
      // Subir el archivo a Cloudinary
      console.log("Subiendo archivo a Cloudinary...")
      const archivo_url = await uploadFile(archivo)
      console.log("Archivo subido exitosamente:", archivo_url)

      // Guardar la información en la base de datos
      const plano = await createPlano({
        nombre,
        tipo,
        descripcion: descripcion || "",
        archivo_url,
        usuario_id: Number.parseInt(usuario_id),
      })

      return new Response(JSON.stringify({ success: true, plano }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      })
    } catch (dbError) {
      console.error("Error al crear plano:", dbError)

      // Verificar si es un error de tabla no existente
      if (dbError.code === "42P01") {
        return new Response(
          JSON.stringify({
            error: "La tabla de planos no existe en la base de datos. Por favor, configure la base de datos primero.",
            setupUrl: "/api/setup-db",
          }),
          { status: 500, headers: { "Content-Type": "application/json" } },
        )
      }

      throw dbError
    }
  } catch (error) {
    console.error("Error al subir el plano:", error)
    return new Response(JSON.stringify({ error: "Error al procesar la solicitud", details: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

