import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Shield, Globe, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Home = () => {
  const features = [
    {
      icon: AlertTriangle,
      title: 'Real-time Alerts',
      description: 'Get instant notifications about disasters near you from trusted sources'
    },
    {
      icon: Zap,
      title: 'AI Simplified',
      description: 'Complex disaster alerts translated into simple, actionable language'
    },
    {
      icon: Globe,
      title: 'Multilingual',
      description: 'Available in 8 Indian languages for maximum reach'
    },
    {
      icon: Shield,
      title: 'Safety First',
      description: 'Step-by-step safety instructions for every disaster type'
    }
  ];

  return (
    <div data-testid="home-page" className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
            Disaster Alerts Made Simple
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 mb-8 max-w-3xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
            AI-powered multilingual disaster alerts for everyone in India
          </p>
          <Link to="/alerts">
            <Button 
              size="lg" 
              data-testid="get-started-btn"
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              Get Started
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12" style={{ fontFamily: 'Playfair Display, serif' }}>
            Why ReadyIndia AI?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Stay Safe, Stay Informed</h2>
          <p className="text-lg mb-8 opacity-90">Join thousands using ReadyIndia AI for disaster preparedness</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/alerts">
              <Button 
                size="lg" 
                data-testid="view-alerts-cta"
                className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-6 rounded-full shadow-lg"
              >
                View Alerts
              </Button>
            </Link>
            <Link to="/explain">
              <Button 
                size="lg" 
                variant="outline"
                data-testid="explain-alert-cta"
                className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 rounded-full"
              >
                Explain an Alert
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
