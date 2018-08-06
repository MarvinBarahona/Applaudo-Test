const express = require('express');
const testRoutes = require('./test');
const authRoutes = require('./auth');

// Router object.
const router = express.Router();

// Dummy message to say hello at the home page.
router.get('/', (req, res)=>{
  res.status(200).json({msg: 'Hello there!'})
});

// Join all routers.
router.use('/test', testRoutes);
router.use('/login', authRoutes);

// Export the router.
module.exports = router;
