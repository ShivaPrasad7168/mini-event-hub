import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://inwhrjhfwkhjfwwcmark.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlud2hyamhmd2toamZ3d2NtYXJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5OTQ4MzIsImV4cCI6MjA3NzU3MDgzMn0.lgOIIgcdLp6P0jag7euy3fx9M5ZVca1qgmyq-Pmy-BU'

export const supabase = createClient(supabaseUrl, supabaseKey)

export const apiClient = {
  get: async (endpoint: string) => {
    const { data, error } = await supabase.from('events').select('*')
    if (error) throw error
    return data
  },
  post: async (endpoint: string, data: any) => {
    const { data: result, error } = await supabase.from('events').insert({
      title: data.title,
      description: data.description,
      location: data.location,
      date: data.date,
      max_participants: data.maxParticipants,
      category: data.category,
    }).select().single()
    if (error) throw error
    return result
  },
  put: async (endpoint: string, data?: any) => {
    if (endpoint.includes('/join')) {
      const eventId = endpoint.split('/')[3]
      const { data: event, error: fetchError } = await supabase
        .from('events')
        .select('current_participants, max_participants')
        .eq('id', eventId)
        .single()

      if (fetchError) throw fetchError

      if (event.current_participants >= event.max_participants) {
        throw new Error('Event is full')
      }

      const { data: result, error } = await supabase
        .from('events')
        .update({ current_participants: event.current_participants + 1 })
        .eq('id', eventId)
        .select()
        .single()

      if (error) throw error
      return result
    } else {
      const eventId = endpoint.split('/')[3]
      const { data: result, error } = await supabase
        .from('events')
        .update({
          title: data.title,
          description: data.description,
          location: data.location,
          date: data.date,
          max_participants: data.maxParticipants,
          category: data.category,
        })
        .eq('id', eventId)
        .select()
        .single()

      if (error) throw error
      return result
    }
  },
  delete: async (endpoint: string) => {
    const eventId = endpoint.split('/')[3]
    const { error } = await supabase.from('events').delete().eq('id', eventId)
    if (error) throw error
    return { success: true }
  }
}
