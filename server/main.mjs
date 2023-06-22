// import { BardAPI } from 'bardapi'
import 'dotenv/config'
import Bard from "bard-ai";
import { Configuration, OpenAIApi } from 'openai'

import fetch, {
    Headers,
    Request,
    Response,
} from 'node-fetch'

if (!globalThis.fetch) {
    globalThis.fetch = fetch
    globalThis.Headers = Headers
    globalThis.Request = Request
    globalThis.Response = Response
}

console.log("Setting up Bard...")

const bardApiKey = process.env.BARD_API_KEY

// Set the Bard API key
// const bard = new BardAPI({ sessionId: bardApiKey })
await Bard.init(bardApiKey)

const bard = new Bard.Chat()

// Function to interact with Bard and get the answer
const getBardAnswer = async (q) => {
    try {
        const response = await bard.ask(q);
        // console.log('getBardAnswer', response)
        const answer = response;
        return answer;
    } catch (err) {
        console.log('An error occurred:', err);
        return null;
    }
};

// ChatGPT setup

console.log("Setting up GPT...")

const openaiApiKey = process.env.OPENAI_API_KEY

// Set the OpenAI key
const configuration = new Configuration({
    apiKey: openaiApiKey,
})

const openai = new OpenAIApi(configuration)

//////

// Define the conversation function
const conversationBot = async (topic = "anything", rounds = 3) => {

    // Start the conversation
    const messages = [];

    messages.push({ role: 'system', content: `Raise the topic of ${topic}.` })
    // messages.push({ role: 'user', content: `Hi GPT.` })

    for (let i = 0; i < rounds; ++i) {
        // Generate a question from GPT based on the topic
        const response = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: messages.slice(-20), // Limit the conversation history to the last 10 messages
            temperature: 0,
            max_tokens: 800,
        });
        // console.log('response', response)
        const message = response.data.choices[0].message.content;

        if (message) {
            console.log('\n\n\nGPT:', message);
            // speakText(message.replace('GPT:', ''));
        }

        // TODO: Check if the user has interrupted the conversation

        // Get Bard's answer to GPT's question
        const question = message;
        const answer = await getBardAnswer(question);

        if (answer) {
            console.log('\n\n\nBard:', answer);
            // speakText2(answer);
        }
break
        // TODO: Check if the user has interrupted the conversation

        // Add the user input and Bard's answer to the message list
        messages.push({ role: 'assistant', content: answer })
        messages.push({ role: 'system', content: `Respond to your friend Bard. Be assertive and concise, addressing any errors in Bard's remarks.` })
        messages.push({ role: 'user', content: question })
    }

};

const subject = process.argv[2]
const rounds = process.argv[3]

if (subject)
    conversationBot(subject, rounds)
else
    console.log(`Run it like this: node server/main.mjs "capitalism" 3`)