require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// Path to user database
const USERS_FILE = path.join(__dirname, "users.json");
const ORDERS_FILE = path.join(__dirname, "orders.json");

// Enable CORS so the file:// protocol can make requests to localhost:3000
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Block requests to sensitive configuration files
app.use((req, res, next) => {
  const filename = path.basename(req.path).toLowerCase();
  const blockedFiles = [".env", "server.js", "package.json", "package-lock.json", ".gitignore", "readme.md", "users.json", "orders.json"];

  if (blockedFiles.includes(filename)) {
    return res.status(403).send("Forbidden: Access Denied");
  }
  next();
});

// Serve static resources from the root directory
app.use(express.static(__dirname));

// Helper function to read users
const readUsers = () => {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, "[]");
    }
    const data = fs.readFileSync(USERS_FILE, "utf8");
    return JSON.parse(data || "[]");
  } catch (err) {
    console.error("Error reading user file database:", err);
    return [];
  }
};

// Helper function to write users
const writeUsers = (users) => {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (err) {
    console.error("Error writing user file database:", err);
  }
};

// Helper function to read orders
const readOrders = () => {
  try {
    if (!fs.existsSync(ORDERS_FILE)) {
      fs.writeFileSync(ORDERS_FILE, "[]");
    }
    const data = fs.readFileSync(ORDERS_FILE, "utf8");
    return JSON.parse(data || "[]");
  } catch (err) {
    console.error("Error reading orders file database:", err);
    return [];
  }
};

// Helper function to write orders
const writeOrders = (orders) => {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
  } catch (err) {
    console.error("Error writing orders file database:", err);
  }
};

// Auth signup endpoint
app.post("/api/signup", (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing required fields: name, email, or password" });
    }

    const users = readUsers();
    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already registered
    const exists = users.find((u) => u.email.toLowerCase().trim() === normalizedEmail);
    if (exists) {
      return res.status(400).json({ error: "An account with this email address already exists" });
    }

    // Save user
    const newUser = {
      name: name.trim(),
      email: normalizedEmail,
      password: password, // plain password for local sandbox
    };

    users.push(newUser);
    writeUsers(users);

    return res.json({ success: true, user: { name: newUser.name, email: newUser.email } });
  } catch (err) {
    console.error("Signup endpoint error:", err);
    return res.status(500).json({ error: "Failed to create user account" });
  }
});

// Auth login endpoint
app.post("/api/login", (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Missing required fields: email or password" });
    }

    const users = readUsers();
    const normalizedEmail = email.toLowerCase().trim();

    // Search user
    const user = users.find(
      (u) => u.email.toLowerCase().trim() === normalizedEmail && u.password === password
    );

    if (!user) {
      return res.status(401).json({ error: "Invalid email address or password" });
    }

    return res.json({ success: true, user: { name: user.name, email: user.email } });
  } catch (err) {
    console.error("Login endpoint error:", err);
    return res.status(500).json({ error: "Authentication failed" });
  }
});

