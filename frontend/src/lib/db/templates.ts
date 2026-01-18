import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/supabase'

// Use conditional types to handle cases where tables don't exist yet
type CardTemplate = Database['public']['Tables']['card_templates'] extends { Row: infer R } ? R : any
type CardTemplateInsert = Database['public']['Tables']['card_templates'] extends { Insert: infer I } ? I : any
type CardTemplateUpdate = Database['public']['Tables']['card_templates'] extends { Update: infer U } ? U : any

export async function listTemplates() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('card_templates')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message || 'Failed to fetch templates')
  }

  return data || []
}

export async function getTemplate(templateId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('card_templates')
    .select('*')
    .eq('id', templateId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    throw new Error(error.message || 'Failed to fetch template')
  }

  return data
}

export async function createTemplate(
  name: string,
  frontTemplate: string,
  backTemplate: string,
  defaultTags?: string[]
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('card_templates')
    .insert({
      user_id: user.id,
      name,
      front_template: frontTemplate,
      back_template: backTemplate,
      default_tags: defaultTags || [],
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message || 'Failed to create template')
  }

  return data
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
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('card_templates')
    .update(updates)
    .eq('id', templateId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    throw new Error(error.message || 'Failed to update template')
  }

  return data
}

export async function deleteTemplate(templateId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase
    .from('card_templates')
    .delete()
    .eq('id', templateId)
    .eq('user_id', user.id)

  if (error) {
    throw new Error(error.message || 'Failed to delete template')
  }
}
