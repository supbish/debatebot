import { BardAPI } from 'bardapi';
import { Configuration, OpenAIApi } from 'openai';
import Speech from 'speak-tts';
import 'dotenv/config'

const bardApiKey = document.getElementById("bard-api-key").value;
const openaiApiKey = document.getElementById("openai-api-key").value;

console.log(bardApiKey, openaiApiKey)

// Set the Bard API key
const bard = new BardAPI({ sessionId: bardApiKey });
// Set the OpenAI key
const configuration = new Configuration({
    apiKey: openaiApiKey,
});
const openai = new OpenAIApi(configuration);

function getEnglishVoices() {
    var voices = window.speechSynthesis.getVoices();
    var englishVoices = [];
    for (var i = 0; i < voices.length; i++) {
        if (voices[i].name.indexOf("English") > -1) {
            englishVoices.push(voices[i]);
        }
    }
    return englishVoices;
}

(async () => {

    const speech = new Speech()

    const voices = getEnglishVoices();
    const voice1 = voices[(Math.random() * voices.length) | 0]
    const voice2 = voices[(Math.random() * voices.length) | 0]

    console.log(voice1, voice2)

    speech.init();

    const speakText = (text) => {
        speech.setVoice(voice1.name)
        speech.speak({ text })
    }

    const speakText2 = (text) => {
        speech.setVoice(voice2.name)
        speech.speak({ text })
    }


    
    // speakText(`Hello, I'll be voicing ChatGPT today.`)

    // speakText2(`And I'll be voicing Google Bard.`)


    // Function to interact with Bard and get the answer
    const getBardAnswer = async (message) => {
        try {
            const response = await bard.ask({ message });
            console.log(response)
            const answer = response.response;
            return answer;
        } catch (err) {
            console.log('An error occurred:', err);
            return null;
        }
    };

    // Define the conversation function
    const conversationBot = async (topic) => {
        // Start the conversation
        const messages = [
            { role: 'system', content: `You are having a conversation with Google Bard about ${topic}` },
            { role: 'system', content: `You will be agressive, and give your reponses about ${topic}` },
            { role: 'user', content: `GPT: Let's discuss this ${topic}` },
            { role: 'assistant', content: `Here is my opinion on ${topic} and here is why!` },
        ];

        // Keep track of the conversation history
        let conversationHistory = [];

        // Keep the conversation going until the user interrupts with the keyboard
        while (true) {
            // Generate a question from GPT based on the topic
            const response = await openai.createChatCompletion({
                model: 'gpt-3.5-turbo',
                messages: messages.slice(-10), // Limit the conversation history to the last 10 messages
                temperature: 0.9,
                max_tokens: 800,
            });
            console.log('response', response)
            const message = response.data.choices[0].message.content;

            if (message) {
                console.log('GPT:', message);
                speakText(message.replace('GPT:', ''));
            }

            // TODO: Check if the user has interrupted the conversation

            // Get Bard's answer to GPT's question
            const question = message.replace('GPT:', '').trim();
            const answer = getBardAnswer(question);

            if (answer) {
                console.log('Bard:', answer);
                speakText2(answer);
            }

            // TODO: Check if the user has interrupted the conversation
            break;
            // Add the user input and Bard's answer to the message list
            messages.push({ role: 'system', content: 'You will give a response, and then change to a different topic.' });
            messages.push({ role: 'user', content: question });

            // Add the user input and Bard's answer to the conversation history
            conversationHistory.push({ role: 'user', content: question });
            conversationHistory.push({ role: 'assistant', content: answer });

            // Limit the conversation history to the last 10 conversations
            conversationHistory = conversationHistory.slice(-20);
        }

        if (answer) {
            messages.push({ role: 'user', content: `Bard: ${answer}` });
            messages.push({ role: 'user', content: 'GPT: Give me your response, and then tell what you want to talk about next.' });
            messages.push({ role: 'assistant', content: 'Here is what I want to talk about next' });
        }
        if (!answer) {
            messages.push({ role: 'system', content: 'You will give a response, and then change to a different topic.' });
            messages.push({ role: 'user', content: "I'm sorry, I don't have an answer for that." });
            messages.push({ role: 'assistant', content: 'Here is what I want to talk about next' });
        }
    };

    // Prompt the user to enter a topic for the conversation bots
    const topic = prompt('Please enter a topic for the conversation bots: ');
    conversationBot(topic);

})()