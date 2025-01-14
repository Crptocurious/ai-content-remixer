import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable')
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { text, style } = req.body

    if (!text || !style) {
      return res.status(400).json({ message: 'Missing text or style' })
    }

    const prompt = `Generate 4 unique and creative variations of the following text in a ${style} style. Make each variation distinct and engaging. Format each variation as a separate paragraph without any numbering or prefixes:\n\n${text}`

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      temperature: 0.9,
      max_tokens: 1000,
    })

    const response = completion.choices[0]?.message?.content

    if (!response) {
      throw new Error('No response generated')
    }

    // Split the response into variations by paragraphs and clean them up
    const variations = response
      .split('\n\n')
      .map(text => text.trim())
      .filter(text => text.length > 0)
      .slice(0, 4)  // Ensure we only get 4 variations

    return res.status(200).json({
      success: true,
      variations
    })
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Something went wrong'
    })
  }
} 