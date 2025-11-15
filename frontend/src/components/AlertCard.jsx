import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, MapPin, Clock } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const AlertCard = ({ alert }) => {
  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-red-600 hover:bg-red-700',
      high: 'bg-orange-500 hover:bg-orange-600',
      medium: 'bg-yellow-500 hover:bg-yellow-600',
      low: 'bg-blue-500 hover:bg-blue-600'
    };
    return colors[severity] || colors.medium;
  };

  const getDisplayText = () => {
    return alert.ai_summary || alert.raw_text;
  };

  const severityLabels = {
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low'
  };

  return (
    <Link to={`/alerts/${alert.id}`} data-testid={`alert-card-${alert.id}`}>
      <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <span className="capitalize">{alert.type.replace('_', ' ')}</span>
            </CardTitle>
            <Badge 
              data-testid={`alert-severity-${alert.severity}`}
              className={`${getSeverityColor(alert.severity)} text-white`}
            >
              {severityLabels[alert.severity]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-4 line-clamp-2">{getDisplayText()}</p>
          <div className="flex flex-col space-y-2 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>{alert.location}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>{new Date(alert.created_at).toLocaleString()}</span>
            </div>
            {alert.magnitude && (
              <div className="text-sm">
                <span className="font-semibold">Magnitude:</span> {alert.magnitude}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default AlertCard;