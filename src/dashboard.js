import React, { useState, useEffect, useRef } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { FaCalendarAlt } from 'react-icons/fa';
import axios from 'axios';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { Switch, Select } from 'antd';

const { Option } = Select;

Modal.setAppElement('#root');

const Dashboard = () => {
  const [date, setDate] = useState(new Date());
  const [collections, setCollections] = useState([]);
  const [currentOrders, setCurrentOrders] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [mapView, setMapView] = useState(false);
  const [agentLocation, setAgentLocation] = useState(null);
  const [paidAmounts, setPaidAmounts] = useState([]);
  const [settingsModalIsOpen, setSettingsModalIsOpen] = useState(false);
  const [profileModalIsOpen, setProfileModalIsOpen] = useState(false);
  const [status, setStatus] = useState('inactive');
  const [deliveryType, setDeliveryType] = useState('pickup');
  const [destination, setDestination] = useState({ latitude: '', longitude: '' });
  const [isMoving, setIsMoving] = useState(false);
  const navigate = useNavigate();
  const movementIntervalRef = useRef(null);

  const styles = {
    container: {
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#DFF5E1',
      height: '100vh',
      padding: '20px',
      boxSizing: 'border-box',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#9C27B0',
      padding: '10px 20px',
      borderRadius: '5px',
      color: 'white',
      marginBottom: '20px',
    },
    logo: {
      fontSize: '24px',
      fontWeight: 'bold',
    },
    nav: {
      display: 'flex',
      gap: '20px',
    },
    link: {
      color: 'white',
      textDecoration: 'none',
      fontSize: '18px',
      cursor: 'pointer',
    },
    section: {
      marginBottom: '20px',
    },
    sectionTitle: {
      fontSize: '20px',
      color: '#9C27B0',
      marginBottom: '10px',
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '10px',
      padding: '20px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      marginBottom: '20px',
    },
    pickupCard: {
      backgroundColor: '#E1BEE7',
      borderRadius: '10px',
      padding: '20px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      marginBottom: '10px',
    },
    name: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#333',
    },
    timeAddress: {
      fontSize: '16px',
      color: '#555',
    },
    button: {
      padding: '10px 20px',
      backgroundColor: '#8ce08a',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      marginTop: '10px',
    },
    calendarIcon: {
      cursor: 'pointer',
      fontSize: '24px',
      color: '#9C27B0',
      marginBottom: '10px',
    },
    modalContent: {
      backgroundColor: 'white',
      padding: '10px',
      borderRadius: '10px',
      width: '400px',
      height: '60%',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    },
    modalHeader: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '10px',
    },
    modalButton: {
      padding: '10px 20px',
      backgroundColor: '#8ce08a',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      marginTop: '10px',
    },
    closeButton: {
      padding: '10px 10px',
      backgroundColor: '#f58a8a',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      position: 'absolute',
      top: '7px',
      right: '10px',
    },
    mapContainer: {
      height: '400px',
      marginTop: '20px',
    },
    inputContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    },
    inputLabel: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#333',
    },
    inputField: {
      padding: '10px',
      borderRadius: '5px',
      border: '1px solid #ccc',
    },
    completedCard: {
      backgroundColor: '#F5F5F5',
      borderRadius: '10px',
      padding: '20px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      marginBottom: '10px',
    },
    settingsRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    switch: {
      marginLeft: '10px',
      width: 'auto',
    },

    inputField: {
      padding: '10px',
      borderRadius: '5px',
      border: '1px solid #ccc',
      width: '100%',
    },
    modalButton: {
      padding: '10px 20px',
      backgroundColor: '#8ce08a',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      marginTop: '10px',
    },
    closeButton: {
      padding: '10px 10px',
      backgroundColor: '#f58a8a',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      position: 'absolute',
      top: '7px',
      right: '10px',
    },
    inputLabel: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#333',
    },
    disabledButton: {
      padding: '10px 20px',
      backgroundColor: '#ccc',
      border: 'none',
      borderRadius: '5px',
      cursor: 'not-allowed',
      marginTop: '10px',
    },
  
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setAgentLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Error getting current location: ", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }

    // Fetch current orders on component mount
    fetchCurrentOrders();
  }, []);

  const handleDateChange = (selectedDate) => {
    setDate(selectedDate);
    fetchCollectionsByDate(selectedDate);
  };

  const fetchCollectionsByDate = async (selectedDate) => {
    try {
      const formattedDate = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
      const response = await axios.get(`https://recycle-backend-apao.onrender.com/getorders?date=${formattedDate}`);
      const data = response.data.orderslist;
      const collections = Array.isArray(data) ? data.map(order => {
        let location = { lat: 0, lng: 0 };
        try {
          location = JSON.parse(order.location);
        } catch (e) {
          console.error("Invalid location JSON:", order.location);
        }
        return {
          id: order._id,
          username: order.name,
          date: order.schedulePickup,
          address: location,
          totalWeight: order.totalWeight,
          contact: order.contact,
          cart: order.cart,
          status: order.status
        };
      }) : [];

      setCollections(collections);
    } catch (error) {
      console.error("Error fetching collections:", error);
    }
  };

  // Function to fetch current orders with status 'scheduled'
  const fetchCurrentOrders = async () => {
    try {
      const agentInfo = JSON.parse(localStorage.getItem('agentInfo'));
      const agentId = agentInfo?.id;

      const response = await axios.get('https://recycle-backend-apao.onrender.com/api/pickuptracking');
      const orders = response.data.orderslist;

      const filteredOrders = orders.filter(order => order.status === 'scheduled' && order.agentId === agentId);

      setCurrentOrders(filteredOrders);
    } catch (error) {
      console.error("Error fetching current orders:", error);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const updateAgentLocation = async (lat, lng) => {
    try {
      const agentInfo = JSON.parse(localStorage.getItem('agentInfo'));
      const agentId = agentInfo?.id;

      await axios.put(`https://recycle-backend-apao.onrender.com/api/agents/${agentId}/location`, {
        latitudes: lat,
        longitudes: lng,
      });

      setAgentLocation([lat, lng]);
    } catch (error) {
      console.error('Error updating agent location:', error);
    }
  };

  const handleStartMoving = () => {
    if (!destination.latitude || !destination.longitude) {
      alert('Please enter valid latitude and longitude');
      return;
    }

    if (agentLocation) {
      const distance = calculateDistance(
        agentLocation[0],
        agentLocation[1],
        parseFloat(destination.latitude),
        parseFloat(destination.longitude)
      );
      const duration = distance / 30; // Duration in seconds for 30 meters per second

      const latDiff = (parseFloat(destination.latitude) - agentLocation[0]) / duration;
      const lngDiff = (parseFloat(destination.longitude) - agentLocation[1]) / duration;

      let currentLat = agentLocation[0];
      let currentLng = agentLocation[1];
      let elapsed = 0;

      setIsMoving(true);

      movementIntervalRef.current = setInterval(() => {
        if (elapsed < duration) {
          currentLat += latDiff;
          currentLng += lngDiff;
          elapsed += 1;

          updateAgentLocation(currentLat, currentLng);
          
          if (calculateDistance(currentLat, currentLng, destination.latitude, destination.longitude) < 10) {
            clearInterval(movementIntervalRef.current);
            setIsMoving(false);
            updateAgentLocation(parseFloat(destination.latitude), parseFloat(destination.longitude));
          }
        } else {
          clearInterval(movementIntervalRef.current);
          setIsMoving(false);
        }
      }, 1000);
    }
  };

  const handleStopMoving = () => {
    clearInterval(movementIntervalRef.current);
    setIsMoving(false);
  };

  const handleStartPickup = async (collection) => {
    if (collection) {
      try {
        const response = await axios.post('https://recycle-backend-apao.onrender.com/startpickup', {
          id: collection.id,
          status: 'inProgress'
        });
        if (response.status === 200) {
          setCollections(prevCollections => prevCollections.map(col =>
            col.id === collection.id ? { ...col, status: 'inProgress' } : col
          ));
          setSelectedCollection(collection);
          setPaidAmounts(collection.cart.map(() => '0')); // Initialize the amounts with default value '0'
          setMapView(true);
          setModalIsOpen(true);
        }
      } catch (error) {
        console.error("Error starting pickup:", error);
      }
    }
  };

  const handleCompleteOrder = async () => {
    if (selectedCollection) {
      try {
        const updatedItems = selectedCollection.cart.map((item, index) => ({
          ...item,
          paidAmnt: paidAmounts[index],
        }));
        console.log('itemms..',updatedItems)
        const response = await axios.put('https://recycle-backend-apao.onrender.com/completepickup', {
          id: selectedCollection.id,
          status: 'completed',
          items: updatedItems
        });
        if (response.status === 200) {
          setCollections(prevCollections => prevCollections.map(col =>
            col.id === selectedCollection.id ? { ...col, status: 'completed', items: updatedItems } : col
          ));
          setModalIsOpen(false);
        }
      } catch (error) {
        console.error("Error completing pickup:", error);
      }
    }
  };

  const handleAmountChange = (index, value) => {
    const newAmounts = [...paidAmounts];
    newAmounts[index] = value;
    setPaidAmounts(newAmounts);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedCollection(null);
    setMapView(false);
  };

  const closeSettingsModal = () => {
    setSettingsModalIsOpen(false);
  };

  const handleStatusChange = (checked) => {
    setStatus(checked ? 'active' : 'inactive');
  };

  const handleDeliveryTypeChange = (value) => {
    setDeliveryType(value);
  };

  const handleUpdateSettings = async () => {
    try {
      const agentInfo = JSON.parse(localStorage.getItem('agentInfo'));
      const agentId = agentInfo.id;

      const response = await axios.put(`https://recycle-backend-apao.onrender.com/api/agents/${agentId}/settings`, {
        agentStatus: status,
        type: deliveryType,
      });

      if (response.status === 200) {
        console.log('Settings updated:', response.data);
        closeSettingsModal();
      }
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const tileDisabled = ({ date }) => {
    const today = new Date();
    return date < today.setHours(0, 0, 0, 0);
  };

  const RoutingMachine = ({ agentLocation, customerLocation }) => {
    const map = useMap();
    const routingControlRef = useRef(null);

    useEffect(() => {
      if (agentLocation && customerLocation) {
        const routingControl = L.Routing.control({
          waypoints: [
            L.latLng(agentLocation[0], agentLocation[1]),
            L.latLng(customerLocation.lat, customerLocation.lng)
          ],
          routeWhileDragging: true,
        }).addTo(map);

        routingControlRef.current = routingControl;

        return () => {
          if (routingControlRef.current) {
            map.removeControl(routingControlRef.current);
          }
        };
      }
    }, [agentLocation, customerLocation, map]);

    return null;
  };

  const completedCollections = collections.filter(collection => collection.status === 'completed');
  const activeCollections = collections.filter(collection => collection.status !== 'completed');

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.logo}>Logo</div>
        <nav style={styles.nav}>
          <span style={styles.link} onClick={() => setProfileModalIsOpen(true)}>Profile</span>
          <span style={styles.link} onClick={() => setSettingsModalIsOpen(true)}>Settings</span>
        </nav>
      </div>
      <div style={styles.section}>
        <FaCalendarAlt style={styles.calendarIcon} onClick={() => setModalIsOpen(true)} />
        <h2 style={styles.sectionTitle}>Today's Schedule</h2>
        <div style={styles.card}>
          <h3>List of Pickups</h3>
          {activeCollections.map((collection) => (
            <div key={collection.id} style={styles.pickupCard}>
              <p style={styles.name}>Name: {collection.username}</p>
              <p style={styles.timeAddress}>Time: {new Date(collection.date).toLocaleTimeString()} - Address: {collection.address.lat}, {collection.address.lng}</p>
              
              <button style={styles.button} onClick={() => handleStartPickup(collection)}>Start</button>
              
            </div>
          ))}
        </div>
      </div>

      {/* Current Orders Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Current Orders</h2>
        <div style={styles.card}>
          <h3>List of Current Orders</h3>
          {currentOrders.length === 0 ? (
            <p>No current orders scheduled.</p>
          ) : (
            currentOrders.map((order) => (
              <div key={order.id} style={styles.pickupCard}>
                <p style={styles.name}>Name: {order.username}</p>
                <p style={styles.timeAddress}>Time: {new Date(order.schedulePickup).toLocaleTimeString()} - Address: {order.address.lat}, {order.address.lng}</p>
                <button style={styles.button} onClick={() => handleStartPickup(order)}>Start</button>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Completed Orders</h2>
        <div style={styles.card}>
          {completedCollections.map((collection) => (
            <div key={collection.id} style={styles.completedCard}>
              <h3>User Info</h3>
              <p>Name: {collection.username}</p>
              <p>Contact: {collection.contact}</p>
              <h3>Pickup Information</h3>
              <p>Address: {collection.address.lat}, {collection.address.lng}</p>
              <p>Scheduled Time: {new Date(collection.date).toLocaleTimeString()}</p>
              <p>Recyclables / Weight: {collection.totalWeight}</p>
              <h3>Amount Paid</h3>
              <ul>
                {collection.cart.map((item, index) => (
                  <li key={index}>
                    {item.name} ({item.quantity} * 1kg) - Price: {item.paidAmnt}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Notifications</h2>
        <div style={styles.card}>
          <p>-- New Pickup Assigned</p>
          <p>-- Schedule Change</p>
        </div>
      </div>
      {modalIsOpen && (
        <Modal isOpen={modalIsOpen} onRequestClose={closeModal} contentLabel="Pickup Details" style={{ content: styles.modalContent }}>
          <button style={styles.closeButton} onClick={closeModal}>X</button>
          {selectedCollection ? (
            <>
              <h2 style={styles.modalHeader}>Pickup Details</h2>
              <div>
                <h3>User Info</h3>
                <p>Name: {selectedCollection.username}</p>
                <p>Contact: {selectedCollection.contact}</p>
                <h3>Pickup Information</h3>
                <p>Address: {selectedCollection.address.lat}, {selectedCollection.address.lng}</p>
                <p>Scheduled Time: {new Date(selectedCollection.date).toLocaleTimeString()}</p>
                <p>Recyclables / Weight: {selectedCollection.totalWeight}</p>
                {selectedCollection.status === 'inProgress' ? (
                  <div style={styles.inputContainer}>
                    <h3>Amount Paid</h3>
                    {selectedCollection.cart.map((item, index) => (
                      <div key={index}>
                        <label style={styles.inputLabel}>{item.name}:</label>
                        <input
                          type="number"
                          value={paidAmounts[index] || '0'} // Ensure input is controlled
                          onChange={(e) => handleAmountChange(index, e.target.value)}
                          style={styles.inputField}
                          required
                        />
                      </div>
                    ))}
                  </div>
                ) : ('')}
              </div>
              {selectedCollection.status === 'inProgress' ? (
                <button style={styles.modalButton} onClick={handleCompleteOrder} disabled={paidAmounts.some(amount => amount === '')}>Complete Order</button>
              ) : (
                <button style={styles.modalButton} onClick={() => handleStartPickup(selectedCollection)}>Start Pickup</button>
              )}
              <button style={styles.modalButton} onClick={() => alert('Contact User')}>Contact User</button>
              <button style={styles.modalButton} onClick={() => alert('Report Issue')}>Report Issue</button>
              {mapView && agentLocation && selectedCollection && (
                <div style={styles.mapContainer}>
                  <MapContainer center={agentLocation} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={agentLocation}>
                      <Popup>Agent Location</Popup>
                    </Marker>
                    <Marker position={[selectedCollection.address.lat, selectedCollection.address.lng]}>
                      <Popup>Customer Location</Popup>
                    </Marker>
                    <RoutingMachine agentLocation={agentLocation} customerLocation={selectedCollection.address} />
                  </MapContainer>
                </div>
              )}
            </>
          ) : (
            <Calendar
              onChange={handleDateChange}
              value={date}
              tileDisabled={tileDisabled}
            />
          )}
        </Modal>
      )}

      {profileModalIsOpen && (
        <Modal isOpen={profileModalIsOpen} onRequestClose={() => setProfileModalIsOpen(false)} contentLabel="Profile" style={{ content: styles.modalContent }}>
          <button style={styles.closeButton} onClick={() => setProfileModalIsOpen(false)}>X</button>
          <h2 style={styles.modalHeader}>Enter Destination</h2>
          <div style={styles.inputContainer}>
            <label style={styles.inputLabel}>Latitude:</label>
            <input
              type="number"
              value={destination.latitude}
              onChange={(e) => setDestination({ ...destination, latitude: e.target.value })}
              style={styles.inputField}
              required
            />
            <label style={styles.inputLabel}>Longitude:</label>
            <input
              type="number"
              value={destination.longitude}
              onChange={(e) => setDestination({ ...destination, longitude: e.target.value })}
              style={styles.inputField}
              required
            />
          </div>
          <button
            style={destination.latitude && destination.longitude ? styles.modalButton : styles.disabledButton}
            onClick={handleStartMoving}
            disabled={!destination.latitude || !destination.longitude || isMoving}
          >
            Start Moving
          </button>
          <button
            style={isMoving ? styles.modalButton : styles.disabledButton}
            onClick={handleStopMoving}
            disabled={!isMoving}
          >
            Stop
          </button>
        </Modal>
      )}


      {settingsModalIsOpen && (
        <Modal isOpen={settingsModalIsOpen} onRequestClose={closeSettingsModal} contentLabel="Settings" style={{ content: styles.modalContent }}>
          <button style={styles.closeButton} onClick={closeSettingsModal}>X</button>
          <h2 style={styles.modalHeader}>Choose Settings</h2>
          <div style={styles.inputContainer}>
            <div style={styles.settingsRow}>
              <label style={styles.inputLabel}>Status:</label>
              <Switch
                checked={status === 'active'}
                onChange={handleStatusChange}
                checkedChildren="Active"
                unCheckedChildren="Inactive"
                style={{ ...styles.switch, backgroundColor: status === 'active' ? 'green' : 'red' }}
              />
            </div>
            <label style={styles.inputLabel}>Delivery Type:</label>
            <Select value={deliveryType} onChange={handleDeliveryTypeChange} style={{ width: '100%' }}>
              <Option value="pickup">Pickup</Option>
              <Option value="e_commerce">E-commerce</Option>
              <Option value="both">Both</Option>
            </Select>
          </div>
          <button style={styles.modalButton} onClick={handleUpdateSettings}>Update</button>
          <button style={styles.modalButton} onClick={handleLogout}>Log Out</button>
        </Modal>
      )}
    </div>
  );
};

export default Dashboard;
