import React, { useState, useEffect, useRef } from 'react';
import {
  AppBar,
  Box,
  Button,
  Container,
  CssBaseline,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  Typography,
  IconButton
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
    ws.current = new WebSocket('ws://localhost:8080');

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
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => setActivePage('Home')}>
            <HomeIcon />
          </IconButton>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Sensor Monitoring
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg">
        <Box my={4}>
          <Paper elevation={3}>
            <Box p={2}>
              <Typography variant="h5" gutterBottom>
                Global Controls
              </Typography>
              <Box display="flex" justifyContent="center" mb={2}>
                <Button variant="contained" color="primary" onClick={() => handleGlobalCommand('a1')}>A1</Button>
                <Button variant="contained" color="primary" onClick={() => handleGlobalCommand('a2')}>A2</Button>
                <Button variant="contained" color="primary" onClick={() => handleGlobalCommand('a3')}>A3</Button>
                <Button variant="contained" color="primary" onClick={() => handleGlobalCommand('a4')}>A4</Button>
                <Button variant="contained" color="primary" onClick={() => handleGlobalCommand('a5')}>A5</Button>
                <Button variant="contained" color="primary" onClick={() => handleGlobalCommand('a6')}>A6</Button>
              </Box>
              <Typography variant="h5" gutterBottom>
                Node Controls
              </Typography>
              <Box display="flex" justifyContent="center" mb={2}>
                <Button variant="contained" color="secondary" onClick={() => handleSendCommand('p')}>Pause</Button>
                <Button variant="contained" color="secondary" onClick={() => handleSendCommand('r')}>Resume</Button>
                <Button variant="contained" color="secondary" onClick={() => handleSendCommand('t')}>Toggle</Button>
                <Button variant="contained" color="secondary" onClick={() => handleSendCommand('s')}>Sensor</Button>
                <Button variant="contained" color="secondary" onClick={() => handleSendCommand('a')}>Animate</Button>
              </Box>
            </Box>
          </Paper>
        </Box>
        <Box my={4}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Node ID</TableCell>
                  <TableCell>Temperature (ºC)</TableCell>
                  <TableCell>Humidity (%)</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {nodes.map((node, index) => (
                  <TableRow key={index}>
                    <TableCell>{node.nodeId}</TableCell>
                    <TableCell>{node.temperature !== undefined ? node.temperature.toFixed(2) : 'Loading...'}</TableCell>
                    <TableCell>{node.humidity !== undefined ? node.humidity.toFixed(2) : 'Loading...'}</TableCell>
                    <TableCell>{node.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
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
