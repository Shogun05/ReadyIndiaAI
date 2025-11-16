import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Explain = () => {
  const { t } = useTranslation();
  const [alertText, setAlertText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSimplify = async () => {
    if (!alertText.trim()) {
      toast.error(t('pasteAlert'));
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${BACKEND_URL}/api/ai/simplify`, {
        text: alertText
      });
      setResult(response.data);
      toast.success(t('alertSimplified'));
    } catch (error) {
      console.error('Error simplifying alert:', error);
      toast.error(t('failedSimplify'));
    } finally {
      setLoading(false);
    }
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'mr', name: 'Marathi' },
    { code: 'ta', name: 'Tamil' },
    { code: 'te', name: 'Telugu' },
    { code: 'kn', name: 'Kannada' },
    { code: 'bn', name: 'Bengali' },
    { code: 'gu', name: 'Gujarati' }
  ];

  return (
    <div data-testid="explain-page" className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            {t('explainAlertTitle')}
          </h1>
          <p className="text-gray-600">{t('explainAlertDesc')}</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t('enterAlertText')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              data-testid="alert-input"
              placeholder={t('alertPlaceholder')}
              value={alertText}
              onChange={(e) => setAlertText(e.target.value)}
              rows={6}
              className="w-full"
            />
            <Button 
              onClick={handleSimplify}
              disabled={loading}
              data-testid="simplify-btn"
              className="bg-orange-600 hover:bg-orange-700 text-white w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('processing')}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {t('simplify')}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card data-testid="result-card">
            <CardHeader>
              <CardTitle>{t('simplifiedAlert')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="en" className="w-full">
                <TabsList className="grid grid-cols-4 sm:grid-cols-8 mb-4">
                  {languages.map(lang => (
                    <TabsTrigger key={lang.code} value={lang.code} data-testid={`lang-tab-${lang.code}`}>
                      {lang.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="en" className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Summary</h3>
                    <p className="text-gray-700 leading-relaxed">{result.simple}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Safety Steps</h3>
                    <ol className="list-decimal list-inside space-y-2">
                      {result.steps.map((step, index) => (
                        <li key={index} className="text-gray-700" data-testid={`step-en-${index}`}>{step}</li>
                      ))}
                    </ol>
                  </div>
                </TabsContent>

                {Object.entries(result.translations || {}).map(([lang, content]) => (
                  <TabsContent key={lang} value={lang} className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Summary</h3>
                      <p className="text-gray-700 leading-relaxed">{content.simple}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Safety Steps</h3>
                      <ol className="list-decimal list-inside space-y-2">
                        {content.steps.map((step, index) => (
                          <li key={index} className="text-gray-700" data-testid={`step-${lang}-${index}`}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Explain;
