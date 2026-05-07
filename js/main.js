/* Despistados Cafe - lightweight navigation and reveals */

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const header = document.querySelector(".site-header");
  const menuToggle = document.querySelector(".menu-toggle");
  const navMenu = document.querySelector(".nav-menu");
  const navItems = document.querySelectorAll(".nav-menu li");
  const navLinks = document.querySelectorAll(".nav-menu a");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  body.classList.add("has-js");

  const updateHeader = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 16);
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
    menuToggle.setAttribute("aria-label", "Cerrar menu");
  };

  const closeMenu = () => {
    if (!menuToggle || !navMenu) return;

    body.classList.remove("menu-open");
    menuToggle.classList.remove("is-active");
    navMenu.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menu");
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

  const animatedElements = document.querySelectorAll("[data-animate]");

  if (!("IntersectionObserver" in window)) {
    animatedElements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -44px 0px",
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
        element.style.setProperty("--delay", `${index * 75}ms`);
      }

      revealObserver.observe(element);
    });
  });
});
