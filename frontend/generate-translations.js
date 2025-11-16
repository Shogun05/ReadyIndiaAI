const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = '';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const targetLanguages = {
  de: 'German',
  it: 'Italian',
  fr: 'French',
  es: 'Spanish',
  pt: 'Portuguese',
  ja: 'Japanese',
  zh: 'Chinese',
  ru: 'Russian',
  ar: 'Arabic',
  ko: 'Korean'
};

const enLocalesPath = path.join(__dirname, 'src', 'locales', 'en.json');
const localesDir = path.join(__dirname, 'src', 'locales');

async function translateToLanguage(englishTranslations, targetLang, targetLangName) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `Translate the following JSON object from English to ${targetLangName}. 
  Return ONLY valid JSON with the same structure but translated values.
  Do not add any explanation or markdown formatting.
  
  ${JSON.stringify(englishTranslations, null, 2)}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error(`Failed to extract JSON for ${targetLang}`);
      return null;
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error(`Error translating to ${targetLang}:`, error.message);
    return null;
  }
}

async function main() {
  try {
    // Read English translations
    const englishJson = JSON.parse(fs.readFileSync(enLocalesPath, 'utf8'));
    
    console.log('Starting translations...\n');
    
    for (const [langCode, langName] of Object.entries(targetLanguages)) {
      console.log(`Translating to ${langName} (${langCode})...`);
      
      const translated = await translateToLanguage(englishJson, langCode, langName);
      
      if (translated) {
        const filePath = path.join(localesDir, `${langCode}.json`);
        fs.writeFileSync(filePath, JSON.stringify(translated, null, 2));
        console.log(`✓ Saved ${langCode}.json\n`);
      } else {
        console.log(`✗ Failed to translate ${langCode}\n`);
      }
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('Translation complete!');
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();
