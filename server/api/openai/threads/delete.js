import OpenAI from "openai";

export default defineEventHandler(async (event) => {
  const { thread_id } = await readBody(event);

  const config = useRuntimeConfig();

  const openai = new OpenAI({
    apiKey: config.openaiApiKey,
  });

  const thread = await openai.beta.threads.del(thread_id);

  return thread;
});
