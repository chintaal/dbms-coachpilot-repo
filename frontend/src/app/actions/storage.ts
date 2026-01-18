'use server'

import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth/requireUser'

export async function uploadImage(formData: FormData, bucketName: string = 'card-images') {
  try {
    const user = await requireUser()
    const supabase = await createClient()

    const file = formData.get('file') as File
    if (!file) {
      throw new Error('No file provided')
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = fileName

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      throw new Error(error.message || 'Failed to upload image')
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucketName).getPublicUrl(filePath)

    return { success: true, url: publicUrl, path: filePath }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload image',
    }
  }
}

export async function deleteImage(path: string, bucketName: string = 'card-images') {
  try {
    await requireUser()
    const supabase = await createClient()

    // Extract path from full URL if needed
    const filePath = path.includes('/storage/v1/object/public/')
      ? path.split('/storage/v1/object/public/')[1]?.split('/').slice(1).join('/')
      : path

    const { error } = await supabase.storage.from(bucketName).remove([filePath])

    if (error) {
      throw new Error(error.message || 'Failed to delete image')
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete image',
    }
  }
}
