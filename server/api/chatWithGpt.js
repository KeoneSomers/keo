import OpenAI from "openai";

export default defineEventHandler(async (event) => {
  const openai = new OpenAI({
    apiKey: "sk-proj-HFc1dIQ0lppPLb0TjWoCT3BlbkFJkZeQvc9GzTXXRSkm5UuJ",
  });

  const assistant = await openai.beta.assistants.retrieve(
    "asst_GhthCVssiAKe1qZEh1n3fbgZ"
  );

  const thread = await openai.beta.threads.create();

  await openai.beta.threads.retrieve("");

  const message = await openai.beta.threads.messages.create(thread.id, {
    role: "user",
    content: "Hey!",
  });

  let run = await openai.beta.threads.runs.createAndPoll(thread.id, {
    assistant_id: assistant.id,
    instructions:
      "Please address the user as friend. The user has a premium account.",
  });

  if (run.status === "completed") {
    const messages = await openai.beta.threads.messages.list(run.thread_id);
    for (const message of messages.data.reverse()) {
      console.log(`${message.role} > ${message.content[0].text.value}`);
    }

    return {
      data: messages,
    };
  } else {
    console.log(run.status);

    return {
      data: null,
    };
  }
});
