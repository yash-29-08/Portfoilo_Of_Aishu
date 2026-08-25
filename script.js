(() => {
  "use strict";

  /* Safety net: if anything below throws, don't leave the visitor stuck
     behind the intro screen — force the real app open immediately. */
  window.addEventListener("error", () => {
    const overlay = document.getElementById("introOverlay");
    const reveal = document.getElementById("nameReveal");
    const app = document.getElementById("app");
    if (overlay) { overlay.setAttribute("hidden", ""); }
    if (reveal) { reveal.setAttribute("hidden", ""); }
    if (app) { app.removeAttribute("hidden"); app.classList.add("visible"); }
  });

  const reduceMotion = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  /* ----------------------------------------------------------
     EDITABLE LINKS — replace these three when you have them
  ---------------------------------------------------------- */
  const LINKS = {
    github: "https://github.com/",
    linkedin: "https://www.linkedin.com/",
    resume: "https://example.com/aishani-agrawal-resume.pdf",
  };
  document.querySelectorAll("[data-github-link]").forEach(el => el.href = LINKS.github);
  document.querySelectorAll("[data-linkedin-link]").forEach(el => el.href = LINKS.linkedin);
  document.querySelectorAll("[data-resume-link]").forEach(el => el.href = LINKS.resume);

  /* ----------------------------------------------------------
     TOASTS
  ---------------------------------------------------------- */
  const toastContainer = document.getElementById("toastContainer");
  function showToast(main, sub) {
    const el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = `<span>${main}</span>${sub ? `<small>${sub}</small>` : ""}`;
    toastContainer.appendChild(el);
    requestAnimationFrame(() => el.classList.add("show"));
    setTimeout(() => {
      el.classList.remove("show");
      setTimeout(() => el.remove(), 300);
    }, 2600);
  }

  /* ----------------------------------------------------------
     SEARCH INTRO SEQUENCE
  ---------------------------------------------------------- */
  const introOverlay = document.getElementById("introOverlay");
  const typedQuery = document.getElementById("typedQuery");
  const searchResultWrap = document.getElementById("searchResultWrap");
  const resultCount = document.getElementById("resultCount");
  const resultCard = document.getElementById("resultCard");
  const nameReveal = document.getElementById("nameReveal");
  const app = document.getElementById("app");

  const placeholder = "Search people, projects, ideas...";
  const query = "Aishani Agrawal";

  function typeText(el, text, speed, done) {
    if (reduceMotion) { el.textContent = text; if (done) done(); return; }
    let i = 0;
    el.textContent = "";
    (function step() {
      if (i <= text.length) {
        el.textContent = text.slice(0, i);
        i++;
        setTimeout(step, speed);
      } else if (done) done();
    })();
  }

  function runIntroSequence() {
    typeText(typedQuery, placeholder, 28, () => {
      setTimeout(() => {
        typeText(typedQuery, "", 10, () => {
          setTimeout(() => {
            typeText(typedQuery, query, 55, () => {
              setTimeout(revealResult, 400);
            });
          }, 300);
        });
      }, 900);
    });
  }

  function revealResult() {
    resultCount.textContent = "1 interesting person found";
    searchResultWrap.classList.add("show");
    resultCard.setAttribute("aria-hidden", "false");
  }

  function enterProfile() {
    introOverlay.classList.add("hide");
    setTimeout(() => {
      introOverlay.setAttribute("hidden", "");
      playNameReveal();
    }, 550);
  }

  function playNameReveal() {
    nameReveal.classList.add("playing");
    const holdTime = reduceMotion ? 400 : 1300;
    setTimeout(() => {
      nameReveal.classList.add("shrink");
      showApp();
      setTimeout(() => nameReveal.setAttribute("hidden", ""), 550);
    }, holdTime);
  }

  function showApp() {
    app.removeAttribute("hidden");
    requestAnimationFrame(() => app.classList.add("visible"));
  }

  resultCard.addEventListener("click", enterProfile);
  resultCard.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); enterProfile(); }
  });

  const introSkip = document.getElementById("introSkip");
  if (introSkip) introSkip.addEventListener("click", enterProfile);

  runIntroSequence();

  // Extra safety net: if the search animation ever stalls for any reason,
  // don't trap the visitor — reveal the result after a few seconds regardless.
  setTimeout(() => {
    if (!searchResultWrap.classList.contains("show")) revealResult();
  }, 5000);

  /* ----------------------------------------------------------
     AVATAR STATUS ROTATION
  ---------------------------------------------------------- */
  const statuses = ["building something", "probably coding", "learning something unnecessarily specific"];
  let statusIndex = 0;
  const statusText = document.getElementById("statusText");
  if (!reduceMotion) {
    setInterval(() => {
      statusIndex = (statusIndex + 1) % statuses.length;
      statusText.textContent = statuses[statusIndex];
    }, 4200);
  }

  /* ----------------------------------------------------------
     SIDEBAR / MOBILE NAV — active section scrollspy
  ---------------------------------------------------------- */
  const sections = document.querySelectorAll("main.feed section[id]");
  const navLinks = document.querySelectorAll("[data-nav]");

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        navLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
        });
      }
    });
  }, { threshold: 0.4, rootMargin: "-10% 0px -50% 0px" });

  sections.forEach((s) => navObserver.observe(s));

  /* ----------------------------------------------------------
     RABBIT HOLE SCROLL PROGRESS
  ---------------------------------------------------------- */
  const rabbitHoleReadout = document.getElementById("rabbitHoleReadout");
  function updateRabbitHole() {
    const doc = document.documentElement;
    const scrolled = doc.scrollTop;
    const max = doc.scrollHeight - doc.clientHeight;
    const pct = max > 0 ? Math.min(100, Math.round((scrolled / max) * 100)) : 0;
    if (rabbitHoleReadout) rabbitHoleReadout.textContent = `rabbit hole: ${pct}% complete`;
  }
  window.addEventListener("scroll", updateRabbitHole, { passive: true });
  updateRabbitHole();

  /* ----------------------------------------------------------
     PINNED "WHY I BUILD" FLIP
  ---------------------------------------------------------- */
  const pinnedCard = document.querySelector(".pinned-card");
  if (pinnedCard) {
    const flipObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setTimeout(() => pinnedCard.classList.add("flip"), 1200);
          flipObserver.disconnect();
        }
      });
    }, { threshold: 0.6 });
    flipObserver.observe(pinnedCard);
  }

  /* ----------------------------------------------------------
     THREE-DOT MENU / EASTER EGG
  ---------------------------------------------------------- */
  const menuBtn = document.getElementById("menuBtn");
  const menuPopover = document.getElementById("menuPopover");

  function closeMenu() {
    menuPopover.setAttribute("hidden", "");
    menuBtn.setAttribute("aria-expanded", "false");
  }

  menuBtn.addEventListener("click", () => {
    const isOpen = !menuPopover.hasAttribute("hidden");
    if (isOpen) { closeMenu(); return; }
    menuPopover.removeAttribute("hidden");
    menuBtn.setAttribute("aria-expanded", "true");
  });

  document.addEventListener("click", (e) => {
    if (!menuPopover.hasAttribute("hidden") && !menuPopover.contains(e.target) && e.target !== menuBtn) {
      closeMenu();
    }
  });

  menuPopover.addEventListener("click", (e) => {
    const action = e.target.getAttribute("data-action");
    if (!action) return;
    closeMenu();
    if (action === "copy") {
      navigator.clipboard?.writeText(window.location.href).catch(() => {});
      showToast("Profile link copied");
    } else if (action === "github") {
      window.open(LINKS.github, "_blank", "noopener");
    } else if (action === "resume") {
      window.open(LINKS.resume, "_blank", "noopener");
    } else if (action === "stalk") {
      showToast("Nice try.");
    }
  });

  /* ----------------------------------------------------------
     SKILLS — data + render
  ---------------------------------------------------------- */
  const skills = [
    { name: "Python", note: "appears in 3 projects" },
    { name: "Flask", note: "appears in 3 projects" },
    { name: "Gemini API", note: "seen in PortGen + EchoMind" },
    { name: "REST APIs", note: "used across most projects" },
    { name: "HTML", note: "seen in SkyCast + PortGen output" },
    { name: "CSS", note: "seen in SkyCast" },
    { name: "JavaScript", note: "seen in SkyCast" },
    { name: "Pandas", note: "data work, off to the side" },
    { name: "NumPy", note: "data work, off to the side" },
    { name: "MySQL", note: "coursework + experiments" },
    { name: "Tkinter", note: "early desktop experiments" },
    { name: "Supabase", note: "seen in SkyCast" },
    { name: "Geolocation APIs", note: "seen in SkyCast" },
  ];
  const tagCloud = document.getElementById("tagCloud");
  tagCloud.innerHTML = skills.map(s => `
    <button class="skill-tag" type="button">${s.name}<span class="tag-note">${s.note}</span></button>
  `).join("");

  /* ----------------------------------------------------------
     SAVED / CERTIFICATES — data + render + lightbox
  ---------------------------------------------------------- */
  const certs = [
    {
      img: "cert-1-thumb.jpeg",
      title: "Microsoft Certified — Azure Fundamentals",
      meta: "Microsoft · May 18, 2026",
      note: "okay this one is Microsoft",
    },
    {
      img: "cert-2-thumb.jpeg",
      title: "AI Algorithm Development with Python: Essentials & Implementation",
      meta: "Intel Unnati / Edulateral Foundation / GLA University · Oct 2025",
      note: "receipt #02",
    },
    {
      img: "cert-3-thumb.jpeg",
      title: "AI Mastery: Unlocking the Power of Artificial Intelligence",
      meta: "NEC Corporation India / Edulateral Foundation / GLA University · Oct 2025",
      note: "receipt #03",
    },
    {
      img: "cert-4-thumb.jpeg",
      title: "Innovision'25 — 3rd Rank, One Shot One Line",
      meta: "Netaji Subhas University of Technology · Nov 2025",
      note: "achievement spotted",
      achievement: true,
    },
    {
      img: "cert-5-thumb.jpeg",
      title: "CaseForge 2025 — Case Study Competition",
      meta: "IIT Kharagpur · Participation",
      note: "case-study detour",
    },
  ];
  const savedGrid = document.getElementById("savedGrid");
  savedGrid.innerHTML = certs.map((c, i) => `
    <div class="saved-item${c.achievement ? " achievement" : ""}" tabindex="0" role="button" data-index="${i}" aria-label="Open ${c.title}">
      ${c.achievement ? `<span class="achievement-flag">🏆 achievement</span>` : ""}
      <img src="${c.img}" alt="${c.title}" loading="lazy" />
      <div class="saved-caption">
        <h4>${c.title}</h4>
        <p>${c.meta}</p>
      </div>
      <span class="saved-note mono">${c.note}</span>
    </div>
  `).join("");

  const certLightbox = document.getElementById("certLightbox");
  const certLightboxImg = document.getElementById("certLightboxImg");
  const certLightboxCaption = document.getElementById("certLightboxCaption");
  const certLightboxClose = document.getElementById("certLightboxClose");
  let lastFocusedCert = null;

  function openCert(index) {
    const c = certs[index];
    lastFocusedCert = document.querySelector(`.saved-item[data-index="${index}"]`);
    certLightboxImg.src = c.img;
    certLightboxImg.alt = c.title;
    certLightboxCaption.textContent = `${c.title} — ${c.meta}`;
    certLightbox.classList.add("active");
    certLightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    certLightboxClose.focus();
  }
  function closeCert() {
    certLightbox.classList.remove("active");
    certLightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocusedCert) lastFocusedCert.focus();
  }
  savedGrid.addEventListener("click", (e) => {
    const item = e.target.closest(".saved-item");
    if (item) openCert(Number(item.getAttribute("data-index")));
  });
  savedGrid.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      const item = e.target.closest(".saved-item");
      if (item) { e.preventDefault(); openCert(Number(item.getAttribute("data-index"))); }
    }
  });
  certLightboxClose.addEventListener("click", closeCert);
  certLightbox.addEventListener("click", (e) => { if (e.target === certLightbox || e.target.classList.contains("cert-lightbox-backdrop")) closeCert(); });
  window.addEventListener("keydown", (e) => { if (e.key === "Escape" && certLightbox.classList.contains("active")) closeCert(); });

  /* ----------------------------------------------------------
     ACTIVITY LOG — data + render
  ---------------------------------------------------------- */
  const activity = [
    { label: "currently", text: 'studying → machine learning' },
    { label: "currently", text: 'exploring → AI product thinking' },
    { label: "recently", text: 'built → SkyCast' },
    { label: "recently", text: 'connected → Supabase' },
    { label: "recently", text: 'used → Gemini API' },
    { label: "recently", text: 'generated → HTML from structured data' },
    { label: "earlier", text: 'experimented with → location-aware interfaces' },
    { label: "earlier", text: 'built → EchoMind, a conversational AI project' },
    { label: "next", text: 'heading toward → AI Product Management' },
  ];
  document.getElementById("activityLog").innerHTML = activity.map(a => `
    <li>
      <span class="activity-label ${a.label}">${a.label}</span>
      <span class="activity-text">${a.text}</span>
    </li>
  `).join("");

  /* ----------------------------------------------------------
     PROJECT DRAWER — data + open/close
  ---------------------------------------------------------- */
  const projects = {
    skycast: {
      title: "SkyCast",
      tagline: "Weather that knows where you are.",
      problem: "Most weather apps make you type a city name every time, even though your device already knows exactly where you are.",
      idea: "Use the browser's geolocation to read latitude and longitude directly, then hand those coordinates to a weather API for a live, local forecast — zero typing required.",
      how: "When location access is granted, the app captures coordinates client-side, sends them to a Flask backend, which calls a weather API and returns current conditions. Supabase handles persistence for saved locations and preferences.",
      stack: ["HTML", "CSS", "JavaScript", "Flask", "Weather API", "Geolocation", "Supabase"],
      learned: "How much smoother an interface feels when it removes a step the user didn't need to do in the first place — and how to handle the edge cases when permission is denied.",
      toast: "apparently she tracks clouds now",
    },
    portgen: {
      title: "PortGen",
      tagline: "Give it text. Get a webpage.",
      problem: "Building a personal portfolio from scratch takes time most people don't want to spend formatting HTML by hand.",
      idea: "Let someone describe themselves in a plain .txt file, and have AI do the structuring: parse the text, extract meaning, and turn it into a ready-to-use webpage.",
      how: "A .txt file is uploaded and sent to the Gemini API, which extracts and structures the content into JSON. That JSON is then used to generate a complete HTML file, which is returned to the user as their portfolio.html.",
      stack: ["Gemini API", "JSON", "HTML generation", "text-file processing"],
      learned: "How to get a language model to reliably output structured data, and how much of 'building a portfolio' is really just structuring information well.",
      toast: "portfolioception detected",
    },
    echomind: {
      title: "EchoMind",
      tagline: "An earlier experiment in conversation.",
      problem: "Understanding how conversational AI actually keeps track of intent, rather than just treating every message as a one-off.",
      idea: "A lightweight chatbot that scopes its responses to a defined intent space, instead of trying to be an open-ended assistant.",
      how: "Built with Flask on the backend and the Gemini API for generation, with a simple scoped-response structure to keep the conversation on-topic.",
      stack: ["Python", "Flask", "Gemini API"],
      learned: "The groundwork that later shaped how PortGen prompts and structures model output.",
      toast: "yes, there was a chatbot era",
    },
    azure: {
      title: "Azure AI Case Study",
      tagline: "Research / product thinking",
      problem: "Cloud AI services are often evaluated purely on technical capability, which skips over how organizations actually decide to adopt them.",
      idea: "Look at Azure's AI services through the lens of adoption and trade-offs — what makes a business choose (or avoid) a given service in practice.",
      how: "Structured as a research case study: reviewing Azure AI service offerings, mapping trade-offs, and presenting findings from a product-thinking angle rather than a purely technical one.",
      stack: ["Microsoft Azure", "Cloud AI Services", "Research", "Presentation", "Product thinking"],
      learned: "How to evaluate technology the way a product manager would — cost, adoption friction and fit, not just what it can technically do.",
      toast: "research tab unlocked",
    },
  };

  const drawer = document.getElementById("projectDrawer");
  const drawerContent = document.getElementById("drawerContent");
  const drawerClose = document.getElementById("drawerClose");
  const drawerBackdrop = document.getElementById("drawerBackdrop");
  let lastFocusedProject = null;

  function openDrawer(key) {
    const p = projects[key];
    if (!p) return;
    lastFocusedProject = document.querySelector(`[data-project="${key}"]`);
    drawerContent.innerHTML = `
      <h3>${p.title}</h3>
      <p class="drawer-tagline">${p.tagline}</p>
      <h4>Problem</h4><p>${p.problem}</p>
      <h4>Idea</h4><p>${p.idea}</p>
      <h4>How it works</h4><p>${p.how}</p>
      <h4>Stack</h4><div class="drawer-stack">${p.stack.map(t => `<span class="tag">${t}</span>`).join("")}</div>
      <h4>What I learned</h4><p>${p.learned}</p>
      <h4>GitHub</h4><p><a class="btn btn-small btn-ghost" href="${LINKS.github}" target="_blank" rel="noopener">GitHub ↗</a></p>
    `;
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    drawerClose.focus();
    showToast("Added to stalking history", p.toast);
  }
  function closeDrawer() {
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocusedProject) lastFocusedProject.focus();
  }

  document.querySelectorAll("[data-open-project]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      openDrawer(btn.getAttribute("data-open-project"));
    });
  });
  document.querySelectorAll(".post-card").forEach((card) => {
    card.addEventListener("click", () => openDrawer(card.getAttribute("data-project")));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openDrawer(card.getAttribute("data-project")); }
    });
  });
  drawerClose.addEventListener("click", closeDrawer);
  drawerBackdrop.addEventListener("click", closeDrawer);
  window.addEventListener("keydown", (e) => { if (e.key === "Escape" && drawer.classList.contains("open")) closeDrawer(); });

  /* ----------------------------------------------------------
     CARD TILT ON POINTER (subtle, desktop only)
  ---------------------------------------------------------- */
  if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".post-card, .saved-item").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const rect = card.getBoundingClientRect();
        const relX = (e.clientX - rect.left) / rect.width - 0.5;
        const relY = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `translateY(-3px) rotate(${relX * 1.2}deg)`;
      });
      card.addEventListener("pointerleave", () => { card.style.transform = ""; });
    });
  }

})();