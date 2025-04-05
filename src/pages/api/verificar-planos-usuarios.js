import { getPlanos, getUsers } from "../../lib/db.js"

// Actualizado para usar las funciones de Prisma en lugar de query
export async function GET() {
  try {
    console.log("Verificando relación entre planos y usuarios...")

    // Obtener todos los planos con información de usuario
    const planos = await getPlanos()
    console.log(`Se encontraron ${planos.length} planos`)

    // Verificar si hay planos sin usuario asociado
    const planosSinUsuario = planos.filter((plano) => !plano.usuario_id)
    console.log(`Se encontraron ${planosSinUsuario.length} planos sin usuario asociado`)

    // Obtener todos los usuarios
    const usuarios = await getUsers()
    console.log(`Se encontraron ${usuarios.length} usuarios`)

    // Filtrar solo los clientes
    const clientes = usuarios.filter((usuario) => usuario.tipo && usuario.tipo.toLowerCase() === "cliente")
    console.log(`Se encontraron ${clientes.length} clientes`)

    return new Response(
      JSON.stringify({
        success: true,
        totalPlanos: planos.length,
        planosSinUsuario: planosSinUsuario.length,
        detallesPlanosSinUsuario: planosSinUsuario,
        totalClientes: clientes.length,
        clientes: clientes,
        todosLosPlanos: planos,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("Error al verificar planos y usuarios:", error)
    return new Response(
      JSON.stringify({
        error: "Error al verificar planos y usuarios",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

