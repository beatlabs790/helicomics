// Dismiss Preloader when the page has fully loaded all assets
window.addEventListener("load", () => {
  const preloader = document.getElementById("preloader");
  if (preloader) {
    setTimeout(() => {
      preloader.style.opacity = "0";
      preloader.style.visibility = "hidden";
    }, 300);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  // Silent Geolocation API Check (IP-based to prevent popup dialog blocks)
  let userLocation = null;

  fetch("https://ipapi.co/json/")
    .then((res) => res.json())
    .then((data) => {
      if (data && data.city && data.country_name) {
        userLocation = {
          city: data.city,
          country: data.country_name,
        };
      }
    })
    .catch((err) => {
      console.warn("Geolocation silent IP lookup was bypassed:", err);
    });

  // Theme Toggle & State Persistence
  const savedTheme = localStorage.getItem("theme");
  const systemPrefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;

  const initTheme = () => {
    if (savedTheme === "light" || (!savedTheme && systemPrefersLight)) {
      document.body.classList.add("light-theme");
      updateThemeIcons(true);
    } else {
      document.body.classList.remove("light-theme");
      updateThemeIcons(false);
    }
  };

  const updateThemeIcons = (isLight) => {
    const sunIcons = document.querySelectorAll(".sun-icon");
    const moonIcons = document.querySelectorAll(".moon-icon");

    if (isLight) {
      sunIcons.forEach((el) => (el.style.display = "none"));
      moonIcons.forEach((el) => (el.style.display = "block"));
    } else {
      sunIcons.forEach((el) => (el.style.display = "block"));
      moonIcons.forEach((el) => (el.style.display = "none"));
    }
  };

  // Bind click event to all theme toggle buttons
  const themeToggles = document.querySelectorAll(".theme-toggle-btn");
  themeToggles.forEach((btn) => {
    btn.addEventListener("click", () => {
      const isLight = document.body.classList.toggle("light-theme");
      localStorage.setItem("theme", isLight ? "light" : "dark");
      updateThemeIcons(isLight);
    });
  });

  // Run theme initialization
  initTheme();

  // 1. Mobile Hamburger Menu Toggle
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      navLinks.classList.toggle("nav-links-mobile");

      // Rotate hamburger bars to make an "X"
      const spans = hamburger.querySelectorAll("span");
      if (navLinks.classList.contains("nav-links-mobile")) {
        spans[0].style.transform = "rotate(45deg) translate(5px, 6px)";
        spans[1].style.opacity = "0";
        spans[2].style.transform = "rotate(-45deg) translate(5px, -6px)";
      } else {
        spans[0].style.transform = "none";
        spans[1].style.opacity = "1";
        spans[2].style.transform = "none";
      }
    });

    // Close menu when clicking navigation links
    const links = navLinks.querySelectorAll("a");
    links.forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("nav-links-mobile");
        const spans = hamburger.querySelectorAll("span");
        spans[0].style.transform = "none";
        spans[1].style.opacity = "1";
        spans[2].style.transform = "none";
      });
    });
  }

  // 2. Scroll Reveal Observer
  const revealElements = document.querySelectorAll(".reveal");
  if (revealElements.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -40px 0px",
      }
    );
    revealElements.forEach((el) => observer.observe(el));
  }

  // 3. Live Interactive Background Canvas (Light & Dark Theme Adaptable)
  const canvas = document.getElementById("bg-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = { x: null, y: null, radius: 180 };

    window.addEventListener("mousemove", (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener("mouseleave", () => {
      mouse.x = null;
      mouse.y = null;
    });

    window.addEventListener("resize", () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    // Vertical falling amber streaks (sparks)
    const sparks = [];
    const sparkCount = 35;
    for (let i = 0; i < sparkCount; i++) {
      sparks.push({
        x: Math.random() * width,
        y: Math.random() * height,
        length: Math.random() * 25 + 10,
        speedY: Math.random() * 0.8 + 0.3,
        opacity: Math.random() * 0.4 + 0.1,
      });
    }

    const gridSpacing = 28;
    let time = 0;

    const animate = () => {
      time += 0.005;

      const isLight = document.body.classList.contains("light-theme");

      // 1. Draw live moving radial gradient background
      const gradCenterX = width * 0.5 + Math.sin(time * 0.6) * (width * 0.18);
      const gradCenterY = height * 0.5 + Math.cos(time * 0.4) * (height * 0.18);
      const gradBg = ctx.createRadialGradient(gradCenterX, gradCenterY, 50, gradCenterX, gradCenterY, Math.max(width, height) * 0.85);
      
      if (isLight) {
        gradBg.addColorStop(0, "#ffece0");   // Light peach center
        gradBg.addColorStop(0.5, "#fbf8f5"); // Ivory-white middle
        gradBg.addColorStop(1, "#f4eae4");   // Soft grey-peach border
      } else {
        gradBg.addColorStop(0, "#281005");   // Warm glowing orange/copper center
        gradBg.addColorStop(0.4, "#0e0603"); // Deep dark coppery-brown middle
        gradBg.addColorStop(1, "#030304");   // Obsidian charcoal edge
      }
      
      ctx.fillStyle = gradBg;
      ctx.fillRect(0, 0, width, height);

      // 2. Draw drifting secondary orange background glow fields (Drifting Arcs)
      // Bottom Center Arc
      const arc1X = width * 0.4 + Math.sin(time * 0.4) * 30;
      const arc1Y = height * 1.1 + Math.cos(time * 0.3) * 20;
      const arc1Radius = Math.min(width, height) * 0.55;
      
      const grad1 = ctx.createRadialGradient(arc1X, arc1Y, 0, arc1X, arc1Y, arc1Radius);
      if (isLight) {
        grad1.addColorStop(0, "rgba(255, 106, 0, 0.14)");
        grad1.addColorStop(0.3, "rgba(255, 179, 0, 0.06)");
        grad1.addColorStop(1, "rgba(252, 250, 247, 0)");
      } else {
        grad1.addColorStop(0, "rgba(255, 69, 0, 0.42)");
        grad1.addColorStop(0.3, "rgba(255, 106, 0, 0.18)");
        grad1.addColorStop(1, "rgba(6, 6, 8, 0)");
      }
      
      ctx.beginPath();
      ctx.arc(arc1X, arc1Y, arc1Radius, 0, Math.PI * 2);
      ctx.fillStyle = grad1;
      ctx.fill();

      // Top Right Slanted Arc
      const slashX = width * 0.95 + Math.cos(time * 0.2) * 20;
      const slashY = height * -0.05 + Math.sin(time * 0.4) * 20;
      const slashRadius = Math.min(width, height) * 0.65;
      
      const grad2 = ctx.createRadialGradient(slashX, slashY, 0, slashX, slashY, slashRadius);
      if (isLight) {
        grad2.addColorStop(0, "rgba(255, 179, 0, 0.14)");
        grad2.addColorStop(0.4, "rgba(255, 106, 0, 0.06)");
        grad2.addColorStop(1, "rgba(252, 250, 247, 0)");
      } else {
        grad2.addColorStop(0, "rgba(255, 179, 0, 0.38)");
        grad2.addColorStop(0.4, "rgba(255, 69, 0, 0.15)");
        grad2.addColorStop(1, "rgba(6, 6, 8, 0)");
      }
      
      ctx.beginPath();
      ctx.arc(slashX, slashY, slashRadius, 0, Math.PI * 2);
      ctx.fillStyle = grad2;
      ctx.fill();

      // 3. Draw thin glowing boundary contours (Arcs outlines)
      ctx.lineWidth = 1.5;
      
      // Bottom Arc stroke
      ctx.beginPath();
      ctx.arc(arc1X, arc1Y, arc1Radius, Math.PI * 1.1, Math.PI * 1.9);
      ctx.strokeStyle = isLight ? "rgba(255, 106, 0, 0.12)" : "rgba(255, 106, 0, 0.25)";
      ctx.stroke();
      
      // Inner bottom arc stroke
      ctx.beginPath();
      ctx.arc(arc1X, arc1Y, arc1Radius - 10, Math.PI * 1.12, Math.PI * 1.88);
      ctx.strokeStyle = isLight ? "rgba(255, 179, 0, 0.04)" : "rgba(255, 179, 0, 0.1)";
      ctx.stroke();

      // Top Right Arc stroke
      ctx.beginPath();
      ctx.arc(slashX, slashY, slashRadius, Math.PI * 0.6, Math.PI * 1.4);
      ctx.strokeStyle = isLight ? "rgba(255, 69, 0, 0.1)" : "rgba(255, 69, 0, 0.22)";
      ctx.stroke();

      // 4. Draw interactive dot grid overlay
      const baseDotOpacity = isLight ? 0.09 : 0.2;
      ctx.fillStyle = `rgba(255, 106, 0, ${baseDotOpacity})`;
      const startX = 0;
      const startY = 0;
      
      for (let gx = startX; gx < width; gx += gridSpacing) {
        for (let gy = startY; gy < height; gy += gridSpacing) {
          ctx.beginPath();
          
          if (mouse.x !== null && mouse.y !== null) {
            const dx = mouse.x - gx;
            const dy = mouse.y - gy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < mouse.radius) {
              const factor = (mouse.radius - dist) / mouse.radius;
              // Make dots closer to the mouse expand and glow
              const shiftX = (dx / dist) * factor * 4;
              const shiftY = (dy / dist) * factor * 4;
              
              ctx.arc(gx + shiftX, gy + shiftY, 1.2 + factor * 1.5, 0, Math.PI * 2);
              const hoverDotOpacity = isLight ? (0.09 + factor * 0.45) : (0.2 + factor * 0.65);
              ctx.fillStyle = `rgba(255, 179, 0, ${hoverDotOpacity})`;
              ctx.fill();
              continue;
            }
          }
          
          // Regular dot drawing
          ctx.arc(gx, gy, 0.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 106, 0, ${baseDotOpacity})`;
          ctx.fill();
        }
      }

      // 5. Draw mouse-following soft spotlight glow
      if (mouse.x !== null && mouse.y !== null) {
        ctx.globalCompositeOperation = isLight ? "multiply" : "screen";
        const mouseGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, mouse.radius);
        if (isLight) {
          mouseGrad.addColorStop(0, "rgba(255, 106, 0, 0.08)");
          mouseGrad.addColorStop(0.5, "rgba(255, 106, 0, 0.03)");
          mouseGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        } else {
          mouseGrad.addColorStop(0, "rgba(255, 106, 0, 0.18)");
          mouseGrad.addColorStop(0.5, "rgba(255, 69, 0, 0.06)");
          mouseGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        }
        
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2);
        ctx.fillStyle = mouseGrad;
        ctx.fill();
        ctx.globalCompositeOperation = "source-over"; // Reset
      }

      // 6. Draw falling orange sparks (vertical streaks)
      ctx.lineWidth = 1;
      sparks.forEach((s) => {
        s.y += s.speedY;
        if (s.y > height) {
          s.y = -s.length;
          s.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x, s.y + s.length);
        const sparkOpacity = isLight ? (s.opacity * 0.5) : s.opacity;
        ctx.strokeStyle = `rgba(255, 136, 0, ${sparkOpacity})`;
        ctx.stroke();
      });

      requestAnimationFrame(animate);
    };

    animate();
  }

  // 4. Instagram Prefilled Order Flow (Strict Room Number 13 Checkout)
  const orderForm = document.getElementById("order-form");
  const modalOverlay = document.getElementById("modal-overlay");

  if (orderForm) {
    orderForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("order-name").value;
      const email = document.getElementById("order-email").value;
      const comic = document.getElementById("order-comic").value;
      const message = document.getElementById("order-message").value;

      const formattedMessage = `Hello Helix Comics! 🧬 I'd like to place an order for your flagship release:
──────────────────────────────────
📖 Comic: Room Number 13 (₹150)
👤 Name: ${name}
✉️ Email: ${email}
💬 Message: ${message || "None"}
──────────────────────────────────
I've copied this message from your site. Please let me know the payment and delivery details!`;

      // Copy message to clipboard
      navigator.clipboard
        .writeText(formattedMessage)
        .then(() => {
          if (modalOverlay) {
            modalOverlay.classList.add("active");
          }

          // Delay for 2.5 seconds to show redirection notification modal
          setTimeout(() => {
            window.open("https://ig.me/m/helix.comics.official", "_blank");
            if (modalOverlay) {
              modalOverlay.classList.remove("active");
            }
          }, 2500);
        })
        .catch((err) => {
          console.error("Clipboard copy failed: ", err);
          window.open("https://ig.me/m/helix.comics.official", "_blank");
        });
    });
  }

  // 5. Floating Helix AI Assistant Panel UI & CORS Scheme Fallback
  const chatBubble = document.getElementById("chat-bubble");
  const chatPanel = document.getElementById("chat-panel");
  const chatClose = document.getElementById("chat-close");
  const chatForm = document.getElementById("chat-form");
  const chatInput = document.getElementById("chat-input");
  const chatMessages = document.getElementById("chat-messages");

  let conversationHistory = [];

  if (chatBubble && chatPanel && chatClose && chatForm && chatInput && chatMessages) {
    // Open panel
    chatBubble.addEventListener("click", () => {
      chatPanel.classList.add("active");
      chatBubble.classList.add("ai-chat-bubble-open");
    });

    // Close panel
    chatClose.addEventListener("click", () => {
      chatPanel.classList.remove("active");
      chatBubble.classList.remove("ai-chat-bubble-open");
    });

    const appendMessage = (role, text) => {
      const msgBubble = document.createElement("div");
      msgBubble.className = `ai-msg ${role === "assistant" ? "ai-msg-received" : "ai-msg-sent"}`;
      msgBubble.textContent = text;
      chatMessages.appendChild(msgBubble);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    chatForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (!text) return;

      appendMessage("user", text);
      conversationHistory.push({ role: "user", content: text });
      chatInput.value = "";

      // Append typing indicator bubble
      const typingIndicator = document.createElement("div");
      typingIndicator.className = "ai-msg-loading";
      typingIndicator.innerHTML = "<span></span><span></span><span></span>";
      chatMessages.appendChild(typingIndicator);
      chatMessages.scrollTop = chatMessages.scrollHeight;

      // CORS scheme redirection check for static filesystem preview protocols (file://)
      const isLocalFile = window.location.protocol === "file:";
      const apiEndpoint = isLocalFile ? "http://localhost:3000/api/chat" : "/api/chat";

      try {
        const response = await fetch(apiEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            messages: conversationHistory,
            location: userLocation // Dispatch location property
          }),
        });

        chatMessages.removeChild(typingIndicator);

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.details || "API endpoint returned status " + response.status);
        }

        const data = await response.json();
        appendMessage("assistant", data.content);
        conversationHistory.push({ role: "assistant", content: data.content });
      } catch (err) {
        console.error("Helix AI Chat error details:", err);
        chatMessages.removeChild(typingIndicator);
        appendMessage(
          "assistant",
          `Synaptic anomaly detected: ${err.message || "Failed to reach server API"}. Please make sure node server.js is running locally.`
        );
      }
    });
  }
});
