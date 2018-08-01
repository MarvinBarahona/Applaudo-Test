const express = require('express');

// Router object.
const router = express.Router();

// Dummy message to say hello at the home page.
router.get('/', (request, response)=>{
  response.status(200).json({grettings: 'Hello there!'})
});

// Export the router.
module.exports = router;
