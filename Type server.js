const express = require(‘express’);
const cors = require(‘cors’);
const stripe = require(‘stripe’)(process.env.STRIPE_SECRET_KEY);
const { Pool } = require(‘pg’);

const app = express();
const port = process.env.PORT || 3001;

// Database connection
const pool = new Pool({
connectionString: process.env.DATABASE_URL,
ssl: process.env.NODE_ENV === ‘production’ ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get(’/health’, (req, res) => {
res.json({ status: ‘healthy’, timestamp: new Date().toISOString() });
});

// Create checkout session
app.post(’/api/create-checkout-session’, async (req, res) => {
try {
const { plan, userEmail } = req.body;

```
const priceId = plan === 'monthly' 
  ? process.env.STRIPE_MONTHLY_PRICE_ID 
  : process.env.STRIPE_YEARLY_PRICE_ID;

const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [{
    price: priceId,
    quantity: 1,
  }],
  mode: 'subscription',
  success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}?success=true&session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}?canceled=true`,
  customer_email: userEmail,
});

res.json({ sessionId: session.id, url: session.url });
```

} catch (error) {
console.error(‘Checkout error:’, error);
res.status(500).json({ error: ‘Failed to create checkout session’ });
}
});

// Verify payment
app.post(’/api/verify-payment’, async (req, res) => {
try {
const { sessionId } = req.body;
const session = await stripe.checkout.sessions.retrieve(sessionId);

```
if (session.payment_status === 'paid') {
  res.json({ 
    success: true, 
    plan: session.metadata?.plan,
    customerEmail: session.customer_details?.email
  });
} else {
  res.status(400).json({ error: 'Payment not completed' });
}
```

} catch (error) {
console.error(‘Payment verification failed:’, error);
res.status(500).json({ error: ‘Failed to verify payment’ });
}
});

// Get active users
app.get(’/api/active-users’, (req, res) => {
const count = Math.floor(Math.random() * 500) + 1500;
res.json({ count });
});

// Track session
app.post(’/api/track-session’, (req, res) => {
res.json({ success: true });
});

// Success story
app.get(’/api/success-story’, (req, res) => {
const stories = [
{ amount: ‘127.50’, grabovai_code: ‘5207418’ },
{ amount: ‘250.00’, grabovai_code: ‘426499’ },
{ amount: ‘89.99’, grabovai_code: ‘318612518714’ },
{ amount: ‘445.00’, grabovai_code: ‘199621147’ }
];
const story = stories[Math.floor(Math.random() * stories.length)];
res.json(story);
});

// Submit manifestation win
app.post(’/api/manifestation-win’, async (req, res) => {
try {
const { amount, grabovaiCode, description } = req.body;
// In a real app, save to database
res.json({ success: true });
} catch (error) {
res.status(500).json({ error: ‘Failed to save win’ });
}
});

app.listen(port, () => {
console.log(`DigiManifest backend running on port ${port}`);
});
