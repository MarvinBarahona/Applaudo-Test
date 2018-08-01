const express = require('express');
const testRoutes = require('./test');

// Router object.
const router = express.Router();

// Dummy message to say hello at the home page.
router.get('/', (req, res)=>{
  res.status(200).json({msg: 'Hello there!'})
});

// Join all routers.
router.use('/test', testRoutes);

// Export the router.
module.exports = router;
