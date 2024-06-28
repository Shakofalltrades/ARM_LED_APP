import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Container,
  CssBaseline,
  Paper,
  Grid,
  Typography,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import './SensorMonitoring.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1a73e8',
    },
    secondary: {
      main: '#f50057',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

function SensorMonitoring({ setActivePage }) {
  const [nodes, setNodes] = useState([]);
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket('ws://192.168.1.214:8081');

    ws.current.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    ws.current.onmessage = (event) => {
      console.log('Message from server:', event.data);
      const message = JSON.parse(event.data);

      if (message.temperature !== undefined || message.humidity !== undefined) {
        setNodes((prevNodes) => {
          const nodeIndex = prevNodes.findIndex((node) => node.nodeId === message.nodeId);

          if (nodeIndex !== -1) {
            const updatedNodes = [...prevNodes];
            if (message.temperature !== undefined) {
              updatedNodes[nodeIndex].temperature = message.temperature;
            }
            if (message.humidity !== undefined) {
              updatedNodes[nodeIndex].humidity = message.humidity;
            }
            updatedNodes[nodeIndex].lastUpdated = Date.now();
            updatedNodes[nodeIndex].status = 'Connected';
            return updatedNodes;
          } else {
            return [
              ...prevNodes,
              {
                nodeId: message.nodeId,
                temperature: message.temperature,
                humidity: message.humidity,
                lastUpdated: Date.now(),
                status: 'Connected',
              },
            ];
          }
        });
      } else if (message.command) {
        console.log(`Command received: ${message.command}`);
      }
    };

    ws.current.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };

    return () => {
      ws.current.close();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNodes((prevNodes) =>
        prevNodes.map((node) => ({
          ...node,
          status: Date.now() - node.lastUpdated > 6000 ? 'Disconnected' : 'Connected', // 10 seconds threshold
        }))
      );
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleSendCommand = (command, nodeId) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ command, nodeId }));
    }
  };

  const handleGlobalCommand = (command) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ command }));
    }
  };

  const handleReset = () => {
    setNodes([]);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box my={4}>
          <Paper elevation={3}>
            <Box p={2}>
              <Box mb={4}>
                <Typography variant="h6" gutterBottom>
                  Sensor Animations
                </Typography>
                <Box display="flex" justifyContent="center" mb={2} flexWrap="wrap">
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    onClick={() => {handleSendCommand('st'); handleSendCommand('s'); }} 
                    style={{ marginRight: '8px' }}
                  >
                    Temperature
                  </Button>
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    onClick={() => { handleSendCommand('sh'); handleSendCommand('s'); }}
                  >
                    Humidity
                  </Button>
                </Box>
              </Box>
              <Box mb={4}>
                <Typography variant="h6" gutterBottom>
                  Default Animations
                </Typography>
                <Box display="flex" justifyContent="center" mb={2} flexWrap="wrap">
                  {['Bird', 'Coin', 'Sword', 'Torch', 'Tank', 'Zombies', 'ARM x Imperial'].map((animation, index) => (
                    <Button 
                      key={index}
                      variant="contained" 
                      color="primary" 
                      onClick={() => { handleSendCommand(`a${index + 1}`); handleSendCommand('a'); }} 
                      style={{ marginRight: '8px', marginTop: '8px' }}
                    >
                      {animation}
                    </Button>
                  ))}
                </Box>
              </Box>
              <Box mb={4}>
                <Typography variant="h6" gutterBottom>
                  Controls
                </Typography>
                <Box display="flex" justifyContent="center" mb={2} flexWrap="wrap">
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    onClick={() => handleSendCommand('p')} 
                    style={{ marginRight: '8px' }}
                  >
                    Pause
                  </Button>
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    onClick={() => handleSendCommand('r')} 
                    style={{ marginRight: '8px' }}
                  >
                    Resume
                  </Button>
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    onClick={() => handleSendCommand('t')}
                  >
                    Next
                  </Button>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>
        <Grid container spacing={3}>
          {nodes.map((node, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="div">
                    Node ID: {node.nodeId}
                  </Typography>
                  <Typography color="textSecondary">
                    Temperature: {node.temperature !== undefined ? node.temperature.toFixed(2) : 'Loading...'} °C
                  </Typography>
                  <Typography color="textSecondary">
                    Humidity: {node.humidity !== undefined ? node.humidity.toFixed(2) : 'Loading...'} %
                  </Typography>
                  <Typography color={node.status === 'Connected' ? 'primary' : 'error'}>
                    Status: {node.status}
                  </Typography>
                </CardContent>
                <CardActions>
                  {['Pause', 'Resume', 'Toggle', 'Sensor', 'Animate'].map((action, actionIndex) => (
                    <Button 
                      size="small" 
                      color="primary" 
                      onClick={() => handleSendCommand(action.toLowerCase().charAt(0), node.nodeId)} 
                      key={actionIndex}
                    >
                      {action}
                    </Button>
                  ))}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Box display="flex" justifyContent="center" my={4}>
          <Button variant="contained" color="primary" onClick={handleReset}>
            Reset All
          </Button>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default SensorMonitoring;
