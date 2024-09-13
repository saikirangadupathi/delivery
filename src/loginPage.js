import React, { useState } from 'react';
import axios from 'axios';
import logo from './logo.svg';
import BackgroundImage from './greenCyclelogo.png'

const LoginPage = ({ onLogin }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [age, setAge] = useState('');
  const [aadharId, setAadharId] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleCapacity, setVehicleCapacity] = useState('');
  const [location, setLocation] = useState('');

  const styles = {
    loginPage: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundImage: `url(${BackgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundColor: '#d6a4e4',
      fontFamily: 'Arial, sans-serif',
    },
    loginContainer: {
      textAlign: 'center',
      backgroundColor: '#d6a4e4',
      padding: '20px',
      borderRadius: '10px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    logo: {
      width: '100px',
      marginBottom: '20px',
    },
    heading: {
      color: '#fff',
      marginBottom: '20px',
      fontSize: '2rem',
    },
    inputGroup: {
      marginBottom: '15px',
      textAlign: 'left',
    },
    label: {
      display: 'block',
      color: '#000',
      marginBottom: '5px',
      fontSize: '1rem',
    },
    input: {
      width: 'calc(100% - 22px)',
      padding: '10px',
      border: 'none',
      borderRadius: '5px',
      fontSize: '1rem',
    },
    loginButton: {
      width: '100%',
      padding: '10px',
      border: 'none',
      borderRadius: '5px',
      backgroundColor: '#92e792',
      color: '#000',
      fontSize: '1rem',
      cursor: 'pointer',
      marginTop: '10px',
    },
    links: {
      marginTop: '20px',
    },
    link: {
      color: '#fff',
      textDecoration: 'none',
      fontSize: '0.9rem',
      marginRight: '10px',
      cursor: 'pointer',
    },
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post('https://recycle-backend-apao.onrender.com/api/agent_login', { username, password });
      const { token, id } = response.data; // Assuming the backend returns the agentId
      console.log('data..', response.data);
      localStorage.setItem('token', token);

      // Fetch agent info
      const agentResponse = await axios.get(`https://recycle-backend-apao.onrender.com/api/agents/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const agentInfo = agentResponse.data;
      localStorage.setItem('agentInfo', JSON.stringify(agentInfo));

      onLogin();
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Invalid credentials');
    }
  };

  const handleSignup = async () => {
    try {
      // Generate a unique ID based on the current date and time
      const generateUniqueId = () => {
        const timestamp = Date.now();
        const randomNum = Math.floor(Math.random() * 10000);
        return `agent${timestamp}${randomNum}`;
      };

      const agentId = generateUniqueId();

      const response = await axios.post('https://recycle-backend-apao.onrender.com/api/agent_signup', {
        id: agentId,
        name,
        age,
        contactNumber,
        username,
        password,
        aadharId,
        vehicleNumber,
        vehicleCapacity,
      });
      if (response.status === 201) {
        alert('Signup successful! Please log in.');
        setIsSignup(false);
      }
    } catch (error) {
      console.error('Error signing up:', error);
      alert('Signup failed');
    }
  };

  return (
    <div style={styles.loginPage}>
      <div style={styles.loginContainer}>
        {!isSignup ? (
          <>
            <div style={styles.inputGroup}>
              <label htmlFor="username" style={styles.label}>UserName</label>
              <input
                type="text"
                id="username"
                name="username"
                style={styles.input}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div style={styles.inputGroup}>
              <label htmlFor="password" style={styles.label}>Password</label>
              <input
                type="password"
                id="password"
                name="password"
                style={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button style={styles.loginButton} onClick={handleLogin}>Log In</button>
            <div style={styles.links}>
              <span style={styles.link} onClick={() => setIsSignup(true)}>Register</span> | <a href="/forgot-password" style={styles.link}>Forgot Password?</a>
            </div>
          </>
        ) : (
          <>
            <div style={styles.inputGroup}>
              <label htmlFor="name" style={styles.label}>Name</label>
              <input
                type="text"
                id="name"
                name="name"
                style={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div style={styles.inputGroup}>
              <label htmlFor="contactNumber" style={styles.label}>Contact Number</label>
              <input
                type="text"
                id="contactNumber"
                name="contactNumber"
                style={styles.input}
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
              />
            </div>
            <div style={styles.inputGroup}>
              <label htmlFor="age" style={styles.label}>Age</label>
              <input
                type="text"
                id="age"
                name="age"
                style={styles.input}
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>
            <div style={styles.inputGroup}>
              <label htmlFor="username" style={styles.label}>UserName</label>
              <input
                type="text"
                id="username"
                name="username"
                style={styles.input}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div style={styles.inputGroup}>
              <label htmlFor="password" style={styles.label}>Password</label>
              <input
                type="password"
                id="password"
                name="password"
                style={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div style={styles.inputGroup}>
              <label htmlFor="aadharId" style={styles.label}>Aadhar ID</label>
              <input
                type="text"
                id="aadharId"
                name="aadharId"
                style={styles.input}
                value={aadharId}
                onChange={(e) => setAadharId(e.target.value)}
              />
            </div>
            <div style={styles.inputGroup}>
              <label htmlFor="vehicleNumber" style={styles.label}>Vehicle Number</label>
              <input
                type="text"
                id="vehicleNumber"
                name="vehicleNumber"
                style={styles.input}
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
              />
            </div>
            <div style={styles.inputGroup}>
              <label htmlFor="vehicleCapacity" style={styles.label}>Vehicle Capacity</label>
              <input
                type="text"
                id="vehicleCapacity"
                name="vehicleCapacity"
                style={styles.input}
                value={vehicleCapacity}
                onChange={(e) => setVehicleCapacity(e.target.value)}
              />
            </div>
            <div style={styles.inputGroup}>
              <label htmlFor="location" style={styles.label}>Location</label>
              <input
                type="text"
                id="location"
                name="location"
                style={styles.input}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <button style={styles.loginButton} onClick={handleSignup}>Sign Up</button>
            <div style={styles.links}>
              <span style={styles.link} onClick={() => setIsSignup(false)}>Back to Login</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
