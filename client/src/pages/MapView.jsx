import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';
import api from '../services/api';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import './MapView.css';

// Fix default Leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const categoryColors = {
  charity: '#7BC67E', environment: '#5B9BD5', health: '#D46A6A',
  education: '#9B7ED4', community: '#E8C547', sports: '#D4845A',
  arts: '#D4845A', other: '#A09880',
};

function createCategoryIcon(category) {
  const color = categoryColors[category] || '#E8C547';
  return L.divIcon({
    className: 'map-marker',
    html: `<div style="width:32px;height:32px;background:${color};border:3px solid rgba(0,0,0,0.3);border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.4);"><div style="transform:rotate(45deg);font-size:14px;">${
      category === 'charity' ? '❤' : category === 'environment' ? '🌿' :
      category === 'health' ? '🏥' : category === 'education' ? '📚' :
      category === 'sports' ? '⚽' : '📍'
    }</div></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

export default function MapView() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [center, setCenter] = useState([28.6139, 77.209]); // Default: Delhi

  useEffect(() => {
    // Try geolocation
    navigator.geolocation?.getCurrentPosition(
      (pos) => setCenter([pos.coords.latitude, pos.coords.longitude]),
      () => {},
    );
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data } = await api.get('/events', { params: { limit: 50 } });
      setEvents(data.data.events);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="map-page">
      <MapContainer center={center} zoom={12} className="map-container" zoomControl={false}>
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {events.map((event) => {
          if (!event.location?.coordinates?.[0]) return null;
          return (
            <Marker
              key={event._id}
              position={[event.location.coordinates[1], event.location.coordinates[0]]}
              icon={createCategoryIcon(event.category)}
              eventHandlers={{ click: () => setSelectedEvent(event) }}
            >
              <Popup>
                <div style={{ color: '#1A1814', fontFamily: 'DM Sans', minWidth: 200 }}>
                  <h4 style={{ marginBottom: 4, fontFamily: 'Playfair Display' }}>{event.title}</h4>
                  <p style={{ fontSize: '0.82rem', color: '#5C5648', marginBottom: 4 }}>{event.location.address}</p>
                  <p style={{ fontSize: '0.78rem', color: '#5C5648' }}>
                    {new Date(event.dateTime).toLocaleDateString()} · {event.participants?.length || 0}/{event.capacity}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Bottom Sheet */}
      {selectedEvent && (
        <motion.div
          className="map-sheet"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          <div className="map-sheet__handle" onClick={() => setSelectedEvent(null)} />
          <div className="map-sheet__content">
            <Badge variant="default" size="sm">{selectedEvent.category}</Badge>
            <h3 className="map-sheet__title">{selectedEvent.title}</h3>
            <p className="map-sheet__meta">📍 {selectedEvent.location?.address}</p>
            <p className="map-sheet__meta">📅 {new Date(selectedEvent.dateTime).toLocaleDateString()}</p>
            <p className="map-sheet__meta">👥 {selectedEvent.participants?.length || 0}/{selectedEvent.capacity}</p>
            <p className="map-sheet__desc">{selectedEvent.description?.slice(0, 150)}...</p>
            <a href={`/events/${selectedEvent._id}`}>
              <Button variant="primary" fullWidth>View Details</Button>
            </a>
          </div>
        </motion.div>
      )}
    </div>
  );
}
