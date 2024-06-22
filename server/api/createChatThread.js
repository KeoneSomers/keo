import OpenAI from "openai";

export default defineEventHandler(async (event) => {
  const openai = new OpenAI({
    apiKey: "sk-proj-HFc1dIQ0lppPLb0TjWoCT3BlbkFJkZeQvc9GzTXXRSkm5UuJ",
  });

  const assistant = await openai.beta.assistants.retrieve(
    "asst_GhthCVssiAKe1qZEh1n3fbgZ"
  );

  const thread = await openai.beta.threads.create();

  // TODO: store the threadId in the db for the task

  //   return {
  //     id: "thread_abc123",
  //     object: "thread",
  //     created_at: 1698107661,
  //     metadata: {},
  //   };

  return thread;
});
