const bardApi = require('bardapi');
const openai = require('openai');
const keyboard = require('keyboard');
const speakText = require('speak_text');
const speakText2 = require('speak_text2');

// Set the Bard API key
process.env._BARD_API_KEY = 'YOUR BARD API KEY';
openai.api_key = 'YOUR OPEN API KEY';

// Function to interact with Bard and get the answer
const getBardAnswer = (question) => {
  try {
    const response = bardApi.getAnswer(question);
    const answer = response.content;
    return answer;
  } catch (err) {
    console.log('An error occurred:', err);
    return null;
  }
};

// Define the conversation function
const conversationBot = (topic) => {
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
    const response = openai.ChatCompletion.create({
      model: 'gpt-3.5-turbo',
      messages: messages.slice(-10), // Limit the conversation history to the last 10 messages
      temperature: 0.9,
      max_tokens: 800,
    });
    const message = response.choices[0].message.content;

    if (message) {
      console.log('GPT:', message);
      speakText(message.replace('GPT:', ''));
    }

    // Check if the user has interrupted the conversation
    if (keyboard.isPressed('q')) {
      console.log('You have ended the conversation. Goodbye!');
      break;
    }

    // Get Bard's answer to GPT's question
    const question = message.replace('GPT:', '').trim();
    const answer = getBardAnswer(question);

    if (answer) {
      console.log('Bard:', answer);
      speakText2(answer);
    }

    // Check if the user has interrupted the conversation
    if (keyboard.isPressed('q')) {
      console.log('You have ended the conversation. Goodbye!');
      break;
    }

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


