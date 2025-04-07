import prisma from './prisma.js'

// Usuarios
export async function getUsers() {
  console.log("Ejecutando getUsers() con Prisma")
  try {
    const usuarios = await prisma.usuario.findMany()
    console.log(`Usuarios encontrados: ${usuarios.length}`)
    return usuarios
  } catch (error) {
    console.error("Error en getUsers:", error)
    throw error
  }
}

export async function getUserById(id) {
  return prisma.usuario.findUnique({
    where: { id }
  })
}

export async function getUserByEmail(email) {
  return prisma.usuario.findUnique({
    where: { email }
  })
}

export async function createUser(userData) {
  return prisma.usuario.create({
    data: userData
  })
}

export async function updateUser(id, userData) {
  return prisma.usuario.update({
    where: { id },
    data: userData
  })
}

export async function deleteUser(id) {
  await prisma.usuario.delete({
    where: { id }
  })
  return true
}

// Planos
export async function getPlanos() {
  const planos = await prisma.plano.findMany({
    orderBy: [
      { fecha_subida: 'desc' },
      { id: 'desc' }
    ],
    include: {
      usuario: {
        select: {
          nombre: true
        }
      }
    }
  })
  
  // Formatear los resultados para mantener compatibilidad con el código existente
  return planos.map(plano => ({
    ...plano,
    cliente_nombre: plano.usuario?.nombre
  }))
}

export async function getPlanoById(id) {
  console.log(`Buscando plano con ID: ${id}`)
  try {
    const plano = await prisma.plano.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            nombre: true
          }
        }
      }
    })
    
    if (plano) {
      return {
        ...plano,
        cliente_nombre: plano.usuario?.nombre
      }
    }
    
    return null
  } catch (error) {
    console.error(`Error en getPlanoById: ${error}`)
    throw error
  }
}

export async function getPlanosByUserId(userId) {
  return prisma.plano.findMany({
    where: { usuario_id: userId },
    orderBy: [
      { fecha_subida: 'desc' },
      { id: 'desc' }
    ]
  })
}

export async function createPlano(planoData) {
  return prisma.plano.create({
    data: planoData
  })
}

export async function updatePlano(id, planoData) {
  return prisma.plano.update({
    where: { id },
    data: planoData
  })
}

export async function deletePlano(id) {
  await prisma.plano.delete({
    where: { id }
  })
  return true
}

// Historial de descargas
export async function getHistorialByUserId(userId) {
  const historial = await prisma.historial.findMany({
    where: { usuario_id: userId },
    orderBy: [
      { fecha: 'desc' },
      { hora: 'desc' }
    ],
    include: {
      plano: true
    }
  })
  
  // Formatear los resultados para mantener compatibilidad
  return historial.map(item => ({
    ...item,
    plano_id: item.plano.id,
    nombre: item.plano.nombre,
    tipo: item.plano.tipo,
    archivo_url: item.plano.archivo_url
  }))
}

export async function createHistorial(historialData) {
  console.log(`Creando registro de historial: usuario=${historialData.usuario_id}, plano=${historialData.plano_id}, fecha=${historialData.fecha}`)

  try {
    // Asegurarnos de que fecha y hora sean objetos Date válidos
    const fechaObj = historialData.fecha instanceof Date ? 
      historialData.fecha : new Date(historialData.fecha);
    
    const horaObj = historialData.hora instanceof Date ? 
      historialData.hora : new Date(historialData.hora);
    
    const result = await prisma.historial.create({
      data: {
        usuario_id: historialData.usuario_id,
        plano_id: historialData.plano_id,
        fecha: fechaObj,
        hora: horaObj
      }
    })
    console.log("Historial creado:", result)
    return result
  } catch (error) {
    console.error("Error al crear historial:", error)
    throw error
  }
}
// Mantener la función query para compatibilidad con código existente
export async function query(text, params) {
  console.warn("La función query está obsoleta. Por favor, usa las funciones específicas de Prisma.")
  // Implementación mínima para mantener compatibilidad
  if (text.toLowerCase().includes("select")) {
    return { rows: [] }
  }
  return { rows: [] }
}