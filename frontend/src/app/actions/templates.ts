'use server'

import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth/requireUser'
import * as db from '@/lib/db/templates'

export async function createTemplate(
  name: string,
  frontTemplate: string,
  backTemplate: string,
  defaultTags?: string[]
) {
  try {
    await requireUser()
    const template = await db.createTemplate(name, frontTemplate, backTemplate, defaultTags)
    revalidatePath('/app/templates')
    return { success: true, template }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create template',
    }
  }
}

export async function updateTemplate(
  templateId: string,
  updates: {
    name?: string
    front_template?: string
    back_template?: string
    default_tags?: string[]
  }
) {
  try {
    await requireUser()
    const template = await db.updateTemplate(templateId, updates)
    revalidatePath('/app/templates')
    return { success: true, template }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update template',
    }
  }
}

export async function deleteTemplate(templateId: string) {
  try {
    await requireUser()
    await db.deleteTemplate(templateId)
    revalidatePath('/app/templates')
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete template',
    }
  }
}
