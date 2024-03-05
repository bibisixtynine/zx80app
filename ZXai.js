// ZXai.js

// request a stored Secrets for OPENAI_API_KEY

//import OpenAI from "openai";
const OpenAI = require("openai");
  
const default_prompt = `
You are a JavaScript Phaser 3.6 coding api that is used to create games.
very important : Do not include any explanation. Do not add any markdown.
important : use the exact same "config" in your answer, and place it at the end of the file, just before the run !
important : add detailed comments in your js code !
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