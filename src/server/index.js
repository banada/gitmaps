import '@babel/polyfill';

import express from 'express';
import bodyparser from 'body-parser';
import path from 'path';
import cors from 'cors';
import cookieSession from 'cookie-session';

import v1 from './api/v1/v1';

const httpApp = express();

/*
 *  Middleware
 */

// CORS
const corsOptions = {
    origin: [
        /http:\/\/localhost/,
        /http:\/\/127.0.0.1/
    ],
    credentials: true
}
httpApp.use(cors(corsOptions));
// CORS Preflight
httpApp.options('/*', cors(corsOptions));

// Cookie session
httpApp.use(cookieSession({
    name: 'session',
    keys: [ process.env.COOKIE_KEY ]
}));

httpApp.use((req, res, next) => {
    bodyparser.json({limit: '10mb'})(req, res, next);
});

// Serve static files
httpApp.use('/static', express.static('./dist'));

// Log routes
httpApp.use('*', (req, res, next) => {
    console.log(`${req.method} ${req.baseUrl}`);
    return next();
});

/*
 *  Routing
 */

// API
httpApp.use('/api/v1/', v1);

// Static Pages
httpApp.get('/', (req, res, next) => {
    res.status(200);
    return res.redirect('/new');
});
httpApp.get('/robots.txt', (req, res, next) => {
    res.status(200);
    return res.sendFile(path.resolve('dist/robots.txt'));
});
httpApp.get('/sitemap.xml', (req, res, next) => {
    res.status(200);
    return res.sendFile(path.resolve('dist/sitemap.xml'));
});

// Web App
// Serve index w/o typing 'index.html'
httpApp.get('/*', (req, res, next) => {
    res.status(200);
    res.sendFile(path.resolve('src/client/index.html'));
});

/*
 *  404 if no routes match
 */
httpApp.use((req, res, next) => {
    res.status(404);
    res.send('<h1>404</h1>');
});

/*
 *  Start servers
 */
httpApp.listen(process.env.HTTP_PORT, () => {
    console.log(`Started HTTP server on port ${process.env.HTTP_PORT}`);
});

// Graceful exit
process.on('SIGINT', () => {
    console.log('');
    console.log('Shutting down server...');
    console.log('Goodbye.');
    process.exit();
});


