const express = require('express');
const cors = require('cors'); // Make sure you have 'cors' installed (it's in package.json)
const Stripe = require('stripe'); // Make sure you have 'stripe' installed (it's in package.json)

// --- Initialization ---
const app = express();
const port = process.env.PORT || 3001; // Use 3001 as a common default for backend if PORT not set by Railway

// It's crucial to load your secret key from an environment variable
// for security. Do not hardcode it in your file.
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// A list of your valid Price IDs from the Stripe Dashboard
const validPriceIds = {
  monthly: 'price_1Rg5WfGs12PfVR6uY7ZyAbg0', // DigiManifest Pro Monthly
  yearly: 'price_1Rg5WfGs12PfVR6u8tfB2z3D',  // DigiManifest Pro Yearly
};

// --- Middleware ---
// Use CORS to allow requests from your frontend
// Make sure process.env.FRONTEND_DOMAIN is set in Railway Variables to 'https://digimanifest.com'
app.use(cors({ origin: process.env.FRONTEND_DOMAIN }));

// Use express.json() to parse JSON request bodies
app.use(express.json());


// --- API Routes ---

// 1. Route to provide the Stripe Publishable Key to the frontend
app.get('/api/stripe-config', (req, res) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY, // This should be set in Railway Variables
  });
});


// --- Server Start ---
app.listen(port, () => {
  console.log(`DigiManifest Backend server listening on port ${port}`);
});
