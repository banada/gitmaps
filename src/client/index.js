import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import App from './components/App';

document.addEventListener('DOMContentLoaded', function() {
    // Start React
    const container = document.getElementById('react-container');
    ReactDOM.render(
        <BrowserRouter>
            <App />
        </BrowserRouter>,
        container
    );
});

