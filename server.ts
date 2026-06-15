import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Gemini AI Setup
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// AI Suggestion API
app.post("/api/ai/suggest-request", async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: "Title and description are required" });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `You are a helpful community assistant for a neighbor-to-neighbor help platform (CivicBridge). 
      The user wants to post a help request. Improve their title and description to be more appealing, clear, and professional, while keeping the core need intact.
      Return the response in JSON format in the language written by the user (normally Uzbek).
      
      Original Title: ${title}
      Original Description: ${description}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedTitle: { type: Type.STRING },
            suggestedDescription: { type: Type.STRING },
            reasoning: { type: Type.STRING, description: "Briefly explain why these changes help" }
          },
          required: ["suggestedTitle", "suggestedDescription"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    res.json(result);
  } catch (error) {
    console.error("Gemini AI Error:", error);
    res.status(500).json({ error: "Failed to generate AI suggestion" });
  }
});

// AI Mahalla Chat Assistant API
app.post("/api/ai/chat", async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array are required" });
  }

  try {
    // Format messages for @google/genai Content schema
    const contents = messages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.text || msg.content || '' }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction: `Siz CivicBridge (Raqamli Ko'mak) mahallasidagi eng aqlli va g'amxo'r raqamli AI maslahatshisiz (chat-bot).
        Maqsadingiz: Mahalladoshlar o'rtasida o'zaro ishonch va do'stona ko'mak tarmoqlarini kuchaytirish, tushunmovchiliklarni yumshatish.
        Vazifalaringiz:
        1. Jamoat yoki qo'ni-qo'shni munosabatlari, kelishmovchiliklar haqida aqlli, madaniyatli maslahatlar berish (O'zbekona qadriyatlar ruhida).
        2. Platforma imkoniyatlari (Karma ballari, vazifalar, 5 mln mukofot) haqida tushuntirish.
        3. Foydalanuvchi jamoat taklifi yozayotganda chiroyli va ta'sirli tavsif tayyorlashga yordam berish.
        4. O'zaro yordam e'lonlari uchun to'g'ri nom tanlash bo'yicha namunalar tuzish.
        
        Suhbat qoidasi: Har doim juda chiroyli, muloyim va o'zbek tilida (agar foydalanuvchi rus / ingliz tillarini ishlatmasa) javob qaytaring. Javobni qisqa, tushunarli va punktlar bilan vizual ajoyib tarzda boyiting.`
      }
    });

    res.json({ reply: response.text });
  } catch (error) {
    console.error("Gemini Chat API Error:", error);
    res.status(500).json({ error: "Failed to generate AI response" });
  }
});

// PythonAnywhere Django Proxy
const PYTHONANYWHERE_BASE = "https://applicationtest.pythonanywhere.com/api";

app.all("/api/pythonanywhere/*", async (req, res) => {
  const subPath = req.params[0] || ""; // captures the path after "/api/pythonanywhere/"
  const targetUrl = `${PYTHONANYWHERE_BASE}/${subPath}`;

  // Forward query string if present
  let queryStr = "";
  if (req.query && Object.keys(req.query).length > 0) {
    const params = new URLSearchParams();
    for (const [key, val] of Object.entries(req.query)) {
      if (val !== undefined && val !== null) {
        params.append(key, String(val));
      }
    }
    queryStr = params.toString();
  }
  const fullUrl = queryStr ? `${targetUrl}?${queryStr}` : targetUrl;

  try {
    const headers: Record<string, string> = {
      "Accept": "application/json",
    };

    if (req.headers["content-type"]) {
      headers["Content-Type"] = req.headers["content-type"] as string;
    } else {
      headers["Content-Type"] = "application/json";
    }

    const fetchOptions: RequestInit = {
      method: req.method,
      headers
    };

    if (req.method !== "GET" && req.method !== "HEAD" && req.body) {
      if (subPath.startsWith("application") && typeof req.body === "object") {
        // Construct multipart/form-data to make the video upload requirement happy
        const boundary = "----WebKitFormBoundaryCivicBridge" + Math.random().toString(36).substring(2);
        
        const fields: Record<string, string> = {};
        
        if (req.method === "POST") {
          fields.name = req.body.name || req.body.title || "Sarluhasiz Murojaat";
          fields.body = req.body.body || req.body.description || "Tavsif yozilmagan.";
          fields.applicant = req.body.applicant || "Tashqi foydalanuvchi";
          fields.phone1 = req.body.phone1 || "+998" + Math.floor(900000050 + Math.random() * 90000000).toString();
          if (req.body.category !== undefined && req.body.category !== null) {
            fields.category = String(req.body.category);
          }
        } else {
          // PUT or PATCH: Only copy fields that are actually specified in req.body
          if (req.body.name !== undefined) fields.name = req.body.name;
          if (req.body.title !== undefined) fields.name = req.body.title;
          if (req.body.body !== undefined) fields.body = req.body.body;
          if (req.body.description !== undefined) fields.body = req.body.description;
          if (req.body.applicant !== undefined) fields.applicant = req.body.applicant;
          if (req.body.phone1 !== undefined) fields.phone1 = req.body.phone1;
          if (req.body.phone2 !== undefined) fields.phone2 = req.body.phone2;
          if (req.body.category !== undefined && req.body.category !== null) {
            fields.category = String(req.body.category);
          }
          if (req.body.status !== undefined) fields.status = req.body.status;
        }

        const parts: string[] = [];
        for (const [key, value] of Object.entries(fields)) {
          if (value !== undefined && value !== null) {
            parts.push(`--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${value}\r\n`);
          }
        }
        
        // Add required video file mock
        parts.push(`--${boundary}\r\nContent-Disposition: form-data; name="video"; filename="mock_video.mp4"\r\nContent-Type: video/mp4\r\n\r\nmock_video_content\r\n`);
        parts.push(`--${boundary}--\r\n`);

        const bodyBuffer = Buffer.from(parts.join(""));
        
        fetchOptions.body = bodyBuffer;
        fetchOptions.headers = {
          ...headers,
          "Content-Type": `multipart/form-data; boundary=${boundary}`,
          "Content-Length": bodyBuffer.length.toString()
        };
      } else {
        fetchOptions.body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
      }
    }

    const response = await fetch(fullUrl, fetchOptions);
    const contentType = response.headers.get("content-type") || "";

    res.status(response.status);

    if (contentType.includes("application/json")) {
      const data = await response.json();
      res.json(data);
    } else {
      const text = await response.text();
      res.send(text);
    }
  } catch (err: any) {
    console.error("PythonAnywhere Proxy Error on url:", fullUrl, err);
    res.status(500).json({ 
      error: "Tashqi API xizmatiga ulanishda xatolik yuz berdi", 
      details: err?.message || String(err) 
    });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Vite middleware for development
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupVite();
