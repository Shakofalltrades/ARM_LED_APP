import React, { useState, useEffect, useRef } from 'react';
import {
  AppBar,
  Box,
  Button,
  Container,
  CssBaseline,
  Paper,
  Grid,
  Toolbar,
  Typography,
  IconButton,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';
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
    ws.current = new WebSocket('ws://192.168.30.44:8081');

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

  const handleSendModeCommand = (command) => {
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
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => setActivePage('Home')}>
            <HomeIcon />
          </IconButton>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Node Control
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg">
        <Box my={4}>
          <Paper elevation={3}>
            <Box p={2}>
              <Box mb={4}>
                <Typography variant="h6" gutterBottom>
                  Sensor Animations
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  style={{ marginBottom: '16px' }}
                  onClick={() => handleSendModeCommand('s')}
                >
                  Sensor Mode
                </Button>
                <Box display="flex" justifyContent="center" mb={2} flexWrap="wrap">
                  <Button variant="contained" color="secondary" onClick={() => handleSendCommand('st')} style={{ marginRight: '8px' }}>
                    Temperature
                  </Button>
                  <Button variant="contained" color="secondary" onClick={() => handleSendCommand('sh')}>
                    Humidity
                  </Button>
                </Box>
              </Box>
              <Box mb={4}>
                <Typography variant="h6" gutterBottom>
                  Default Animations
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  style={{ marginBottom: '16px' }}
                  onClick={() => handleSendModeCommand('a')}
                >
                  Animation Mode
                </Button>
                <Box display="flex" justifyContent="center" mb={2} flexWrap="wrap">
                  <Button variant="contained" color="primary" onClick={() => handleGlobalCommand('a1')} style={{ marginRight: '8px', marginTop: '8px' }}>
                    Bird
                  </Button>
                  <Button variant="contained" color="primary" onClick={() => handleGlobalCommand('a2')} style={{ marginRight: '8px', marginTop: '8px' }}>
                    Coin
                  </Button>
                  <Button variant="contained" color="primary" onClick={() => handleGlobalCommand('a3')} style={{ marginRight: '8px', marginTop: '8px' }}>
                    Sword
                  </Button>
                  <Button variant="contained" color="primary" onClick={() => handleGlobalCommand('a4')} style={{ marginRight: '8px', marginTop: '8px' }}>
                    Torch
                  </Button>
                  <Button variant="contained" color="primary" onClick={() => handleGlobalCommand('a5')} style={{ marginRight: '8px', marginTop: '8px' }}>
                    Tank
                  </Button>
                  <Button variant="contained" color="primary" onClick={() => handleGlobalCommand('a6')} style={{ marginRight: '8px', marginTop: '8px' }}>
                    Zombies
                  </Button>
                  <Button variant="contained" color="primary" onClick={() => handleGlobalCommand('a7')} style={{ marginTop: '8px' }}>
                    ARM x Imperial
                  </Button>
                </Box>
              </Box>
              <Box mb={4}>
                <Typography variant="h6" gutterBottom>
                  Controls
                </Typography>
                <Box display="flex" justifyContent="center" mb={2} flexWrap="wrap">
                  <Button variant="contained" color="secondary" onClick={() => handleSendCommand('p')} style={{ marginRight: '8px' }}>
                    Pause
                  </Button>
                  <Button variant="contained" color="secondary" onClick={() => handleSendCommand('r')} style={{ marginRight: '8px' }}>
                    Resume
                  </Button>
                  <Button variant="contained" color="secondary" onClick={() => handleSendCommand('t')}>
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
                  <Button size="small" color="primary" onClick={() => handleSendCommand('p', node.nodeId)}>Pause</Button>
                  <Button size="small" color="primary" onClick={() => handleSendCommand('r', node.nodeId)}>Resume</Button>
                  <Button size="small" color="primary" onClick={() => handleSendCommand('t', node.nodeId)}>Toggle</Button>
                  <Button size="small" color="primary" onClick={() => handleSendCommand('s', node.nodeId)}>Sensor</Button>
                  <Button size="small" color="primary" onClick={() => handleSendCommand('a', node.nodeId)}>Animate</Button>
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
