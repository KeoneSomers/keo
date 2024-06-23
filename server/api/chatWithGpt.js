import OpenAI from "openai";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const { msg, notes, thread_id } = await readBody(event);

  const openai = new OpenAI({
    apiKey: config.openaiApiKey,
  });

  const assistant = await openai.beta.assistants.retrieve(
    "asst_GhthCVssiAKe1qZEh1n3fbgZ"
  );

  // return;

  const message = await openai.beta.threads.messages.create(thread_id, {
    role: "user",
    content: msg,
  });

  let run = await openai.beta.threads.runs.createAndPoll(thread_id, {
    assistant_id: assistant.id,
    instructions: `Please address the user as friend. Please use the users notes deliminated by the tripple quotes as additional context, This may sometimes be empty, in that case ignore it. """${notes}"""`,
  });

  if (run.status === "completed") {
    const messages = await openai.beta.threads.messages.list(run.thread_id, {
      limit: 2,
    });
    for (const message of messages.data.reverse()) {
      console.log(`${message.role} > ${message.content[0].text.value}`);
    }

    return messages.data;
  } else {
    console.log(run.status);

    return {
      data: null,
    };
  }
});
