const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai'); // Correcte import

const app = express();
const port = process.env.PORT || 3001;
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("FATAL ERROR: API_KEY is not defined in environment variables.");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Voor productie, configureer CORS specifieker, bv. met de URL van je frontend
// app.use(cors({ origin: 'https://jouw-frontend-domein.coolify.app' }));
app.use(cors()); // Voor nu, sta alle origins toe voor testen
app.use(express.json({ limit: '10mb' }));

app.post('/api/identify-plant', async (req, res) => {
  try {
    const { mimeType, base64ImageData } = req.body;
    if (!mimeType || !base64ImageData) {
      return res.status(400).json({ error: "mimeType and base64ImageData are required." });
    }

    const imagePart = { inlineData: { mimeType, data: base64ImageData } };
    const textPart = {
      text: `Je bent een expert botanicus gespecialiseerd in het identificeren van planten en hun invasieve status in Noordwest-Europa (specifiek Nederland en België). Analyseer de afbeelding van de plant. Geef als antwoord UITSLUITEND de volgende drie regels, zonder extra tekst, uitleg of markdown:
Soort: [Wetenschappelijke naam], [Nederlandse naam (indien bekend)]
Invasief: [Ja/Nee (voor NL/BE)]
Betrouwbaarheid: [een getal tussen 0 en 100]%`
};

        const responseFromGemini = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-04-17',
            contents: [{ parts: [imagePart, textPart] }],
        });
        
        // Controleer of de response.text direct beschikbaar is
        if (responseFromGemini && responseFromGemini.text) {
             res.json({ text: responseFromGemini.text });
        } else {
             // Fallback voor het geval de structuur iets anders is, of om de hele response te loggen voor debuggen
             console.warn("Gemini response.text was not directly available. Full response:", JSON.stringify(responseFromGemini, null, 2));
             // Probeer text() methode als fallback, hoewel .text property de voorkeur heeft
             const textContent = typeof responseFromGemini.text === 'function' ? responseFromGemini.text() : responseFromGemini.text; 
             if (textContent) {
                res.json({ text: textContent });
             } else {
                throw new Error("Kon geen tekst extraheren uit Gemini response.");
             }
        }

      } catch (error) {
        console.error("Error in proxy calling Gemini:", error.message, error.stack);
        res.status(500).json({ error: error.message || "Interne serverfout in proxy." });
      }
    });

    app.listen(port, () => {
      console.log(`Backend proxy listening on port ${port}`);
    });
    ```
4.  **Maak `Dockerfile` aan:** Creëer een bestand `Dockerfile` (zonder extensie) in de `plant-identifier-proxy` map:
    ```dockerfile
    FROM node:18-alpine
    WORKDIR /usr/src/app
    COPY package*.json ./
    RUN npm install
    COPY . .
    EXPOSE 3001
    CMD [ "npm", "start" ]
    ```
5.  **Initialiseer Git:**
    ```bash
    git init
    git add .
    git commit -m "Initial commit backend proxy service"
    ```
