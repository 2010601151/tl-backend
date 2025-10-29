
// server.js
import express from "express";
import Stripe from "stripe";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config(); // Load keys from .env

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Use your LIVE Stripe secret key from .env
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());

// Serve index.html at "/"
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// Create Stripe Checkout Session
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { cartItems } = req.body;

    console.log("Received cart:", cartItems);

    const line_items = cartItems.map(item => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          images: [item.image || "https://via.placeholder.com/150"],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: "https://www.231cuisine.com/success.html", // ✅ Your domain
      cancel_url: "https://www.231cuisine.com/checkout.html",
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Serve success and cancel pages
app.get("/success.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public/success.html"));
});
app.get("/cancel.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public/cancel.html"));
});

// Use PORT from environment (Render sets this automatically)
const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
