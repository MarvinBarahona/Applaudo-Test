const express = require('express');
const testRoutes = require('./test');
const authRoutes = require('./auth');
const profileRoutes = require('./profile');
const productRoutes = require('./product');
const router = express.Router();

// Dummy message to say hello at the home page.
router.get('/', (req, res)=>{
  res.status(200).json({msg: 'Hello there!'})
});

// Join all routers.
router.use('/test', testRoutes);
router.use('/login', authRoutes);
router.use('/me', profileRoutes);
router.use('/products', productRoutes);

// Export the router.
module.exports = router;
