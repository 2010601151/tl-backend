// server.js
import express from "express";
import Stripe from "stripe";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Replace with your **live or test Stripe secret key**
const stripe = new Stripe("sk_test_51SLPuYIRB5h9kKSgshilKLT1EtevEiaCqbbsSyLvDnEirvSi2nck6F4dEGWSoc97BjYr5gIE7KqBLKuuTw8Ag4Dd00X0196ORU");

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
          images: [item.image || "https://via.placeholder.com/150"], // fallback image
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
  payment_method_types: ["card"],
  line_items,
  mode: "payment",
     success_url: "https://taste-liberia.com/success.html", // ✅ Change to your site domain
      cancel_url: "https://taste-liberia.com/checkout.html",
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

const PORT = 4242;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
