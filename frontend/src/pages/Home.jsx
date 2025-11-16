import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Shield, Globe, Zap, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Home = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: AlertTriangle,
      title: t('realTimeAlerts'),
      description: t('instantNotifications')
    },
    {
      icon: Users,
      title: 'Crowd Safety',
      description: 'Real-time crowd density monitoring to prevent stampedes and ensure public safety'
    },
    {
      icon: Zap,
      title: t('aiSimplified'),
      description: t('complexTranslated')
    },
    {
      icon: Globe,
      title: t('multilingual'),
      description: t('availableLanguages')
    },
    {
      icon: Shield,
      title: t('safetyFirst'),
      description: t('steppByStepInstructions')
    }
  ];

  return (
    <div data-testid="home-page" className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
            {t('heroTitle')}
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 mb-8 max-w-3xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
            {t('heroSubtitle')}
          </p>
          <Link to="/alerts">
            <Button 
              size="lg" 
              data-testid="get-started-btn"
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              {t('getAlerts')}
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12" style={{ fontFamily: 'Playfair Display, serif' }}>
            {t('whyReadyIndia')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                data-testid={`feature-card-${index}`}
                className="bg-gradient-to-br from-white to-orange-50 p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-orange-100"
              >
                <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-orange-600 to-red-600 py-16 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>{t('stayInformed')}</h2>
          <p className="text-lg mb-8 opacity-90">{t('joinThousands')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/alerts">
              <Button 
                size="lg" 
                data-testid="view-alerts-cta"
                className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-6 rounded-full shadow-lg"
              >
                {t('viewAlerts')}
              </Button>
            </Link>
            <Link to="/crowd-monitor">
              <Button 
                size="lg" 
                variant="outline"
                data-testid="crowd-monitor-cta"
                className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 rounded-full"
              >
                <Users className="w-5 h-5 mr-2" />
                Crowd Safety
              </Button>
            </Link>
            <Link to="/explain">
              <Button 
                size="lg" 
                variant="outline"
                data-testid="explain-alert-cta"
                className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 rounded-full"
              >
                {t('explainAnAlert')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
