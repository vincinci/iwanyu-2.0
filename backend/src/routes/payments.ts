import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Payments routes - Coming soon' });
});

export default router;
