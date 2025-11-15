// lingo.config.js
// Configuration for Lingo.dev - AI-powered automatic translation

module.exports = {
  // Source language - the language your React components are written in
  sourceLocale: "en",

  // Target languages - languages to automatically translate to
  targetLocales: ["hi"],

  // AI Model configuration
  // Using Google's Gemini 2.0 Flash for high-quality translations
  models: {
    // Pattern: "source:target" => "provider:model"
    "*:*": "google:gemini-2.0-flash"
  },

  // Optional: Customize behavior
  options: {
    // Reuse existing translations to save costs
    reuseTranslations: true,
    
    // Only translate changed content
    onlyChanged: true,
    
    // Output directory for translation files
    outputDir: "lingo",
    
    // Automatically commit translation changes
    autoCommit: false
  }
};
