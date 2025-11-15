import React from 'react';
import { Github, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer data-testid="footer" className="bg-gray-900 text-white py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-3">ReadyIndia AI</h3>
            <p className="text-gray-400 text-sm">Your AI-powered disaster alert and response platform for India</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/alerts" className="hover:text-white">View Alerts</a></li>
              <li><a href="/explain" className="hover:text-white">Explain Alert</a></li>
              <li><a href="/settings" className="hover:text-white">Settings</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Data Sources</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>USGS Earthquake Data</li>
              <li>GDACS Global Alerts</li>
              <li>INCOIS Tsunami Warnings</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>© 2025 ReadyIndia AI. Built with <Heart className="inline w-4 h-4 text-red-500" /> for India</p>
          <p>Powered by Gemini AI</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
