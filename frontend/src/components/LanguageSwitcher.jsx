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
    { code: 'en', name: 'EN', nativeName: 'English', fullName: 'English' },
    { code: 'hi', name: 'हि', nativeName: 'हिंदी', fullName: 'हिंदी (Hindi)' },
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
    <div data-testid="language-switcher" className="flex items-center space-x-1">
      <Globe className="w-4 h-4 text-white md:text-gray-600" />
      <Select 
        value={currentLanguage} 
        onValueChange={changeLanguage}
        disabled={isChanging}
      >
        <SelectTrigger data-testid="language-select" className="w-16 md:w-20 text-white md:text-gray-900 border-white/30 md:border-gray-300 text-sm">
          <SelectValue placeholder="EN" />
        </SelectTrigger>
        <SelectContent>
          {languages.map(lang => (
            <SelectItem 
              key={lang.code} 
              value={lang.code} 
              data-testid={`lang-option-${lang.code}`}
            >
              {lang.fullName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSwitcher;
