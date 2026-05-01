/* app.js — shared UI behaviour (landing + dashboard) */

// ── Navbar scroll effect ────────────────────────────────────
const navbar = document.getElementById("navbar");
if (navbar) {
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 20);
  });
}

// ── Mobile hamburger ────────────────────────────────────────
const hamburger = document.getElementById("hamburger");
const navLinks  = document.querySelector(".nav-links");
if (hamburger && navLinks) {
  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });
}

// ── Scroll reveal (Intersection Observer) ──────────────────
const revealEls = document.querySelectorAll(
  ".feature-card, .step-card, .gap-card, .tip-card"
);
if (revealEls.length) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("fade-in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => io.observe(el));
}
