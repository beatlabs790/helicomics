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
  // Silent Geolocation API Check (IP-based)
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

  // Local API Endpoint Helper (Handles static file:// fallbacks)
  const getApiUrl = (path) => {
    const isLocalFile = window.location.protocol === "file:";
    return isLocalFile ? `http://localhost:3000${path}` : path;
  };

  // ==========================================
  // 1. SHOPPING CART SYSTEM STATE & TRIGGERS
  // ==========================================
  let cart = JSON.parse(localStorage.getItem("helix_cart") || "[]");

  const saveCart = () => {
    localStorage.setItem("helix_cart", JSON.stringify(cart));
    updateCartUI();
  };

  const updateCartUI = () => {
    // 1. Update count badges
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badges = document.querySelectorAll("#cart-badge-count");
    badges.forEach((b) => {
      b.textContent = totalItems;
      b.style.display = totalItems > 0 ? "inline-block" : "none";
    });

    // 2. Render cart drawer items
    const list = document.getElementById("cart-items-list");
    const totalVal = document.getElementById("cart-total-price");

    if (list) {
      list.innerHTML = "";
      if (cart.length === 0) {
        list.innerHTML = `<div style="text-align: center; color: var(--text-muted); margin-top: 3rem; font-family: var(--font-body);">Your cart is empty.</div>`;
        if (totalVal) totalVal.textContent = "₹0";
      } else {
        let totalSum = 0;
        cart.forEach((item) => {
          const itemSum = item.price * item.quantity;
          totalSum += itemSum;

          const itemEl = document.createElement("div");
          itemEl.className = "cart-item";
          itemEl.innerHTML = `
            <img src="${item.img}" alt="${item.title}" class="cart-item-img">
            <div class="cart-item-details">
              <div class="cart-item-title">${item.title}</div>
              <div class="cart-item-price">₹${item.price}</div>
              <div class="cart-item-controls">
                <button class="cart-qty-btn decrease-qty" data-id="${item.id}">-</button>
                <span class="cart-qty-val">${item.quantity}</span>
                <button class="cart-qty-btn increase-qty" data-id="${item.id}">+</button>
              </div>
            </div>
            <button class="cart-item-delete delete-cart-item" data-id="${item.id}">✕</button>
          `;
          list.appendChild(itemEl);
        });

        if (totalVal) totalVal.textContent = `₹${totalSum}`;
      }
    }

    // 3. Render Order Page items (if current page is order checkout)
    const summaryList = document.getElementById("order-summary-items");
    if (summaryList) {
      summaryList.innerHTML = "";
      if (cart.length === 0) {
        summaryList.innerHTML = `<div style="color: var(--text-muted);">No items in cart. Go back to comics and add items!</div>`;
      } else {
        const orderLocationSelect = document.getElementById("order-location");
        const shippingRate = orderLocationSelect ? parseInt(orderLocationSelect.options[orderLocationSelect.selectedIndex].getAttribute("data-rate")) : 0;
        const shippingText = orderLocationSelect ? orderLocationSelect.options[orderLocationSelect.selectedIndex].text.split(" - ")[0] : "Shipping";

        let totalSum = 0;
        cart.forEach((item) => {
          const itemSum = item.price * item.quantity;
          totalSum += itemSum;

          const summaryRow = document.createElement("div");
          summaryRow.style.display = "flex";
          summaryRow.style.justify = "space-between";
          summaryRow.innerHTML = `
            <span>📖 ${item.title} (x${item.quantity})</span>
            <span style="color: var(--color-accent); font-weight: 700;">₹${itemSum}</span>
          `;
          summaryList.appendChild(summaryRow);
        });

        // Subtotal
        const subtotalRow = document.createElement("div");
        subtotalRow.style.display = "flex";
        subtotalRow.style.justify = "space-between";
        subtotalRow.style.borderTop = "1px dashed var(--border-glass)";
        subtotalRow.style.paddingTop = "0.8rem";
        subtotalRow.style.marginTop = "0.4rem";
        subtotalRow.style.fontSize = "0.9rem";
        subtotalRow.innerHTML = `
          <span style="color: var(--text-muted);">Items Subtotal:</span>
          <span>₹${totalSum}</span>
        `;
        summaryList.appendChild(subtotalRow);

        // Shipping
        const shippingRow = document.createElement("div");
        shippingRow.style.display = "flex";
        shippingRow.style.justify = "space-between";
        shippingRow.style.fontSize = "0.9rem";
        shippingRow.innerHTML = `
          <span style="color: var(--text-muted);">${shippingText}:</span>
          <span>₹${shippingRate}</span>
        `;
        summaryList.appendChild(shippingRow);

        // Total
        const totalRow = document.createElement("div");
        totalRow.style.display = "flex";
        totalRow.style.justify = "space-between";
        totalRow.style.borderTop = "1px solid var(--border-glass)";
        totalRow.style.paddingTop = "0.8rem";
        totalRow.style.marginTop = "0.4rem";
        totalRow.style.fontWeight = "700";
        totalRow.innerHTML = `
          <span>Order Total:</span>
          <span style="color: var(--color-primary); font-size: 1.15rem;">₹${totalSum + shippingRate}</span>
        `;
        summaryList.appendChild(totalRow);
      }
    }
  };

  const addToCart = (id, title, price, img, btn) => {
    const existing = cart.find((item) => item.id === id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ id, title, price: parseInt(price), img, quantity: 1 });
    }
    saveCart();
    
    // Flying Particle Animation
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const cartBtnEl = document.getElementById("nav-cart-btn");
      if (cartBtnEl) {
        const cartRect = cartBtnEl.getBoundingClientRect();
        
        // Spawn particle
        const particle = document.createElement("div");
        particle.className = "cart-flying-particle";
        particle.style.left = `${rect.left + rect.width / 2 - 7}px`;
        particle.style.top = `${rect.top + rect.height / 2 - 7}px`;
        document.body.appendChild(particle);
        
        // Force reflow
        particle.offsetWidth;
        
        // Animate coordinates
        particle.style.left = `${cartRect.left + cartRect.width / 2 - 7}px`;
        particle.style.top = `${cartRect.top + cartRect.height / 2 - 7}px`;
        particle.style.transform = "scale(0.3)";
        particle.style.opacity = "0.2";
        
        // Land particle & pulse badge
        setTimeout(() => {
          particle.remove();
          const badgeCount = document.getElementById("cart-badge-count");
          if (badgeCount) {
            badgeCount.classList.add("badge-pulse");
            setTimeout(() => {
              badgeCount.classList.remove("badge-pulse");
            }, 450);
          }
        }, 800);
      }
    }
    
    // Open drawer automatically on add after particle lands
    setTimeout(() => {
      openCartDrawer();
    }, 850);
  };

  // Bind cart item controls (delegated click listeners on list)
  const cartList = document.getElementById("cart-items-list");
  if (cartList) {
    cartList.addEventListener("click", (e) => {
      const btn = e.target;
      const id = btn.getAttribute("data-id");

      if (btn.classList.contains("increase-qty")) {
        const item = cart.find((i) => i.id === id);
        if (item) item.quantity += 1;
        saveCart();
      } else if (btn.classList.contains("decrease-qty")) {
        const item = cart.find((i) => i.id === id);
        if (item) {
          item.quantity -= 1;
          if (item.quantity <= 0) {
            cart = cart.filter((i) => i.id !== id);
          }
        }
        saveCart();
      } else if (btn.classList.contains("delete-cart-item")) {
        cart = cart.filter((i) => i.id !== id);
        saveCart();
      }
    });
  }

  // Bind Add-To-Cart buttons
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("add-to-cart-trigger")) {
      const btn = e.target;
      const id = btn.getAttribute("data-id");
      const title = btn.getAttribute("data-title");
      const price = btn.getAttribute("data-price");
      const img = btn.getAttribute("data-img");
      addToCart(id, title, price, img, btn);
    }
  });

  // Cart Drawer UI Toggles
  const cartDrawer = document.getElementById("cart-drawer");
  const drawerOverlay = document.getElementById("drawer-overlay");
  const cartCloseBtn = document.getElementById("cart-close-btn");
  const cartBtn = document.getElementById("nav-cart-btn");
  const cartCheckoutTrigger = document.getElementById("cart-checkout-trigger");

  const openCartDrawer = () => {
    if (cartDrawer && drawerOverlay) {
      cartDrawer.classList.add("active");
      drawerOverlay.classList.add("active");
    }
  };

  const closeCartDrawer = () => {
    if (cartDrawer && drawerOverlay) {
      cartDrawer.classList.remove("active");
      drawerOverlay.classList.remove("active");
    }
  };

  if (cartBtn) cartBtn.addEventListener("click", openCartDrawer);
  if (cartCloseBtn) cartCloseBtn.addEventListener("click", closeCartDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener("click", closeCartDrawer);

  if (cartCheckoutTrigger) {
    cartCheckoutTrigger.addEventListener("click", () => {
      closeCartDrawer();
      window.location.href = "order.html";
    });
  }

  // Initial cart UI render
  updateCartUI();

  // ==========================================
  // 2. USER AUTHENTICATION STATE & LOGINS
  // ==========================================
  let currentUser = JSON.parse(localStorage.getItem("helix_user") || "null");

  const loginModal = document.getElementById("login-modal");
  const loginCloseBtn = document.getElementById("login-close-btn");
  const navLoginBtn = document.getElementById("nav-login-btn");
  const profileMenu = document.getElementById("nav-profile-menu");
  const logoutBtn = document.getElementById("nav-logout-btn");

  const openLoginModal = () => {
    if (loginModal) {
      // Reset form variables
      isSignUp = false;
      toggleAuthFormState();
      const errMsg = document.getElementById("auth-error-msg");
      if (errMsg) errMsg.style.display = "none";
      const form = document.getElementById("auth-form");
      if (form) form.reset();
      loginModal.classList.add("active");
    }
  };

  const closeLoginModal = () => {
    if (loginModal) {
      loginModal.classList.remove("active");
    }
  };

  if (navLoginBtn) {
    navLoginBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (currentUser) {
        // Toggle profile dropdown options menu
        if (profileMenu) {
          profileMenu.style.display = profileMenu.style.display === "block" ? "none" : "block";
        }
      } else {
        openLoginModal();
      }
    });
  }

  // Hide profile menu when clicking outside
  document.addEventListener("click", () => {
    if (profileMenu) profileMenu.style.display = "none";
  });

  if (loginCloseBtn) loginCloseBtn.addEventListener("click", closeLoginModal);
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("helix_user");
      currentUser = null;
      updateAuthUI();
      // Reload page to reset forms
      window.location.reload();
    });
  }

  // Toggle between Login & Signup states
  let isSignUp = false;
  const authTitle = document.getElementById("auth-title");
  const authSubtitle = document.getElementById("auth-subtitle");
  const authSubmitBtn = document.getElementById("auth-submit-btn");
  const authNameGroup = document.getElementById("auth-name-group");
  const authSwitchText = document.getElementById("auth-switch-text");
  const authSwitchLink = document.getElementById("auth-switch-link");

  const toggleAuthFormState = () => {
    if (isSignUp) {
      if (authTitle) authTitle.textContent = "Create Account";
      if (authSubtitle) authSubtitle.textContent = "Sign up to start placing orders";
      if (authSubmitBtn) authSubmitBtn.textContent = "Sign Up";
      if (authNameGroup) authNameGroup.style.display = "block";
      if (authNameGroup) authNameGroup.querySelector("input").required = true;
      if (authSwitchText) authSwitchText.textContent = "Already have an account?";
      if (authSwitchLink) authSwitchLink.textContent = "Log In";
    } else {
      if (authTitle) authTitle.textContent = "Welcome Back";
      if (authSubtitle) authSubtitle.textContent = "Login to manage your orders";
      if (authSubmitBtn) authSubmitBtn.textContent = "Log In";
      if (authNameGroup) authNameGroup.style.display = "none";
      if (authNameGroup) authNameGroup.querySelector("input").required = false;
      if (authSwitchText) authSwitchText.textContent = "Don't have an account?";
      if (authSwitchLink) authSwitchLink.textContent = "Sign Up";
    }
  };

  if (authSwitchLink) {
    authSwitchLink.addEventListener("click", () => {
      isSignUp = !isSignUp;
      const errMsg = document.getElementById("auth-error-msg");
      if (errMsg) errMsg.style.display = "none";
      toggleAuthFormState();
    });
  }

  // Handle Authentication submit
  const authForm = document.getElementById("auth-form");
  const authErrorMsg = document.getElementById("auth-error-msg");

  if (authForm) {
    authForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (authErrorMsg) authErrorMsg.style.display = "none";

      const email = document.getElementById("auth-email").value;
      const password = document.getElementById("auth-password").value;
      const name = document.getElementById("auth-name").value;

      const path = isSignUp ? "/api/signup" : "/api/login";
      const payload = isSignUp ? { name, email, password } : { email, password };

      try {
        const response = await fetch(getApiUrl(path), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Authentication failed");
        }

        // Save session
        localStorage.setItem("helix_user", JSON.stringify(data.user));
        currentUser = data.user;
        updateAuthUI();
        closeLoginModal();
      } catch (err) {
        console.warn("Backend authentication failed. Falling back to local database:", err);

        // Fallback Client-side Local Storage Database
        try {
          let localUsers = JSON.parse(localStorage.getItem("helix_local_users") || "[]");
          const normalizedEmail = email.toLowerCase().trim();

          if (isSignUp) {
            // Sign Up fallback
            const exists = localUsers.find((u) => u.email.toLowerCase().trim() === normalizedEmail);
            if (exists) {
              throw new Error("An account with this email address already exists (Local database)");
            }
            const newUser = { name: name.trim(), email: normalizedEmail, password };
            localUsers.push(newUser);
            localStorage.setItem("helix_local_users", JSON.stringify(localUsers));

            localStorage.setItem("helix_user", JSON.stringify({ name: newUser.name, email: newUser.email }));
            currentUser = { name: newUser.name, email: newUser.email };
          } else {
            // Login fallback
            const user = localUsers.find(
              (u) => u.email.toLowerCase().trim() === normalizedEmail && u.password === password
            );
            if (!user) {
              throw new Error("Invalid email address or password (Local database)");
            }
            localStorage.setItem("helix_user", JSON.stringify({ name: user.name, email: user.email }));
            currentUser = { name: user.name, email: user.email };
          }

          updateAuthUI();
          closeLoginModal();
        } catch (localErr) {
          if (authErrorMsg) {
            authErrorMsg.textContent = localErr.message;
            authErrorMsg.style.display = "block";
          }
        }
      }
    });
  }

  const updateAuthUI = () => {
    const loginLabel = document.getElementById("nav-login-btn");
    if (loginLabel) {
      if (currentUser) {
        loginLabel.innerHTML = `<span>👤</span> ${currentUser.name}`;
        
        // Pre-fill checkout order forms if present
        const orderName = document.getElementById("order-name");
        const orderEmail = document.getElementById("order-email");
        if (orderName) orderName.value = currentUser.name;
        if (orderEmail) orderEmail.value = currentUser.email;
      } else {
        loginLabel.innerHTML = `<span>👤</span> Login`;
      }
    }
  };

  // Run Auth check on launch
  updateAuthUI();

  // ==========================================
  // 3. UI LAYOUT & STYLE UTILITIES
  // ==========================================

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

  // Mobile Hamburger Menu Toggle
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

  // Scroll Reveal Observer
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

  // Live Interactive Background Canvas (Light & Dark Theme Adaptable)
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
              const shiftX = (dx / dist) * factor * 4;
              const shiftY = (dy / dist) * factor * 4;
              
              ctx.arc(gx + shiftX, gy + shiftY, 1.2 + factor * 1.5, 0, Math.PI * 2);
              const hoverDotOpacity = isLight ? (0.09 + factor * 0.45) : (0.2 + factor * 0.65);
              ctx.fillStyle = `rgba(255, 179, 0, ${hoverDotOpacity})`;
              ctx.fill();
              continue;
            }
          }
          
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

      // 6. Draw falling orange sparks
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

  // ==========================================
  // 4. INSTAGRAM DM ORDER CHECKOUT WITH GUARDS
  // ==========================================
  const orderForm = document.getElementById("order-form");
  const modalOverlay = document.getElementById("modal-overlay");

  if (orderForm) {
    orderForm.addEventListener("submit", (e) => {
      e.preventDefault();

      // Guard: User must be logged in to order
      if (!currentUser) {
        alert("Please log in or register an account before proceeding to checkout!");
        openLoginModal();
        return;
      }

      if (cart.length === 0) {
        alert("Your shopping cart is empty! Add comics before checking out.");
        return;
      }

      const name = document.getElementById("order-name").value;
      const email = document.getElementById("order-email").value;
      const phone = document.getElementById("order-phone").value;
      const message = document.getElementById("order-message").value;

      const locationSelect = document.getElementById("order-location");
      const shippingRate = locationSelect ? parseInt(locationSelect.options[locationSelect.selectedIndex].getAttribute("data-rate")) : 0;
      const shippingRegionText = locationSelect ? locationSelect.options[locationSelect.selectedIndex].text : "Local";

      const orderId = "HLX-" + Math.floor(10000 + Math.random() * 90000);

      // Compile cart items breakdown
      let cartItemsText = "";
      let totalAmount = 0;
      cart.forEach((item) => {
        const itemSum = item.price * item.quantity;
        totalAmount += itemSum;
        cartItemsText += `  • ${item.quantity}x ${item.title} (₹${itemSum})\n`;
      });

      const totalOrderAmount = totalAmount + shippingRate;

      const formattedMessage = `Hello Helix Comics! 🧬 I'd like to place an order:
──────────────────────────────────
📦 Order ID: #${orderId}
🛒 Order Items:
${cartItemsText}
🚚 Shipping (${shippingRegionText}): ₹${shippingRate}
💰 Total Amount: ₹${totalOrderAmount}
👤 Name: ${name}
📞 Mobile: ${phone}
✉️ Email: ${email}
📍 Shipping Address: ${message}
──────────────────────────────────
I've copied this order reference from your site. Please let me know the payment details!`;

      const orderPayload = {
        orderId,
        email: currentUser.email,
        name,
        phone,
        address: message,
        items: cart.map(item => ({ id: item.id, title: item.title, price: item.price, quantity: item.quantity })),
        shippingRate,
        shippingRegion: shippingRegionText,
        totalAmount: totalOrderAmount
      };

      // Save order to server or local storage fallback
      fetch(getApiUrl("/api/orders"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      }).catch(err => {
        console.warn("Backend order saving failed. Syncing to local storage:", err);
        let localOrders = JSON.parse(localStorage.getItem("helix_orders") || "[]");
        localOrders.push({
          ...orderPayload,
          status: "Pending",
          date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
          timestamp: Date.now()
        });
        localStorage.setItem("helix_orders", JSON.stringify(localOrders));
      });

      // Copy message to clipboard
      navigator.clipboard
        .writeText(formattedMessage)
        .then(() => {
          // Render receipt modal overlay contents dynamically
          const receiptBreakdown = document.getElementById("receipt-items-breakdown");
          const receiptTotalAmount = document.getElementById("receipt-total-amount");
          const receiptClipboardPreview = document.getElementById("receipt-clipboard-preview");
          
          if (receiptBreakdown) {
            receiptBreakdown.innerHTML = `
              <div style="font-size: 0.85rem; color: var(--color-primary); font-family: var(--font-ui); font-weight: 700; margin-bottom: 0.8rem; border-bottom: 1px dashed rgba(255,255,255,0.06); padding-bottom: 0.5rem;">ORDER REF: #${orderId}</div>
            `;
            cart.forEach((item) => {
              const row = document.createElement("div");
              row.className = "receipt-line-item";
              row.innerHTML = `<span>📖 ${item.title} (x${item.quantity})</span><span>₹${item.price * item.quantity}</span>`;
              receiptBreakdown.appendChild(row);
            });

            // Add shipping row
            const shipRow = document.createElement("div");
            shipRow.className = "receipt-line-item";
            shipRow.style.color = "var(--text-muted)";
            shipRow.innerHTML = `<span>🚚 Shipping Charge</span><span>₹${shippingRate}</span>`;
            receiptBreakdown.appendChild(shipRow);
          }
          
          if (receiptTotalAmount) {
            receiptTotalAmount.textContent = `₹${totalOrderAmount}`;
          }
          
          if (receiptClipboardPreview) {
            receiptClipboardPreview.value = formattedMessage;
          }

          if (modalOverlay) {
            modalOverlay.classList.add("active");
          }

          // Clear cart on success
          cart = [];
          saveCart();
        })
        .catch((err) => {
          console.error("Clipboard copy failed: ", err);
          window.open("https://ig.me/m/helix.comics.official", "_blank");
        });
    });
  }

  // Bind shipping location update event listener
  const checkoutLocationSelect = document.getElementById("order-location");
  if (checkoutLocationSelect) {
    checkoutLocationSelect.addEventListener("change", updateCartUI);
  }

  // Receipt modal redirection action triggers
  const receiptLaunchTrigger = document.getElementById("receipt-launch-trigger");
  const receiptCancelTrigger = document.getElementById("receipt-cancel-trigger");

  if (receiptLaunchTrigger) {
    receiptLaunchTrigger.addEventListener("click", () => {
      window.open("https://ig.me/m/helix.comics.official", "_blank");
      if (modalOverlay) modalOverlay.classList.remove("active");
      window.location.href = "index.html";
    });
  }

  if (receiptCancelTrigger) {
    receiptCancelTrigger.addEventListener("click", () => {
      if (modalOverlay) modalOverlay.classList.remove("active");
      window.location.href = "index.html";
    });
  }

  // ==========================================
  // 4b. USER ORDERS TRACKING DASHBOARD MODAL
  // ==========================================
  const dashboardModal = document.getElementById("dashboard-modal");
  const navOrdersBtn = document.getElementById("nav-orders-btn");
  const dashboardCloseBtn = document.getElementById("dashboard-close-btn");
  const dashboardUserName = document.getElementById("dashboard-user-name");
  const dashboardUserEmail = document.getElementById("dashboard-user-email");
  const dashboardOrdersList = document.getElementById("dashboard-orders-list");

  const openDashboardModal = () => {
    if (!currentUser) return;
    if (dashboardUserName) dashboardUserName.textContent = currentUser.name;
    if (dashboardUserEmail) dashboardUserEmail.textContent = currentUser.email;
    fetchUserOrders();
    if (dashboardModal) dashboardModal.classList.add("active");
  };

  const closeDashboardModal = () => {
    if (dashboardModal) dashboardModal.classList.remove("active");
  };

  if (navOrdersBtn) {
    navOrdersBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openDashboardModal();
    });
  }

  if (dashboardCloseBtn) {
    dashboardCloseBtn.addEventListener("click", closeDashboardModal);
  }

  // Fetch orders from server or fallback localStorage database
  const fetchUserOrders = async () => {
    if (!currentUser) return;
    if (!dashboardOrdersList) return;

    dashboardOrdersList.innerHTML = "<div style='color: var(--text-muted);'>Syncing orders data...</div>";

    try {
      const response = await fetch(getApiUrl("/api/orders?email=" + encodeURIComponent(currentUser.email)));
      if (!response.ok) {
        throw new Error("HTTP status: " + response.status);
      }
      const orders = await response.json();
      renderDashboardOrders(orders);
    } catch (err) {
      console.warn("Backend order fetching failed. Loading from local database:", err);
      // Fallback: Read local storage
      const localOrders = JSON.parse(localStorage.getItem("helix_orders") || "[]");
      const filtered = localOrders.filter(o => o.email.toLowerCase().trim() === currentUser.email.toLowerCase().trim());
      // Sort newest first
      filtered.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      renderDashboardOrders(filtered);
    }
  };

  // Render orders inside tracking dashboard
  const renderDashboardOrders = (orders) => {
    if (!dashboardOrdersList) return;
    dashboardOrdersList.innerHTML = "";

    if (orders.length === 0) {
      dashboardOrdersList.innerHTML = "<div style='color: var(--text-muted); font-family: var(--font-body); font-style: italic;'>No orders logged under this account. Place a new checkout to start tracking!</div>";
      return;
    }

    orders.forEach((order) => {
      const card = document.createElement("div");
      card.className = "dashboard-order-card";

      // Items list HTML
      const itemsHtml = order.items.map(item => `📖 ${item.title} (x${item.quantity}) - ₹${item.price * item.quantity}`).join("<br>");

      // Timeline tracker indicator
      let timelineHtml = "";
      if (order.status === "Cancelled") {
        timelineHtml = `
          <div class="order-timeline" style="margin: 1rem 0;">
            <div class="order-timeline-step cancelled" style="width: 100%;">
              <div class="order-timeline-dot"></div>
              <span>Order Cancelled</span>
            </div>
          </div>
        `;
      } else {
        const orderSteps = ["Pending", "Processed", "Shipped", "Delivered"];
        const curIndex = orderSteps.indexOf(order.status);
        const progressPercentage = curIndex === -1 ? 0 : (curIndex / (orderSteps.length - 1)) * 100;

        const getStepClass = (step) => {
          const stepIndex = orderSteps.indexOf(step);
          if (stepIndex < curIndex) return "completed";
          if (stepIndex === curIndex) return "current";
          return "";
        };

        timelineHtml = `
          <div class="order-timeline">
            <div class="order-timeline-progress" style="width: ${progressPercentage}%"></div>
            <div class="order-timeline-step ${getStepClass("Pending")}">
              <div class="order-timeline-dot"></div>
              <span>Pending</span>
            </div>
            <div class="order-timeline-step ${getStepClass("Processed")}">
              <div class="order-timeline-dot"></div>
              <span>Processed</span>
            </div>
            <div class="order-timeline-step ${getStepClass("Shipped")}">
              <div class="order-timeline-dot"></div>
              <span>Shipped</span>
            </div>
            <div class="order-timeline-step ${getStepClass("Delivered")}">
              <div class="order-timeline-dot"></div>
              <span>Delivered</span>
            </div>
          </div>
        `;
      }

      // Actions section (Cancel/Modify) - only if Pending
      let actionsHtml = "";
      if (order.status === "Pending") {
        actionsHtml = `
          <div style="display: flex; gap: 0.8rem; margin-top: 1rem;" id="actions-panel-${order.orderId}">
            <button class="btn-dashboard-action btn-dashboard-modify modify-address-trigger" data-id="${order.orderId}">Modify Address</button>
            <button class="btn-dashboard-action btn-dashboard-cancel cancel-order-trigger" data-id="${order.orderId}">Cancel Order</button>
          </div>
          <div class="modify-address-form-wrapper" id="modify-form-container-${order.orderId}" style="display: none;">
            <textarea class="form-textarea" style="height: 60px; font-size: 0.85rem;" id="modify-address-input-${order.orderId}">${order.address}</textarea>
            <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
              <button class="btn-cta save-modified-address-btn" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; height: auto; border-radius: 8px;" data-id="${order.orderId}">Save</button>
              <button class="btn-secondary close-modify-address-btn" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; height: auto; border-radius: 8px;" data-id="${order.orderId}">Cancel</button>
            </div>
          </div>
        `;
      }

      card.innerHTML = `
        <div class="dashboard-order-header">
          <h4 style="margin: 0; color: var(--color-accent);">Order Reference: #${order.orderId}</h4>
          <span style="font-size: 0.8rem; color: var(--text-muted);">${order.date}</span>
        </div>
        <div style="font-size: 0.95rem; line-height: 1.6; margin-bottom: 0.5rem;">
          ${itemsHtml}
        </div>
        <div style="font-size: 0.9rem; margin-top: 0.5rem; border-top: 1px dashed rgba(255,255,255,0.04); padding-top: 0.5rem;">
          <span style="color: var(--text-muted);">Region:</span> ${order.shippingRegion || "Local"}
        </div>
        <div style="font-weight: 700; color: var(--color-primary); font-size: 1.05rem; margin-top: 0.2rem;">
          Total Price: ₹${order.totalAmount}
        </div>
        <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.5rem; line-height: 1.4;">
          📍 Address: <span id="address-label-${order.orderId}">${order.address}</span>
        </div>
        ${timelineHtml}
        ${actionsHtml}
      `;

      dashboardOrdersList.appendChild(card);
    });

    // Bind modify address show trigger
    document.querySelectorAll(".modify-address-trigger").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const actionsPanel = document.getElementById("actions-panel-" + id);
        const formContainer = document.getElementById("modify-form-container-" + id);
        if (actionsPanel) actionsPanel.style.display = "none";
        if (formContainer) formContainer.style.display = "block";
      });
    });

    // Bind modify close trigger
    document.querySelectorAll(".close-modify-address-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const actionsPanel = document.getElementById("actions-panel-" + id);
        const formContainer = document.getElementById("modify-form-container-" + id);
        if (actionsPanel) actionsPanel.style.display = "flex";
        if (formContainer) formContainer.style.display = "none";
      });
    });

    // Bind save modify address trigger
    document.querySelectorAll(".save-modified-address-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        const addressInput = document.getElementById("modify-address-input-" + id);
        if (!addressInput) return;
        const newAddress = addressInput.value.trim();
        if (!newAddress) {
          alert("Shipping address cannot be empty!");
          return;
        }
        await modifyUserOrder(id, newAddress);
      });
    });

    // Bind cancel order trigger
    document.querySelectorAll(".cancel-order-trigger").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        if (confirm("Are you sure you want to cancel order #" + id + "?")) {
          await cancelUserOrder(id);
        }
      });
    });
  };

  // Cancel order method
  const cancelUserOrder = async (orderId) => {
    try {
      const response = await fetch(getApiUrl("/api/orders/cancel"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, email: currentUser.email })
      });
      if (!response.ok) {
        throw new Error("HTTP status: " + response.status);
      }
      fetchUserOrders();
    } catch (err) {
      console.warn("Backend order cancellation failed. Syncing locally:", err);
      // Fallback
      let localOrders = JSON.parse(localStorage.getItem("helix_orders") || "[]");
      const orderIndex = localOrders.findIndex(o => o.orderId === orderId && o.email.toLowerCase().trim() === currentUser.email.toLowerCase().trim());
      if (orderIndex !== -1) {
        if (localOrders[orderIndex].status === "Pending" || !localOrders[orderIndex].status) {
          localOrders[orderIndex].status = "Cancelled";
          localStorage.setItem("helix_orders", JSON.stringify(localOrders));
        }
      }
      fetchUserOrders();
    }
  };

  // Modify order address method
  const modifyUserOrder = async (orderId, newAddress) => {
    try {
      const response = await fetch(getApiUrl("/api/orders/modify"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, email: currentUser.email, address: newAddress })
      });
      if (!response.ok) {
        throw new Error("HTTP status: " + response.status);
      }
      fetchUserOrders();
    } catch (err) {
      console.warn("Backend order address modification failed. Syncing locally:", err);
      // Fallback
      let localOrders = JSON.parse(localStorage.getItem("helix_orders") || "[]");
      const orderIndex = localOrders.findIndex(o => o.orderId === orderId && o.email.toLowerCase().trim() === currentUser.email.toLowerCase().trim());
      if (orderIndex !== -1) {
        if (localOrders[orderIndex].status === "Pending" || !localOrders[orderIndex].status) {
          localOrders[orderIndex].address = newAddress;
          localStorage.setItem("helix_orders", JSON.stringify(localOrders));
        }
      }
      fetchUserOrders();
    }
  };

  // ==========================================
  // 5. HELIX AI ASSISTANT CHAT ROUTER
  // ==========================================
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

      try {
        const response = await fetch(getApiUrl("/api/chat"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            messages: conversationHistory,
            location: userLocation
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
        console.error("Helix AI Chat error:", err);
        chatMessages.removeChild(typingIndicator);
        appendMessage(
          "assistant",
          `Synaptic anomaly detected: ${err.message || "Failed to reach server API"}. Please make sure node server.js is running locally.`
        );
      }
    });

    // Bind preset questions to fill the form input and submit automatically
    document.querySelectorAll(".ai-chat-preset-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const query = btn.getAttribute("data-query");
        if (chatInput && chatForm && query) {
          chatInput.value = query;
          chatForm.dispatchEvent(new Event("submit"));
        }
      });
    });

    // Speech-to-Text Voice Recognition Integration
    const micBtn = document.getElementById("chat-mic-btn");
    if (micBtn) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = "en-US";
        recognition.interimResults = false;
        
        let isRecording = false;
        
        micBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          if (!isRecording) {
            try {
              recognition.start();
            } catch (err) {
              console.error("Speech Recognition starting error:", err);
            }
          } else {
            recognition.stop();
          }
        });
        
        recognition.onstart = () => {
          isRecording = true;
          micBtn.classList.add("recording");
          if (chatInput) chatInput.placeholder = "Listening... Speak now...";
        };
        
        recognition.onend = () => {
          isRecording = false;
          micBtn.classList.remove("recording");
          if (chatInput) chatInput.placeholder = "Ask about comics, lore, or developers...";
        };
        
        recognition.onerror = (event) => {
          console.error("Speech Recognition error:", event.error);
          isRecording = false;
          micBtn.classList.remove("recording");
        };
        
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          if (chatInput && chatForm) {
            chatInput.value = transcript;
            chatForm.dispatchEvent(new Event("submit"));
          }
        };
      } else {
        micBtn.style.opacity = "0.4";
        micBtn.title = "Speech Recognition not supported in this browser";
        micBtn.addEventListener("click", () => {
          alert("Speech Recognition is not supported in this browser. Try Chrome or Edge!");
        });
      }
    }
  }
});
