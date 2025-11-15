import React, { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const LanguageSwitcher = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isChanging, setIsChanging] = useState(false);

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'हिंदी (Hindi)', nativeName: 'हिंदी' },
    // Future languages from Lingo.dev:
    // { code: 'mr', name: 'मराठी (Marathi)', nativeName: 'मराठी' },
    // { code: 'ta', name: 'தமிழ் (Tamil)', nativeName: 'தமிழ்' },
    // { code: 'te', name: 'తెలుగు (Telugu)', nativeName: 'తెలుగు' },
    // { code: 'kn', name: 'ಕನ್ನಡ (Kannada)', nativeName: 'ಕನ್ನಡ' },
    // { code: 'bn', name: 'বাংলা (Bengali)', nativeName: 'বাংলা' },
    // { code: 'gu', name: 'ગુજરાતી (Gujarati)', nativeName: 'ગુજરાતી' }
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
  }, []);

  const changeLanguage = async (languageCode) => {
    if (languageCode === currentLanguage) return;

    setIsChanging(true);
    try {
      // Save preference
      localStorage.setItem('language', languageCode);
      
      // Update document language attribute
      document.documentElement.lang = languageCode;
      
      // For Lingo.dev with static bundles in production,
      // this would trigger a page reload or bundle switch
      // For development, translations are handled at build time
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
