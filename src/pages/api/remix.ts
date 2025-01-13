import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API Key')
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
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

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that rewrites text in different styles."
        },
        {
          role: "user",
          content: `Rewrite the following text in a ${style} style: ${text}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const generatedText = completion.choices[0]?.message?.content

    if (!generatedText) {
      throw new Error('No response from OpenAI')
    }

    return res.status(200).json({
      success: true,
      messages: [{ content: generatedText }]
    })

  } catch (error: any) {
    console.error('API Error:', error)
    return res.status(500).json({
      success: false,
      message: error.message || 'Something went wrong'
    })
  }
} 