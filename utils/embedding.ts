import OpenAI from "openai"

// OpenAI APIの初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const generateEmbedding = async (query: string) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return undefined
    }

    const queryResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: query,
    })
    const queryEmbedding = queryResponse.data[0].embedding

    return queryEmbedding
  } catch (error) {
    console.error("Failed to generate embedding: ", error)

    return undefined
  }
}
