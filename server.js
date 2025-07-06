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
// 2. Route to create a Stripe Checkout Session for subscriptions
app.post('/api/create-subscription', async (req, res) => {
  const { priceId } = req.body; // Frontend sends the priceId (monthly/yearly)

  // Ensure the received priceId is one of your valid ones
  if (!Object.values(validPriceIds).includes(priceId)) {
    return res.status(400).json({ error: 'Invalid price ID provided.' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{
        price: priceId, // Use the priceId from your validPriceIds
        quantity: 1,
      }],
      success_url: `${process.env.FRONTEND_DOMAIN}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_DOMAIN}/cancel.html`,
      // Add customer email if you have it from your frontend login
      // customer_email: 'user@example.com',
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});


// --- Server Start ---
app.listen(port, () => {
  console.log(`DigiManifest Backend server listening on port ${port}`);
});
