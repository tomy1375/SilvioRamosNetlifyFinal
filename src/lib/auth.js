import prisma  from './prisma.js'

// Función para manejar el inicio de sesión
export async function login(email, password) {
  try {
    console.log(`Intentando iniciar sesión con email: ${email}`)

    // Consultar el usuario por email
    const usuario = await prisma.usuario.findUnique({
      where: { email }
    })

    if (!usuario) {
      console.log("Usuario no encontrado")
      return { success: false, error: "Usuario no encontrado" }
    }

    console.log(`Usuario encontrado: ${usuario.nombre} (${usuario.tipo})`)

    // Verificar la contraseña (en un sistema real, deberías usar bcrypt o similar)
    if (usuario.password !== password) {
      console.log("Contraseña incorrecta")
      return { success: false, error: "Contraseña incorrecta" }
    }

    // Crear objeto de sesión (sin incluir la contraseña)
    const { password: _, ...usuarioSesion } = usuario

    const redirectUrl = usuario.tipo.toLowerCase() === "admin" ? "/admin" : "/cliente"
    console.log(`Inicio de sesión exitoso. Redirigiendo a: ${redirectUrl}`)

    return {
      success: true,
      usuario: usuarioSesion,
      redirect: redirectUrl,
    }
  } catch (error) {
    console.error("Error en login:", error)
    return { success: false, error: "Error al iniciar sesión" }
  }
}

// Función para verificar si el usuario está autenticado
export function isAuthenticated(request) {
  const cookies = request.headers.get("cookie")
  if (!cookies) return null

  // Buscar la cookie de sesión
  const sessionCookie = cookies.split(";").find((c) => c.trim().startsWith("session="))
  if (!sessionCookie) return null

  try {
    // Decodificar la cookie (en un sistema real, deberías verificar una firma)
    const sessionData = JSON.parse(decodeURIComponent(sessionCookie.split("=")[1]))
    return sessionData
  } catch (error) {
    console.error("Error al decodificar la sesión:", error)
    return null
  }
}

// Función para cerrar sesión
export function logout() {
  // Eliminar la cookie de sesión
  document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
  // Redirigir a la página de inicio de sesión
  window.location.href = "/login"
}