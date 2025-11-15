import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapComponent = ({ alerts, center = [20.5937, 78.9629], zoom = 5 }) => {
  return (
    <div data-testid="map-component" className="h-96 rounded-lg overflow-hidden shadow-lg">
      <MapContainer center={center} zoom={zoom} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {alerts && alerts.map(alert => {
          if (alert.latitude && alert.longitude) {
            return (
              <Marker 
                key={alert.id} 
                position={[alert.latitude, alert.longitude]}
                data-testid={`map-marker-${alert.id}`}
              >
                <Popup>
                  <div className="text-sm">
                    <h3 className="font-bold capitalize">{alert.type}</h3>
                    <p className="text-xs text-gray-600">{alert.location}</p>
                    <p className="text-xs mt-1">{alert.ai_summary || alert.raw_text}</p>
                  </div>
                </Popup>
              </Marker>
            );
          }
          return null;
        })}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
