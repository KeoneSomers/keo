import OpenAI from "openai";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const config = useRuntimeConfig();

  const openai = new OpenAI({
    apiKey: config.openaiApiKey,
  });

  try {
    // Make the API request
    const threadMessages = await openai.beta.threads.messages.list(
      query.thread_id,
      {
        order: "asc",
      }
    );

    // Log the response for debugging
    console.log("API Response:", threadMessages.data);

    // Return the messages
    return threadMessages.data;
  } catch (error) {
    // Log any errors that occur
    console.error("Error fetching thread messages:", error);

    // Return an error response
    return { error: "Failed to fetch thread messages" };
  }
});
