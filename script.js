const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");

function closeMenu() {
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Abrir menu");
  nav.classList.remove("open");
}

menuButton.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") === "true";

  menuButton.setAttribute("aria-expanded", String(!open));
  menuButton.setAttribute("aria-label", open ? "Abrir menu" : "Fechar menu");
  nav.classList.toggle("open", !open);
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("click", (event) => {
  if (!nav.contains(event.target) && !menuButton.contains(event.target)) {
    closeMenu();
  }
});

document.querySelector("#year").textContent = new Date().getFullYear();

const galleryItems = [...document.querySelectorAll(".gallery-item")];
const filters = [...document.querySelectorAll("[data-filter]")];

let visibleItems = [...galleryItems];
let activeIndex = 0;
let lastFocus = null;

filters.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filters.forEach((item) => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });

    galleryItems.forEach((item) => {
      item.hidden = filter !== "todos" && item.dataset.category !== filter;
    });

    visibleItems = galleryItems.filter((item) => !item.hidden);
    galleryGrid.scrollLeft = 0;
    mobileGalleryIndex = 0;
    updateMobileGallery();
  });
});

const lightbox = document.querySelector(".lightbox");
const enlarged = lightbox.querySelector(".lightbox-image");
const caption = lightbox.querySelector(".lightbox-caption");
const counter = lightbox.querySelector(".lightbox-counter");

function showImage() {
  const item = visibleItems[activeIndex];
  const image = item.querySelector("img");

  enlarged.src = image.currentSrc || image.src;
  enlarged.alt = image.alt;
  caption.textContent = item.querySelector(".gallery-meta span").textContent;

  counter.textContent =
    `${String(activeIndex + 1).padStart(2, "0")} / ` +
    `${String(visibleItems.length).padStart(2, "0")}`;
}

function openLightbox(item) {
  lastFocus = document.activeElement;
  activeIndex = visibleItems.indexOf(item);
  showImage();

  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("locked");
  lightbox.querySelector(".lightbox-close").focus();
}

function closeLightbox() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("locked");
  enlarged.removeAttribute("src");
  lastFocus?.focus();
}

function move(delta) {
  activeIndex =
    (activeIndex + delta + visibleItems.length) % visibleItems.length;

  showImage();
}

galleryItems.forEach((item) => {
  item.addEventListener("click", () => openLightbox(item));
});

lightbox
  .querySelector(".lightbox-close")
  .addEventListener("click", closeLightbox);
lightbox
  .querySelector(".lightbox-prev")
  .addEventListener("click", () => move(-1));
lightbox
  .querySelector(".lightbox-next")
  .addEventListener("click", () => move(1));

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (lightbox.classList.contains("open")) {
      closeLightbox();
    } else {
      closeMenu();
    }
  }

  if (!lightbox.classList.contains("open")) return;

  if (event.key === "ArrowRight") move(1);
  if (event.key === "ArrowLeft") move(-1);

  if (event.key === "Tab") {
    const buttons = [...lightbox.querySelectorAll("button")];
    const i = buttons.indexOf(document.activeElement);

    if (event.shiftKey && i === 0) {
      event.preventDefault();
      buttons.at(-1).focus();
    } else if (!event.shiftKey && i === buttons.length - 1) {
      event.preventDefault();
      buttons[0].focus();
    }
  }
});

// Seção "A experiência Marci"
const atelierSteps = [
  {
    word: "escuta.",
    caption: "A sua história vem primeiro.",
    overline: "PRIMEIRO, A SUA HISTÓRIA",
    title: "Tudo começa com você.",
    text: "Antes de pensar no desenho, quero entender o que você gosta, como se sente e o que espera ver no espelho.",
  },
  {
    word: "criação.",
    caption: "Um cuidado em cada detalhe.",
    overline: "DEPOIS, CADA DETALHE",
    title: "Um desenho com intenção.",
    text: "O formato, a proporção e o acabamento são pensados para valorizar seus traços e respeitar a sua expressão.",
  },
  {
    word: "você.",
    caption: "A beleza de se reconhecer.",
    overline: "POR FIM, O SEU MOMENTO",
    title: "Reconheça a sua beleza.",
    text: "A ideia é que você saia se sentindo bem, com um resultado que combine com quem você é.",
  },
];

const atelierTabs = [
  ...document.querySelectorAll('.atelier-tabs [role="tab"]'),
];

function selectAtelierStep(index, focus = false) {
  const step = atelierSteps[index];

  atelierTabs.forEach((tab, i) => {
    tab.setAttribute("aria-selected", String(i === index));
    tab.tabIndex = i === index ? 0 : -1;
  });

  document
    .querySelector("#atelier-panel")
    .setAttribute("aria-labelledby", atelierTabs[index].id);

  document.querySelector("#atelier-art-word").textContent = step.word;
  document.querySelector("#atelier-art-caption").textContent = step.caption;
  document.querySelector("#atelier-image-no").textContent =
    `0${index + 1} / 03`;

  document.querySelector("#atelier-overline").textContent = step.overline;
  document.querySelector("#atelier-title-step").textContent = step.title;
  document.querySelector("#atelier-text").textContent = step.text;

  if (focus) atelierTabs[index].focus();
}

atelierTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectAtelierStep(index));

  tab.addEventListener("keydown", (event) => {
    if (
      !["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(event.key)
    ) {
      return;
    }

    event.preventDefault();

    const next =
      (index +
        (event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1) +
        atelierTabs.length) %
      atelierTabs.length;

    selectAtelierStep(next, true);
  });
});

// Galeria deslizável no celular
const galleryGrid = document.querySelector(".gallery-grid");
let mobileGalleryIndex = 0;

function updateMobileGallery() {
  const total = visibleItems.length;
  if (!total) return;

  const center =
    galleryGrid.getBoundingClientRect().left + galleryGrid.clientWidth / 2;

  let nearest = 0;
  let distance = Infinity;

  visibleItems.forEach((item, index) => {
    const rect = item.getBoundingClientRect();
    const current = Math.abs(rect.left + rect.width / 2 - center);

    if (current < distance) {
      distance = current;
      nearest = index;
    }
  });

  mobileGalleryIndex = nearest;

  document.querySelector(".gallery-mobile-count").textContent =
    `${String(nearest + 1).padStart(2, "0")} / ` +
    `${String(total).padStart(2, "0")}`;
}

function moveMobileGallery(direction) {
  if (!visibleItems.length) return;

  mobileGalleryIndex = Math.max(
    0,
    Math.min(visibleItems.length - 1, mobileGalleryIndex + direction),
  );

  visibleItems[mobileGalleryIndex].scrollIntoView({
    behavior: "smooth",
    block: "nearest",
    inline: "center",
  });

  document.querySelector(".gallery-mobile-count").textContent =
    `${String(mobileGalleryIndex + 1).padStart(2, "0")} / ` +
    `${String(visibleItems.length).padStart(2, "0")}`;
}

document
  .querySelector(".gallery-mobile-prev")
  .addEventListener("click", () => moveMobileGallery(-1));

document
  .querySelector(".gallery-mobile-next")
  .addEventListener("click", () => moveMobileGallery(1));

galleryGrid.addEventListener("scroll", updateMobileGallery, {
  passive: true,
});

window.addEventListener("resize", updateMobileGallery);
