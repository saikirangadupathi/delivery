import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useGeolocated } from 'react-geolocated';
import 'leaflet/dist/leaflet.css';
import { Input, Button } from 'antd';
import { AimOutlined, SearchOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import axios from 'axios';

const LocationMarker = ({ setLocation }) => {
  const map = useMapEvents({
    moveend() {
      const center = map.getCenter();
      setLocation(center);
    },
  });

  return null;
};

const deviceIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [30, 25],
  iconAnchor: [7.5, 7.5],
  className: 'device-location-marker',
});

const LocationPicker = ({ onConfirmLocation }) => {
  const [location, setLocation] = useState(null);
  const [deviceLocation, setDeviceLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [enablePickUp, setEnablePickUp] = useState(false);
  const navigate = useNavigate();
  const mapRef = useRef(null);

  const { coords, isGeolocationAvailable, isGeolocationEnabled } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: true,
    },
    userDecisionTimeout: 5000,
  });

  useEffect(() => {
    if (coords) {
      const newLocation = { lat: coords.latitude, lng: coords.longitude };
      setLocation(newLocation);
      setDeviceLocation(newLocation);
    }
  }, [coords]);

  const handleSearch = (value) => {
    setAddress(value);
    // Implement address search and update location based on the address
  };

  const handleCurrentLocation = () => {
    if (coords) {
      const newLocation = { lat: coords.latitude, lng: coords.longitude };
      setLocation(newLocation);
      setDeviceLocation(newLocation);
      const map = mapRef.current;
      if (map) {
        map.setView(newLocation, map.getZoom());
      }
    }
  };

  const handleEnablePickUp = () => {
    setEnablePickUp(!enablePickUp);
  };

  const handleConfirmLocation = async () => {
    if (typeof onConfirmLocation === 'function') {
      onConfirmLocation(location);
    }
    setEnablePickUp(false);

    // Save the location value in localStorage
    localStorage.setItem('location', JSON.stringify(location));

    // Retrieve the agent ID from local storage
    const agentInfo = JSON.parse(localStorage.getItem('agentInfo'));
    const agentId = agentInfo.id;

     // Convert lat and lng to strings
    const latitudes = String(location.lat);
    const longitudes = String(location.lng);

    // Post or put location data into backend
    try {
      const response = await axios.put(`https://recycle-backend-apao.onrender.com/api/agents/${agentId}/location`, {
        latitudes,
        longitudes,
      });
      console.log('Location updated:', response.data);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating location:', error);
    }

     // Navigate to the dashboard after confirming location
  }; 

  const customIcon = new L.Icon({
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    shadowSize: [41, 41],
  });

  const pulseStyle = {
    width: '20px',
    height: '20px',
    border: '5px solid rgba(0, 150, 0, 0.5)',
    borderRadius: '50%',
    backgroundColor: 'rgba(0, 150, 0, 0.5)',
    position: 'absolute',
    top: 'calc(50% - 15px)', // Center the pulse effect
    left: 'calc(50% - 15px)', // Center the pulse effect
    animation: 'pulse 1.5s infinite',
  };

  const mapCenter = location ? [location.lat, location.lng] : [17.366, 78.476];

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <div style={styles.searchContainer}>
        <Input
          placeholder="Search for area, street name"
          prefix={<SearchOutlined />}
          value={address}
          onChange={(e) => handleSearch(e.target.value)}
          style={styles.searchInput}
        />
      </div>
      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ width: '100%', height: 'calc(100vh - 200px)' }}
        whenCreated={(mapInstance) => {
          mapRef.current = mapInstance;
          setTimeout(() => {
            mapInstance.invalidateSize();
            if (location) {
              mapInstance.setView(location, mapInstance.getZoom());
            }
          }, 0);
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {deviceLocation && (
          <Marker position={deviceLocation} icon={deviceIcon} />
        )}
        <LocationMarker setLocation={setLocation} />
      </MapContainer>
      <div style={styles.centerMarker}>
        <img
          src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png"
          alt="center marker"
          style={{ width: '25px', height: '41px' }}
        />
      </div>
      {deviceLocation && (
        <div style={{ ...styles.customDeviceIcon, ...pulseStyle }} />
      )}
      <div style={{ padding: '10px', backgroundColor: '#fff' }}>
        <Button
          type="primary"
          icon={<AimOutlined />}
          onClick={handleCurrentLocation}
          disabled={!isGeolocationAvailable || !isGeolocationEnabled}
          style={{ marginBottom: '10px' }}
        >
          Current Location
        </Button>
        <Button
          type={enablePickUp ? "primary" : "default"}
          icon={<EnvironmentOutlined />}
          onClick={handleEnablePickUp}
          style={{ marginBottom: '10px', marginLeft: '10px' }}
        >
          {enablePickUp ? 'Disable Pick-up' : 'Pick-up on Map'}
        </Button>
        <Button
          type="primary"
          onClick={handleConfirmLocation}
          style={{ marginBottom: '10px', marginLeft: '10px' }}
          disabled={!location}
        >
          Confirm Location
        </Button>
      </div>
    </div>
  );
};

const styles = {
  searchContainer: {
    position: 'absolute',
    top: '30px',
    width: 'calc(100% - 40px)',
    left: '20px',
    right: '20px',
    zIndex: 1000,
  },
  searchInput: {
    width: '85%',
    padding: '10px',
    borderRadius: '50px', // "Island" shape
    border: '1px solid #ccc',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  centerMarker: {
    position: 'absolute',
    top: 'calc(50% - 20.5px)', // Center the marker icon
    left: 'calc(50% - 12.5px)', // Center the marker icon
    pointerEvents: 'none', // Allow clicks to pass through to the map
    zIndex: 1000, // Ensure the marker is above the map
  },
  deviceLocationMarker: {
    position: 'absolute',
    top: 'calc(50% - 20.5px)', // Center the pulse effect
    left: 'calc(50% - 20.5px)', // Center the pulse effect
    pointerEvents: 'none', // Allow clicks to pass through to the map
    zIndex: 999, // Ensure the pulse effect is above the map but below the marker
  },
  '@keyframes pulse': {
    '0%': {
      transform: 'scale(0.5)',
      opacity: 0.8,
    },
    '100%': {
      transform: 'scale(2.5)',
      opacity: 0,
    },
  },
};

export default LocationPicker;
