require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS so the file:// protocol can make requests to localhost:3000
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Block requests to sensitive configuration files
app.use((req, res, next) => {
  const filename = path.basename(req.path).toLowerCase();
  const blockedFiles = [".env", "server.js", "package.json", "package-lock.json", ".gitignore", "readme.md"];

  if (blockedFiles.includes(filename)) {
    return res.status(403).send("Forbidden: Access Denied");
  }
  next();
});

// Serve static resources from the root directory
app.use(express.static(__dirname));

// Server-side local rule-based chatbot endpoint (With GEO-adaptable replies)
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
      userMessage.includes("room 13") ||
      userMessage.includes("room number 13") ||
      userMessage.includes("story") ||
      userMessage.includes("lore") ||
      userMessage.includes("comic") ||
      userMessage.includes("about")
    ) {
      reply =
        "Room Number 13 is our flagship psychological sci-fi horror thriller! 📖 It follows the dark experiments of Dr. Julian Vance in the sub-basement of the Helix Biotech facility. When researchers attempt to transmit digital code directly into biological cells, it triggers a spatial containment leak, rewriting local reality into an orange blueprint grid. The deluxe print edition is priced at ₹150!";
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
        `Our flagship release, Room Number 13, is priced at ₹150. 🛒${locationNote} To order a copy, head over to the Order page, fill out the checkout form, and click submit. The site will automatically copy your prefilled order details to your clipboard and open our Instagram DMs (@helix.comics.official) where you simply paste and send!`;
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
        `Greetings, traveler${locationGreet} of the Helix universes! 🧬 I am Helix AI, your visual storytelling assistant. How can I help you explore our universes today? Ask me about Helix Comics, our flagship release Room Number 13, or our technology builders ZephyrDevs!`;
    } else {
      let locationShoutout = "";
      if (location && location.city) {
        locationShoutout = ` (Shoutout to our readers in **${location.city}**!)`;
      }
      reply =
        `That is an intriguing query! 🧬${locationShoutout} As Helix AI, I can tell you all about Helix Comics (established in 2026), our flagship genetic horror 'Room Number 13' (priced at ₹150), how to place an order via Instagram DMs, or our technology creators ZephyrDevs. What would you like to explore?`;
    }

    // Return response immediately
    return res.json({ role: "assistant", content: reply });
  } catch (err) {
    console.error("Local chat endpoint error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Start listening
app.listen(PORT, () => {
  console.log(`Helix Comics Server running on http://localhost:${PORT}`);
});
