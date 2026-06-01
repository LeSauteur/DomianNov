document.addEventListener("DOMContentLoaded", () => {
  const headers = document.querySelectorAll(".site-header");

  for (const header of headers) {
    const toggle = header.querySelector(".nav-toggle");
    const nav = header.querySelector(".site-nav");
    const phone = header.querySelector(".header-phone");

    if (!toggle || !nav || !phone) {
      continue;
    }

    const closeMenu = () => {
      header.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    };

    const openMenu = () => {
      header.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
    };

    toggle.addEventListener("click", () => {
      if (header.classList.contains("is-open")) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    phone.addEventListener("click", closeMenu);

    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        closeMenu();
      }
    });
  }
});