// Server-side local rule-based chatbot endpoint (With GEO-adaptable replies and new name)
app.post("/api/chat", (req, res) => {
  try {
    const { messages, location } = req.body;

    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: "Messages payload is empty" });
    }

    const userMessage = messages[messages.length - 1].content.toLowerCase();
    let reply = "";

    // Local keyphrase matching rules with Geo integration
    if (
      userMessage.includes("ghost") ||
      userMessage.includes("room no. 13") ||
      userMessage.includes("room number 13") ||
      userMessage.includes("room 13") ||
      userMessage.includes("story") ||
      userMessage.includes("lore") ||
      userMessage.includes("comic") ||
      userMessage.includes("about")
    ) {
      reply =
        "The Ghost of Room No. 13 is our flagship psychological sci-fi horror thriller! 📖 It follows the story: \"When strange sounds begin coming from Room No. 13, three  friends decide to uncover the truth.Will they solve the mystery?\" The deluxe print edition is priced at ₹150!";
    } else if (
      userMessage.includes("price") ||
      userMessage.includes("cost") ||
      userMessage.includes("how much") ||
      userMessage.includes("buy") ||
      userMessage.includes("order")
    ) {
      let locationNote = "";
      if (location && location.city && location.country) {
        locationNote = ` Since you are visiting our portal from **${location.city}, ${location.country}**, we can coordinate custom shipping rates directly to your region!`;
      }
      reply =
        `Our flagship release, The Ghost of Room No. 13, is priced at ₹150. 🛒${locationNote} To order a copy, head over to the Order page, fill out the checkout form, and click submit. The site will automatically copy your prefilled order details to your clipboard and open our Instagram DMs (@helix.comics.official) where you simply paste and send!`;
    } else if (
      userMessage.includes("developer") ||
      userMessage.includes("zephyrdevs") ||
      userMessage.includes("zevs") ||
      userMessage.includes("built") ||
      userMessage.includes("creator")
    ) {
      reply =
        "Helix Comics' web portal, live canvas physics, and interactive designs were built by our technology partner ZephyrDevs (ZEVS). 🌐 You can view their developer page (developers.html), visit their website (https://zephyr-devs.vercel.app), follow them on Instagram @zephyrdevs, or email them at zephyrdevsofficial@gmail.com!";
    } else if (
      userMessage.includes("helix") ||
      userMessage.includes("established") ||
      userMessage.includes("contact") ||
      userMessage.includes("email") ||
      userMessage.includes("instagram")
    ) {
      reply =
        "Helix Comics was established in 2026 to push the boundaries of visual storytelling. 🧬 You can email us at Helix.comics.official@gmail.com, or visit our official Instagram page @helix.comics.official (https://instagram.com/helix.comics.official)!";
    } else if (
      userMessage.includes("hi") ||
      userMessage.includes("hello") ||
      userMessage.includes("hey") ||
      userMessage.includes("greet") ||
      userMessage.includes("greetings")
    ) {
      let locationGreet = "";
      if (location && location.city) {
        locationGreet = ` from **${location.city}**`;
      }
      reply =
        `Greetings, traveler${locationGreet} of the Helix universes! 🧬 I am Helix AI, your visual storytelling assistant. How can I help you explore our universes today? Ask me about Helix Comics, our flagship release The Ghost of Room No. 13, or our technology builders ZephyrDevs!`;
    } else {
      let locationShoutout = "";
      if (location && location.city) {
        locationShoutout = ` (Shoutout to our readers in **${location.city}**!)`;
      }
      reply =
        `That is an intriguing query! 🧬${locationShoutout} As Helix AI, I can tell you all about Helix Comics (established in 2026), our flagship genetic horror 'The Ghost of Room No. 13' (priced at ₹150), how to place an order via Instagram DMs, or our technology creators ZephyrDevs. What would you like to explore?`;
    }

    // Return response immediately
    return res.json({ role: "assistant", content: reply });
  } catch (err) {
    console.error("Local chat endpoint error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Fetch user orders endpoint
app.get("/api/orders", (req, res) => {
  try {
    const email = req.query.email;
    if (!email) {
      return res.status(400).json({ error: "Missing email parameter" });
    }
    const orders = readOrders();
    const userOrders = orders.filter((o) => o.email.toLowerCase().trim() === email.toLowerCase().trim());
    return res.json(userOrders);
  } catch (err) {
    console.error("Fetch orders endpoint error:", err);
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Create new order endpoint
app.post("/api/orders", (req, res) => {
  try {
    const { orderId, email, name, phone, address, items, shippingRate, shippingRegion, totalAmount } = req.body;
    if (!orderId || !email || !items) {
      return res.status(400).json({ error: "Missing required order parameters" });
    }
    const orders = readOrders();
    const newOrder = {
      orderId,
      email: email.toLowerCase().trim(),
      name,
      phone,
      address,
      items,
      shippingRate,
      shippingRegion,
      totalAmount,
      status: "Pending",
      date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
      timestamp: Date.now()
    };
    orders.push(newOrder);
    writeOrders(orders);
    return res.json({ success: true, order: newOrder });
  } catch (err) {
    console.error("Save order endpoint error:", err);
    return res.status(500).json({ error: "Failed to save order record" });
  }
});

// Cancel order endpoint
app.post("/api/orders/cancel", (req, res) => {
  try {
    const { orderId, email } = req.body;
    if (!orderId || !email) {
      return res.status(400).json({ error: "Missing orderId or email" });
    }
    const orders = readOrders();
    const orderIndex = orders.findIndex(
      (o) => o.orderId === orderId && o.email.toLowerCase().trim() === email.toLowerCase().trim()
    );
    if (orderIndex === -1) {
      return res.status(404).json({ error: "Order not found" });
    }
    if (orders[orderIndex].status !== "Pending") {
      return res.status(400).json({ error: "Only pending orders can be cancelled" });
    }
    orders[orderIndex].status = "Cancelled";
    writeOrders(orders);
    return res.json({ success: true, order: orders[orderIndex] });
  } catch (err) {
    console.error("Cancel order endpoint error:", err);
    return res.status(500).json({ error: "Failed to cancel order" });
  }
});

// Modify order address endpoint
app.post("/api/orders/modify", (req, res) => {
  try {
    const { orderId, email, address } = req.body;
    if (!orderId || !email || !address) {
      return res.status(400).json({ error: "Missing orderId, email, or address" });
    }
    const orders = readOrders();
    const orderIndex = orders.findIndex(
      (o) => o.orderId === orderId && o.email.toLowerCase().trim() === email.toLowerCase().trim()
    );
    if (orderIndex === -1) {
      return res.status(404).json({ error: "Order not found" });
    }
    if (orders[orderIndex].status !== "Pending") {
      return res.status(400).json({ error: "Only pending orders can be modified" });
    }
    orders[orderIndex].address = address;
    writeOrders(orders);
    return res.json({ success: true, order: orders[orderIndex] });
  } catch (err) {
    console.error("Modify order endpoint error:", err);
    return res.status(500).json({ error: "Failed to modify order" });
  }
});

// Start listening
app.listen(PORT, () => {
  console.log(`Helix Comics Server running on http://localhost:${PORT}`);
});
