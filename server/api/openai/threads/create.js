import OpenAI from "openai";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  const openai = new OpenAI({
    apiKey: config.openaiApiKey,
  });

  return await openai.beta.threads.create();
});
