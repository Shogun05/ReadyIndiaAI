import React, { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const [isChanging, setIsChanging] = useState(false);

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'हिंदी (Hindi)', nativeName: 'हिंदी' },
    // Additional languages can be added via Lingo.dev
    // { code: 'de', name: 'Deutsch (German)', nativeName: 'Deutsch' },
    // { code: 'it', name: 'Italiano (Italian)', nativeName: 'Italiano' },
    // { code: 'fr', name: 'Français (French)', nativeName: 'Français' },
    // { code: 'es', name: 'Español (Spanish)', nativeName: 'Español' },
    // { code: 'pt', name: 'Português (Portuguese)', nativeName: 'Português' },
    // { code: 'ja', name: '日本語 (Japanese)', nativeName: '日本語' },
    // { code: 'zh', name: '中文 (Chinese)', nativeName: '中文' },
    // { code: 'ru', name: 'Русский (Russian)', nativeName: 'Русский' },
    // { code: 'ar', name: 'العربية (Arabic)', nativeName: 'العربية' },
    // { code: 'ko', name: '한국어 (Korean)', nativeName: '한국어' }
  ];

  // Initialize language from localStorage or browser locale
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    const browserLanguage = navigator.language.split('-')[0];
    
    let initialLanguage = 'en';
    
    if (savedLanguage && languages.some(l => l.code === savedLanguage)) {
      initialLanguage = savedLanguage;
    } else if (languages.some(l => l.code === browserLanguage)) {
      initialLanguage = browserLanguage;
    }
    
    setCurrentLanguage(initialLanguage);
    if (initialLanguage !== i18n.language) {
      i18n.changeLanguage(initialLanguage);
    }
  }, [i18n]);

  const changeLanguage = async (languageCode) => {
    if (languageCode === currentLanguage) return;

    setIsChanging(true);
    try {
      // Save preference
      localStorage.setItem('language', languageCode);
      
      // Update document language attribute
      document.documentElement.lang = languageCode;
      
      // Change i18n language
      await i18n.changeLanguage(languageCode);
      
      setCurrentLanguage(languageCode);
      
      toast.success(`Language changed to ${languages.find(l => l.code === languageCode)?.nativeName}`);
    } catch (error) {
      console.error('Error changing language:', error);
      toast.error('Failed to change language');
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div data-testid="language-switcher" className="flex items-center space-x-2">
      <Globe className="w-5 h-5 text-gray-600" />
      <Select 
        value={currentLanguage} 
        onValueChange={changeLanguage}
        disabled={isChanging}
      >
        <SelectTrigger data-testid="language-select" className="w-48">
          <SelectValue placeholder="Select Language" />
        </SelectTrigger>
        <SelectContent>
          {languages.map(lang => (
            <SelectItem 
              key={lang.code} 
              value={lang.code} 
              data-testid={`lang-option-${lang.code}`}
            >
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSwitcher;
