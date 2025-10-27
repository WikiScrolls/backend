import express from 'express';
import { PrismaClient } from '../generated/prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// Example route
app.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.post('/users', async (req, res) => {
  try {
    const user = await prisma.user.create({
      data: req.body
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
