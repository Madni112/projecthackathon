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

  // 4. Fallback response if no keys provided or all keys fail
  return `As your AI Fitness Coach: Based on your training schedule, ensure you maintain an active hydration target of 3-4 Liters per day and consume 1.6-2.2g of protein per kg of bodyweight to maximize muscle hypertrophy and recovery!`;
}

/**
 * Multimodal AI Vision Analysis Function for Posture Photos (OpenRouter Vision / GPT-4o-mini / Gemini Flash)
 */
async function generateAIVisionAnalysis(images = [], userPrompt, systemContext = "You are an expert AI Anthropometrics & Posture Analysis Specialist. Respond strictly with JSON.") {
  const fetchFn = getFetch();
  const openRouterKeys = getOpenRouterKeys();

  // Construct multimodal content array (Text prompt + Image URLs)
  const userContent = [{ type: 'text', text: userPrompt }];

  if (Array.isArray(images)) {
    images.forEach(img => {
      if (img && typeof img === 'string' && img.length > 20) {
        userContent.push({
          type: 'image_url',
          image_url: { url: img }
        });
      }
    });
  }

  const visionModels = [
    'openai/gpt-4o-mini',
    'google/gemini-2.0-flash-001',
    'openai/gpt-4o',
    'openrouter/auto'
  ];

  for (let i = 0; i < openRouterKeys.length; i++) {
    const apiKey = openRouterKeys[i];
    for (const modelName of visionModels) {
      try {
        console.log(`[AI Vision Engine] Analyzing posture photos with OpenRouter (${modelName})...`);
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
              { role: 'user', content: userContent }
            ]
          })
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.choices?.[0]?.message?.content;
          if (text) {
            console.log(`[AI Vision Engine] OpenRouter Vision (${modelName}) Succeeded!`);
            return text.trim();
          }
        } else {
          const errText = await response.text();
          console.warn(`[AI Vision Engine] OpenRouter Vision (${modelName}) status ${response.status}: ${errText}`);
        }
      } catch (err) {
        console.warn(`[AI Vision Engine] OpenRouter Vision error: ${err.message}`);
      }
    }
  }

  // Fallback to text prompt LLM if images unavailable or Vision model fails
  return generateAIChatResponse(userPrompt, systemContext);
}

module.exports = {
  generateAIChatResponse,
  generateAIVisionAnalysis,
  getOpenRouterKeys,
  getGeminiKeys,
  getOpenAIKeys
};
