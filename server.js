require('dotenv').config();
const admin = require('firebase-admin');

// Инициализация Firebase (читает ключ из файла firebase-key.json)
const serviceAccount = require('./firebase-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Инициализируем базу данных Firestore
const db = admin.firestore();
const express = require('express');
const session = require('express-session');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static('.'));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Страница входа через Discord
app.get('/login', (req, res) => {
    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.DISCORD_REDIRECT_URI)}&response_type=code&scope=identify%20email%20guilds`;
    res.redirect(authUrl);
});

// Обработка callback от Discord
app.get('/auth/discord/callback', async (req, res) => {
    try {
        const { code } = req.query;

        // Получаем токен доступа
        const tokenResponse = await axios.post(
            'https://discord.com/api/oauth2/token',
            new URLSearchParams({
                client_id: process.env.DISCORD_CLIENT_ID,
                client_secret: process.env.DISCORD_CLIENT_SECRET,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: process.env.DISCORD_REDIRECT_URI,
            }),
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }
        );

        const accessToken = tokenResponse.data.access_token;

        // Получаем данные пользователя
        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        // Проверяем участие на сервере
        const guildsResponse = await axios.get('https://discord.com/api/users/@me/guilds', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const isOnServer = guildsResponse.data.some(guild => guild.id === process.env.GUILD_ID);

        if (!isOnServer) {
            return res.status(403).send(`
                <h1>Доступ запрещён</h1>
                <p>Вы не состоите на сервере Discord.</p>
                <p>Присоединитесь к серверу для доступа к сайту.</p>
            `);
        }

        // Сохраняем пользователя в сессии
        req.session.user = {
            id: userResponse.data.id,
            username: userResponse.data.username,
            email: userResponse.data.email,
            avatar: userResponse.data.avatar
        };

        res.redirect('/');

    } catch (error) {
        console.error('Ошибка авторизации:', error);
        res.status(500).send('Ошибка авторизации');
    }
});

// API для проверки авторизации
app.get('/api/me', (req, res) => {
    if (req.session.user) {
        res.json({ authenticated: true, user: req.session.user });
    } else {
        res.json({ authenticated: false });
    }
});

// Выход
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
