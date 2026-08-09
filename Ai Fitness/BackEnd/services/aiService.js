// Robust fetch helper using native globalThis.fetch (Node 18+) or fallback to dynamic node-fetch
const getFetch = () => {
  if (typeof globalThis.fetch === 'function') {
    return globalThis.fetch;
  }
  return (...args) => import('node-fetch').then(({ default: f }) => f(...args));
};

function getOpenRouterKeys() {
  const keys = [];
  if (process.env.OPENROUTER_API_KEYS) {
    keys.push(...process.env.OPENROUTER_API_KEYS.split(',').map(k => k.trim()).filter(Boolean));
  }
  if (process.env.OPENROUTER_API_KEY) {
    keys.push(process.env.OPENROUTER_API_KEY.trim());
  }
  for (let i = 1; i <= 10; i++) {
    if (process.env[`OPENROUTER_API_KEY_${i}`]) {
      keys.push(process.env[`OPENROUTER_API_KEY_${i}`].trim());
    }
  }
  return [...new Set(keys)];
}

function getGeminiKeys() {
  const keys = [];
  if (process.env.GEMINI_API_KEYS) {
    keys.push(...process.env.GEMINI_API_KEYS.split(',').map(k => k.trim()).filter(Boolean));
  }
  if (process.env.GEMINI_API_KEY) {
    keys.push(process.env.GEMINI_API_KEY.trim());
  }
  for (let i = 1; i <= 10; i++) {
    if (process.env[`GEMINI_API_KEY_${i}`]) {
      keys.push(process.env[`GEMINI_API_KEY_${i}`].trim());
    }
  }
  return [...new Set(keys)];
}

function getOpenAIKeys() {
  const keys = [];
  if (process.env.OPENAI_API_KEYS) {
    keys.push(...process.env.OPENAI_API_KEYS.split(',').map(k => k.trim()).filter(Boolean));
  }
  if (process.env.OPENAI_API_KEY) {
    keys.push(process.env.OPENAI_API_KEY.trim());
  }
  for (let i = 1; i <= 10; i++) {
    if (process.env[`OPENAI_API_KEY_${i}`]) {
      keys.push(process.env[`OPENAI_API_KEY_${i}`].trim());
    }
  }
  return [...new Set(keys)];
}

/**
 * Main AI Chat Generation Function with Key & Model Rotation Fallback
 */
async function generateAIChatResponse(userPrompt, systemContext = "You are an expert AI Fitness & Nutrition Coach.") {
  const fetchFn = getFetch();
  const openRouterKeys = getOpenRouterKeys();
  const geminiKeys = getGeminiKeys();
  const openAIKeys = getOpenAIKeys();

  const openRouterModels = [
    'openrouter/auto',
    'openai/gpt-4o-mini',
    'google/gemini-2.0-flash-001',
    'meta-llama/llama-3.3-70b-instruct',
    'openai/gpt-4o',
    'deepseek/deepseek-chat',
    'openai/gpt-3.5-turbo'
  ];

  // 1. Try OpenRouter API Keys with Model Fallbacks
  for (let i = 0; i < openRouterKeys.length; i++) {
    const apiKey = openRouterKeys[i];
    for (const modelName of openRouterModels) {
      try {
        console.log(`[AI Engine] Attempting OpenRouter API Key #${i + 1} with model: ${modelName}`);
        const response = await fetchFn('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'AI Fitness Coach'
          },
          body: JSON.stringify({
            model: modelName,
            messages: [
              { role: 'system', content: systemContext },
              { role: 'user', content: userPrompt }
            ]
          })
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.choices?.[0]?.message?.content;
          if (text) {
            console.log(`[AI Engine] OpenRouter (${modelName}) Succeeded!`);
            return text.trim();
          }
        } else {
          const errText = await response.text();
          console.warn(`[AI Engine] OpenRouter (${modelName}) status ${response.status}: ${errText}. Trying next model...`);
        }
      } catch (err) {
        console.warn(`[AI Engine] OpenRouter (${modelName}) error: ${err.message}. Trying next model...`);
      }
    }
  }

  // 2. Try Gemini API Keys sequentially
  for (let i = 0; i < geminiKeys.length; i++) {
    const apiKey = geminiKeys[i];
    try {
      console.log(`[AI Engine] Attempting Gemini API Key #${i + 1}`);
      const response = await fetchFn(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `${systemContext}\n\nUser Question: ${userPrompt}` }]
          }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          console.log(`[AI Engine] Gemini API Key #${i + 1} Succeeded!`);
          return text.trim();
        }
      } else {
        console.warn(`[AI Engine] Gemini API Key #${i + 1} failed status ${response.status}`);
      }
    } catch (err) {
      console.warn(`[AI Engine] Gemini API Key #${i + 1} error: ${err.message}`);
    }
  }

  // 3. Try OpenAI API Keys sequentially
  for (let i = 0; i < openAIKeys.length; i++) {
    const apiKey = openAIKeys[i];
    try {
      console.log(`[AI Engine] Attempting OpenAI API Key #${i + 1}`);
      const response = await fetchFn('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemContext },
            { role: 'user', content: userPrompt }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) {
          console.log(`[AI Engine] OpenAI API Key #${i + 1} Succeeded!`);
          return text.trim();
        }
      } else {
        console.warn(`[AI Engine] OpenAI API Key #${i + 1} status ${response.status}`);
      }
    } catch (err) {
      console.warn(`[AI Engine] OpenAI API Key #${i + 1} error: ${err.message}`);
    }
  }

  // Fallback AI advice if keys hit quota
  return `As your AI Fitness & Nutrition Specialist: Maintain an active target of 3-4 Liters of water daily, consume 1.8g protein per kg of bodyweight, and prioritize 7.5+ hours of sleep to support cellular recovery and muscle performance!`;
}

module.exports = {
  generateAIChatResponse,
  getOpenRouterKeys,
  getGeminiKeys,
  getOpenAIKeys
};
