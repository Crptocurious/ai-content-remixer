import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable')
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

interface StyleWeight {
  id: string;
  weight: number;
}

const stylePrompts = {
  funny: "Make it humorous and entertaining with witty wordplay or amusing observations",
  professional: "Make it formal, clear, and business-appropriate while maintaining engagement",
  poetic: "Make it lyrical and artistic with metaphors and vivid imagery",
  casual: "Make it relaxed and conversational, as if chatting with a friend"
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { text, styles, intensity = 5 } = req.body

    if (!text || !styles || !Array.isArray(styles) || styles.length === 0) {
      return res.status(400).json({ message: 'Missing text or invalid styles' })
    }

    // Sort styles by weight to ensure primary style has most influence
    const sortedStyles = [...styles].sort((a, b) => b.weight - a.weight);
    
    // Create style description based on weights
    const styleDescription = sortedStyles.map((style, index) => {
      const basePrompt = stylePrompts[style.id as keyof typeof stylePrompts] || `in a ${style.id} style`;
      if (index === 0) {
        return `Primary style (${style.weight}%): ${basePrompt}`;
      } else if (index === 1) {
        return `Secondary influence (${style.weight}%): ${basePrompt}`;
      } else {
        return `Subtle influence (${style.weight}%): ${basePrompt}`;
      }
    }).join('. ');

    // Adjust OpenAI parameters with more conservative ranges
    const temperature = 0.3 + (intensity * 0.07); // Range: 0.37 - 1.0
    const presencePenalty = 0.2 + (intensity * 0.05); // Range: 0.25 - 0.7
    const frequencyPenalty = 0.3 + (intensity * 0.04); // Range: 0.34 - 0.7

    // Adjust prompt based on intensity
    const intensityGuide = intensity <= 3 
      ? "Keep changes minimal and subtle while maintaining the original structure." 
      : intensity >= 8 
        ? "Be highly creative and feel free to significantly transform the text while keeping the core message." 
        : "Balance creativity with the original structure.";

    const prompt = `Generate exactly 4 unique variations of the following text. Apply these style combinations: ${styleDescription}. ${intensityGuide} Each variation must maintain the core message. Format the response as 4 separate paragraphs with no numbering or prefixes:\n\n${text}`

    // Add system message to maintain coherence
    const messages = [
      {
        role: "system" as const,
        content: "You are a creative writing assistant specializing in style combinations. Always generate coherent and meaningful text variations that maintain the core message of the input, while carefully balancing multiple style influences according to their specified weights. Never output code, random strings, or nonsensical text."
      },
      {
        role: "user" as const,
        content: prompt
      }
    ];

    const completion = await openai.chat.completions.create({
      messages,
      model: "gpt-3.5-turbo",
      temperature,
      max_tokens: 1000,
      presence_penalty: presencePenalty,
      frequency_penalty: frequencyPenalty,
      top_p: 0.9
    })

    const response = completion.choices[0]?.message?.content

    if (!response) {
      throw new Error('No response generated')
    }

    // Split the response into variations and ensure exactly 4 variations
    let variations = response
      .split('\n\n')
      .map(text => text.trim())
      .filter(text => text.length > 0)

    // If we have fewer than 4 variations, make another API call
    if (variations.length < 4) {
      const additionalCompletion = await openai.chat.completions.create({
        messages: [{ 
          role: "user", 
          content: `Generate ${4 - variations.length} more unique variations applying these style combinations: ${styleDescription}. Original text: ${text}` 
        }],
        model: "gpt-3.5-turbo",
        temperature: 1.0,
        max_tokens: 500
      })

      const additionalVariations = additionalCompletion.choices[0]?.message?.content
        ?.split('\n\n')
        .map(text => text.trim())
        .filter(text => text.length > 0)
        .slice(0, 4 - variations.length)

      variations = [...variations, ...(additionalVariations || [])]
    }

    // Ensure we only return exactly 4 variations
    variations = variations.slice(0, 4)

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