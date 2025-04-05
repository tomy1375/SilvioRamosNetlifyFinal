import { v2 as cloudinary } from "cloudinary"

// Configurar Cloudinary
cloudinary.config({
  cloud_name: import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: import.meta.env.CLOUDINARY_API_KEY,
  api_secret: import.meta.env.CLOUDINARY_API_SECRET,
})

/**
 * Sube un archivo a Cloudinary
 * @param {File} file - El archivo a subir
 * @returns {Promise<string>} - URL del archivo subido
 */
export async function uploadFile(file) {
  try {
    console.log("Configuración de Cloudinary:", {
      cloud_name: import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME,
      // No imprimas las claves por seguridad
    })

    // Convertir el archivo a un buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Crear un nombre de archivo único
    const timestamp = Date.now()
    const fileName = `plano_${timestamp}_${file.name.replace(/\s+/g, "-")}`

    // Subir a Cloudinary usando la API de upload
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "raw",
            public_id: fileName,
            folder: "planos",
            access_mode: "public", // Establecer acceso público
            type: "upload", // Tipo de entrega
          },
          (error, result) => {
            if (error) {
              console.error("Error al subir a Cloudinary:", error)
              reject(error)
            } else {
              console.log("Archivo subido a Cloudinary:", result.secure_url)
              resolve(result.secure_url)
            }
          },
        )
        .end(buffer)
    })
  } catch (error) {
    console.error("Error al subir archivo:", error)
    // Lanzar un error más descriptivo
    throw new Error(`Error al subir el archivo a la nube: ${error.message}`)
  }
}

/**
 * Elimina un archivo de Cloudinary
 * @param {string} url - URL del archivo a eliminar
 * @returns {Promise<boolean>} - true si se eliminó correctamente
 */
export async function deleteFile(url) {
  try {
    // Extraer el public_id del URL
    const urlParts = url.split("/")
    const fileName = urlParts[urlParts.length - 1]
    const folderName = urlParts[urlParts.length - 2]

    // El public_id incluye la carpeta
    const publicId = `${folderName}/${fileName.split(".")[0]}`

    console.log("Intentando eliminar archivo de Cloudinary con public_id:", publicId)

    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, { resource_type: "raw" }, (error, result) => {
        if (error) {
          console.error("Error al eliminar de Cloudinary:", error)
          // No rechazamos la promesa para no interrumpir el flujo
          resolve(false)
        } else {
          console.log("Archivo eliminado de Cloudinary:", result)
          resolve(true)
        }
      })
    })
  } catch (error) {
    console.error("Error al eliminar archivo de Cloudinary:", error)
    // Retornamos false en lugar de lanzar un error para no interrumpir el flujo
    return false
  }
}

