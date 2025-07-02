import express from 'express';

const router = express.Router();

// Simple test endpoint to verify deployment
router.get('/deployment-test', (req, res) => {
  res.json({
    message: 'New deployment working!',
    timestamp: new Date().toISOString(),
    version: '1.0.3',
    deploymentId: 'test-deploy-' + Date.now()
  });
});

export default router;
