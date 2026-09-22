const DEFAULT_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

export const AI_USER_AGENT = process.env.AI_SERVICE_USER_AGENT || DEFAULT_UA

export const aiHeaders = { 'Content-Type': 'application/json', 'User-Agent': AI_USER_AGENT }
export const aiGetHeaders = { 'User-Agent': AI_USER_AGENT }
