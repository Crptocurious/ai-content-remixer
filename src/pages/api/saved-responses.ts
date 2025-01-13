import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabaseClient'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('saved_responses')
        .select('*')
        .order('timestamp', { ascending: false })

      if (error) throw error
      return res.status(200).json(data)
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch saved responses' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { text, style } = req.body
      const { data, error } = await supabase
        .from('saved_responses')
        .insert([
          {
            text,
            style,
            timestamp: new Date().toISOString(),
          }
        ])
        .select()
        .single()

      if (error) throw error
      return res.status(201).json(data)
    } catch (error) {
      return res.status(500).json({ error: 'Failed to save response' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query
      const { error } = await supabase
        .from('saved_responses')
        .delete()
        .eq('id', id)

      if (error) throw error
      return res.status(200).json({ message: 'Response deleted successfully' })
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete response' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
} 