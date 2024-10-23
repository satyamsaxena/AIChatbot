import { Configuration, OpenAIApi } from 'openai-edge'
import { OpenAIStream, StreamingTextResponse } from 'ai'

const apiKey = process.env.OPENAI_API_KEY
if (!apiKey) {
  throw new Error('OPENAI_API_KEY is not set in environment variables')
}

const config = new Configuration({
  apiKey: apiKey
})
const openai = new OpenAIApi(config)

export const runtime = 'edge'

export async function POST(req: Request) {
  console.log('API route called')
  try {
    const { messages } = await req.json()
    console.log('Received messages:', messages)

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error('Invalid or empty messages array')
      return new Response(JSON.stringify({ error: 'Invalid or empty messages array' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      stream: true,
      messages: messages.map((message: any) => ({
        role: message.role,
        content: message.content
      })),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('OpenAI API error:', errorData)
      return new Response(JSON.stringify({ error: 'Error from OpenAI API', details: errorData }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Replace OpenAIStream with OpenAIStreamParser
    const stream = OpenAIStream(response)
    
    return new StreamingTextResponse(stream)
  } catch (error) {
    console.error('API route error:', error)
    return new Response(JSON.stringify({ error: 'An error occurred', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
