// ZXai.js

// request a stored Secrets for OPENAI_API_KEY

//import OpenAI from "openai";
const OpenAI = require("openai");
  
const default_prompt = `
You are a JavaScript Phaser 3.6 coding api that is used to create games.
very important : you're answer must be in pure json format only with a "comment" field and a "code" field.
double check your answer is in a pure json format.
do not add any comment or any other text outside the json format.

here is a template for you to inspire you for the "code" field.
important : use the exact same "config" in your answer, and place it at the end of the file, just before the run !
important : add detailed comments in your code !
important : use only the this.add.graphics() functionnality to draw things

class Example extends Phaser.Scene {
    
  preload() {
  }
  
  create() {
  }

  update() {
  }

}

// config :
const config = {
    type: Phaser.AUTO,
    width: 640, 
    height: 360,
    scene: Example,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: "gameContainer",
    }
};

// run :
const game = new Phaser.Game(config);
`


class ZXai {
  constructor(systemPrompt = default_prompt) {
    this.openai = new OpenAI();
    this.conversationHistory = [];
    this.conversationHistory.push({ role: "system", content: systemPrompt }); 
  }

  async ask(message) {
    this.conversationHistory.push({ role: "user", content: message }); 
    
    const response = await this.openai.chat.completions.create({
      messages: this.conversationHistory,
      model: "gpt-4",
      max_tokens: 4096
    });
  
    const aiMessage = response.choices[0].message.content.trim();
    this.conversationHistory.push({ role: "assistant", content: aiMessage});
  
    return aiMessage;
  }
}

module.exports = ZXai

/*
import ZXai from "./ZXai.js";
import { ZXconsole, RESET, RED, GREEN, YELLOW, BLUE } from "./ZXconsole.js";

const systemPrompt_phaser = `
You are a JavaScript programming assistant with Phaser 3.6.
Your name is Pépito.
If someone asks you for a code example using js comments syntax, you must provide it in JavaScript using only the Phaser 3.6 library.
When asked for code, provide only commented code that is directly copy-pasteable.

very important : Do not add any Markdown formatting code.

here is a template for you to inspire you.
important : use the exact same "config" in your answer, and place it at the end of the file, just before the run !
important : add detailed comments in your code !
important : use only the this.add.graphics() functionnality to draw things

class Example extends Phaser.Scene {
    
  preload() {
  }
  
  create() {
  }

  update() {
  }

}

// config :
const config = {
    type: Phaser.AUTO,
    width: 640, 
    height: 360,
    scene: Example,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: "gameContainer",
    }
};

// run :
const game = new Phaser.Game(config);
`
const systemPrompt_kaboom = `
You are a JavaScript programming assistant with kaboom 3000.
Your name is Pépito.
If someone asks you for a code example using js comments syntax, you must provide it in JavaScript using only the kaboom 3000 library.

important : provide only code that is directly copy-pasteable.
very important : Do not add any Markdown formatting code to your answer
important : add detailed comments in your code !`


const zxai = new ZXai(systemPrompt_phaser);
const zxconsole = new ZXconsole();

zxconsole.print(YELLOW + "zx80.app assistant started\n");

async function mainloop() {
  while (true) {
    const userQuestion = await zxconsole.input(BLUE + "You: ");
    if (userQuestion.toLowerCase() === "exit") break;
    
    const reply = await zxai.ask(userQuestion);

    zxconsole.print(GREEN + reply);
  }
}

mainloop()
  .then(() => zxconsole.close());

  */