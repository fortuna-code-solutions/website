(() => {
  "use strict";

  const nav = document.getElementById("nav");
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");

  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 20);
  }, { passive: true });

  toggle.addEventListener("click", () => {
    toggle.classList.toggle("active");
    links.classList.toggle("open");
  });

  links.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      toggle.classList.remove("active");
      links.classList.remove("open");
    })
  );

  const observer = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("visible"); observer.unobserve(e.target); }
    }),
    { threshold: 0.15 }
  );

  document.querySelectorAll(".svc, .about, .testimonial, .contact__grid").forEach((el) => {
    el.classList.add("reveal");
    observer.observe(el);
  });

  document.getElementById("contactForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const btn = e.target.querySelector("button[type='submit']");
    const orig = btn.textContent;
    btn.textContent = "Sent — Thank you!";
    btn.disabled = true;
    btn.style.opacity = ".6";
    setTimeout(() => { btn.textContent = orig; btn.disabled = false; btn.style.opacity = ""; e.target.reset(); }, 3000);
  });

  /* ── Falling clover leaves on mouse move ── */
  (() => {
    const NS = "http://www.w3.org/2000/svg";
    const LEAF_PATH = "M0,0 C-3,-5 -9,-11 -9,-16 C-9,-22 -5,-24 0,-18 C5,-24 9,-22 9,-16 C9,-11 3,-5 0,0Z";
    const COLORS = ["#4ade80", "#22c55e", "#16a34a", "#bbf7d0", "#86efac"];
    const MAX_LEAVES = 40;
    const THROTTLE_MS = 60;

    let lastSpawn = 0;
    let leaves = [];
    let ticking = false;

    const container = document.createElement("div");
    container.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden;";
    document.body.appendChild(container);

    function createLeaf(x, y) {
      const size = 10 + Math.random() * 14;
      const svg = document.createElementNS(NS, "svg");
      svg.setAttribute("viewBox", "-12 -26 24 28");
      svg.setAttribute("width", size);
      svg.setAttribute("height", size);
      svg.style.cssText = `position:absolute;left:${x - size / 2}px;top:${y - size / 2}px;opacity:0;will-change:transform,opacity;`;

      const g = document.createElementNS(NS, "g");
      const numLeaves = 2 + Math.floor(Math.random() * 3);
      const rotations = [0, 90, 180, 270].sort(() => Math.random() - .5).slice(0, numLeaves);
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];

      rotations.forEach((r) => {
        const path = document.createElementNS(NS, "path");
        path.setAttribute("d", LEAF_PATH);
        path.setAttribute("fill", color);
        path.setAttribute("transform", `rotate(${r})`);
        g.appendChild(path);
      });

      svg.appendChild(g);
      container.appendChild(svg);

      return {
        el: svg,
        x,
        y,
        vx: (Math.random() - 0.5) * 1.2,
        vy: 0.4 + Math.random() * 0.8,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 3,
        wobbleAmp: 15 + Math.random() * 25,
        wobbleSpeed: 0.02 + Math.random() * 0.02,
        phase: Math.random() * Math.PI * 2,
        opacity: 0,
        age: 0,
        fadeIn: 8 + Math.random() * 6,
        lifespan: 80 + Math.random() * 60,
        size,
      };
    }

    function tick() {
      for (let i = leaves.length - 1; i >= 0; i--) {
        const l = leaves[i];
        l.age++;

        if (l.age < l.fadeIn) {
          l.opacity = l.age / l.fadeIn * 0.7;
        } else if (l.age > l.lifespan - 30) {
          l.opacity = Math.max(0, (l.lifespan - l.age) / 30 * 0.7);
        }

        l.x += l.vx + Math.sin(l.phase + l.age * l.wobbleSpeed) * 0.5;
        l.y += l.vy;
        l.rotation += l.rotSpeed;

        l.el.style.transform = `translate(${l.x - l.size / 2}px, ${l.y - l.size / 2}px) rotate(${l.rotation}deg)`;
        l.el.style.left = "0";
        l.el.style.top = "0";
        l.el.style.opacity = l.opacity;

        if (l.age >= l.lifespan || l.y > window.innerHeight + 20) {
          l.el.remove();
          leaves.splice(i, 1);
        }
      }

      if (leaves.length > 0) {
        requestAnimationFrame(tick);
      } else {
        ticking = false;
      }
    }

    document.addEventListener("mousemove", (e) => {
      const now = performance.now();
      if (now - lastSpawn < THROTTLE_MS) return;
      lastSpawn = now;

      if (leaves.length >= MAX_LEAVES) {
        const oldest = leaves.shift();
        oldest.el.remove();
      }

      leaves.push(createLeaf(e.clientX, e.clientY));

      if (!ticking) {
        ticking = true;
        requestAnimationFrame(tick);
      }
    }, { passive: true });
  })();
})();
