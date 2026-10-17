// Opens and closes the menu on phones.
const header = document.getElementById("site-header");
const menuButton = document.getElementById("menu-button");

menuButton.addEventListener("click", function () {
  // Add the "is-open" class if it's missing, remove it if it's there
  const isOpen = header.classList.toggle("is-open");

  // Change the button text and tell screen readers if the menu is open
  menuButton.textContent = isOpen ? "Close" : "Menu";
  menuButton.setAttribute("aria-expanded", isOpen);
});
