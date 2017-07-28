import { Router } from 'express';

const manifest = Router();

manifest.get('/', (req, res) => {
    res.send({
        short_name: 'Hacker News',
        name: "Hacker News",
        start_url: "/",
        background_color: '#3F51B5',
        theme_color: '#3F51B5',
        display: 'standalone',
        icons: [{
            src: "/assets/icons/192x192.png",
            sizes: "192x192",
            type: "image/png"
        },
        {
            src: "/assets/icons/384x384.png",
            sizes: "384x384",
            type: "image/png"
        },
        {
            src: "/assets/icons/512x512.png",
            sizes: "512x512",
            type: "image/png"
        }]
    });
});

console.log('[App: manifest] initialized.');
export default manifest;
