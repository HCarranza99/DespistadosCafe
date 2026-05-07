/* ==========================================================
   Despistados Café
   - Entrada inicial
   - Header sticky
   - Menú móvil
   - Reveals con stagger
   - Carrusel con swipe, autoplay y progreso
   - Parallax sutil del hero
========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const header = document.querySelector(".site-header");
  const menuToggle = document.querySelector(".menu-toggle");
  const navMenu = document.querySelector(".nav-menu");
  const navItems = document.querySelectorAll(".nav-menu li");
  const navLinks = document.querySelectorAll(".nav-menu a");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  window.setTimeout(() => {
    body.classList.add("is-loaded");
  }, 80);

  const updateHeader = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 18);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  navItems.forEach((item, index) => {
    item.style.setProperty("--item-index", index);
  });

  const openMenu = () => {
    if (!menuToggle || !navMenu) return;

    body.classList.add("menu-open");
    menuToggle.classList.add("is-active");
    navMenu.classList.add("is-open");
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Cerrar menú");
  };

  const closeMenu = () => {
    if (!menuToggle || !navMenu) return;

    body.classList.remove("menu-open");
    menuToggle.classList.remove("is-active");
    navMenu.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menú");
  };

  menuToggle?.addEventListener("click", () => {
    const isOpen = navMenu?.classList.contains("is-open");
    isOpen ? closeMenu() : openMenu();
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) closeMenu();
  });

  const animatedElements = document.querySelectorAll("[data-animate]");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    const groupedElements = {};

    animatedElements.forEach((element) => {
      const parentKey =
        element.closest("section")?.id ||
        element.closest("section")?.className ||
        "global";

      if (!groupedElements[parentKey]) groupedElements[parentKey] = [];
      groupedElements[parentKey].push(element);
    });

    Object.values(groupedElements).forEach((group) => {
      group.forEach((element, index) => {
        if (element.dataset.animate === "stagger") {
          element.style.setProperty("--delay", `${index * 90}ms`);
        }

        revealObserver.observe(element);
      });
    });
  } else {
    animatedElements.forEach((element) => element.classList.add("is-visible"));
  }

  const internalLinks = document.querySelectorAll('a[href^="#"]');

  internalLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();

      const headerHeight = header ? header.offsetHeight : 0;
      const targetPosition =
        target.getBoundingClientRect().top + window.scrollY - headerHeight + 2;

      window.scrollTo({
        top: targetPosition,
        behavior: reducedMotion ? "auto" : "smooth",
      });
    });
  });

  const carousel = document.querySelector(".carousel-shell");
  const track = document.querySelector(".product-track");
  const cards = Array.from(document.querySelectorAll(".product-card"));
  const prevButton = document.querySelector(".carousel-prev");
  const nextButton = document.querySelector(".carousel-next");
  const dotsContainer = document.querySelector(".carousel-dots");
  const progressBar = document.querySelector(".carousel-progress span");

  if (carousel && track && cards.length > 0 && dotsContainer) {
    let currentIndex = 0;
    let autoplayId = null;
    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    const dots = cards.map((_, index) => {
      const dot = document.createElement("button");
      dot.className = "carousel-dot";
      dot.type = "button";
      dot.setAttribute("aria-label", `Ver producto ${index + 1}`);
      dotsContainer.appendChild(dot);

      dot.addEventListener("click", () => {
        goToSlide(index);
        restartAutoplay();
      });

      return dot;
    });

    const updateCarousel = () => {
      track.style.transform = `translateX(-${currentIndex * 100}%)`;

      cards.forEach((card, index) => {
        card.classList.toggle("is-active", index === currentIndex);
      });

      dots.forEach((dot, index) => {
        dot.classList.toggle("is-active", index === currentIndex);
      });

      if (progressBar) {
        progressBar.style.transform = `translateX(${currentIndex * 100}%)`;
      }
    };

    const goToSlide = (index) => {
      currentIndex = (index + cards.length) % cards.length;
      updateCarousel();
    };

    const nextSlide = () => goToSlide(currentIndex + 1);
    const prevSlide = () => goToSlide(currentIndex - 1);

    const startAutoplay = () => {
      if (reducedMotion) return;
      autoplayId = window.setInterval(nextSlide, 6500);
    };

    const stopAutoplay = () => {
      if (autoplayId) window.clearInterval(autoplayId);
    };

    const restartAutoplay = () => {
      stopAutoplay();
      startAutoplay();
    };

    prevButton?.addEventListener("click", () => {
      prevSlide();
      restartAutoplay();
    });

    nextButton?.addEventListener("click", () => {
      nextSlide();
      restartAutoplay();
    });

    carousel.addEventListener("mouseenter", stopAutoplay);
    carousel.addEventListener("mouseleave", startAutoplay);

    carousel.addEventListener(
      "touchstart",
      (event) => {
        startX = event.touches[0].clientX;
        currentX = startX;
        isDragging = true;
        stopAutoplay();
      },
      { passive: true }
    );

    carousel.addEventListener(
      "touchmove",
      (event) => {
        if (!isDragging) return;
        currentX = event.touches[0].clientX;
      },
      { passive: true }
    );

    carousel.addEventListener("touchend", () => {
      if (!isDragging) return;

      const diff = startX - currentX;
      const threshold = 45;

      if (diff > threshold) nextSlide();
      if (diff < -threshold) prevSlide();

      isDragging = false;
      restartAutoplay();
    });

    updateCarousel();
    startAutoplay();
  }

  const heroImage = document.querySelector(".hero-backdrop img");

  if (heroImage && !reducedMotion) {
    let ticking = false;

    const updateHeroParallax = () => {
      const offset = Math.min(window.scrollY * 0.08, 42);
      heroImage.style.transform = `scale(1.04) translateY(${offset}px)`;
      ticking = false;
    };

    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        window.requestAnimationFrame(updateHeroParallax);
        ticking = true;
      },
      { passive: true }
    );
  }
});
