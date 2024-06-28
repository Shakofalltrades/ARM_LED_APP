// Header.js

import React from 'react';
import { AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';

function Header({ setActivePage }) {
  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton edge="start" color="inherit" onClick={() => setActivePage('Home')}>
          <HomeIcon />
        </IconButton>
        <Typography variant="h4" style={{ flexGrow: 1, fontWeight: 'bold' }}>
          LUMNET
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
