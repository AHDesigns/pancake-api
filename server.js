import express from 'express';

const app = express();

app.all('*', (req, res) => {
    res.json({ page: 'loads' });
});

export default app;

