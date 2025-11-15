import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { AlertTriangle, MapPin, Clock, ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import MapComponent from '../components/MapComponent';
import { Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AlertDetail = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentLang = i18n.language;

  useEffect(() => {
    fetchAlert();
  }, [id]);

  const fetchAlert = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/alerts/${id}`);
      setAlert(response.data);
    } catch (error) {
      console.error('Error fetching alert:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-red-600',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-blue-500'
    };
    return colors[severity] || colors.medium;
  };

  const getTranslatedContent = () => {
    if (currentLang !== 'en' && alert.languages && alert.languages[currentLang]) {
      return {
        summary: alert.languages[currentLang].simple || alert.ai_summary,
        steps: alert.languages[currentLang].steps || alert.ai_steps
      };
    }
    return {
      summary: alert.ai_summary || alert.raw_text,
      steps: alert.ai_steps || []
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Alert not found</p>
      </div>
    );
  }

  const { summary, steps } = getTranslatedContent();

  return (
    <div data-testid="alert-detail-page" className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/alerts">
          <Button variant="ghost" className="mb-6" data-testid="back-to-alerts">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Alerts
          </Button>
        </Link>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-start mb-4">
              <CardTitle className="text-3xl flex items-center space-x-3">
                <AlertTriangle className="w-8 h-8 text-orange-600" />
                <span className="capitalize">{alert.type.replace('_', ' ')}</span>
              </CardTitle>
              <Badge className={`${getSeverityColor(alert.severity)} text-white text-lg px-4 py-2`}>
                {t(alert.severity)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Summary</h3>
                <p className="text-gray-700 leading-relaxed">{summary}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="w-5 h-5" />
                  <span><strong>Location:</strong> {alert.location}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Clock className="w-5 h-5" />
                  <span><strong>Time:</strong> {new Date(alert.created_at).toLocaleString()}</span>
                </div>
                {alert.magnitude && (
                  <div className="text-gray-600">
                    <strong>Magnitude:</strong> {alert.magnitude}
                  </div>
                )}
                <div className="text-gray-600">
                  <strong>Source:</strong> {alert.source}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Safety Steps */}
        {steps && steps.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-green-600" />
                <span>{t('safetySteps')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {steps.map((step, index) => (
                  <AccordionItem key={index} value={`step-${index}`}>
                    <AccordionTrigger data-testid={`safety-step-${index}`}>
                      Step {index + 1}
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-gray-700">{step}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        )}

        {/* Map */}
        {alert.latitude && alert.longitude && (
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent>
              <MapComponent 
                alerts={[alert]} 
                center={[alert.latitude, alert.longitude]} 
                zoom={8} 
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AlertDetail;
