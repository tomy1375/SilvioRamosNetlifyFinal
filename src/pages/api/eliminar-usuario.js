import { deleteUser, getUserById } from "../../lib/db.js"

export async function POST({ request }) {
  try {
    const data = await request.json()
    const { id } = data
    const userId = Number.parseInt(id, 10) // Convertir a número entero

    if (!id || isNaN(userId)) {
      return new Response(JSON.stringify({ error: "ID de usuario no proporcionado o inválido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Verificar que el usuario existe
    const usuario = await getUserById(userId)
    if (!usuario) {
      return new Response(JSON.stringify({ error: "Usuario no encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Eliminar el usuario de la base de datos
    await deleteUser(userId)

    return new Response(JSON.stringify({ success: true, message: "Usuario eliminado correctamente" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error al eliminar el usuario:", error)
    return new Response(JSON.stringify({ error: "Error al eliminar el usuario", details: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

