import OpenAI from "openai";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  const openai = new OpenAI({
    apiKey: config.openaiApiKey,
  });

  const assistant = await openai.beta.assistants.retrieve(
    "asst_GhthCVssiAKe1qZEh1n3fbgZ"
  );

  const thread = await openai.beta.threads.create();

  return thread;
});
