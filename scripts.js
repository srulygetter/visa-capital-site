// JavaScript to enhance interactivity on the Visa Capital site (v2).
// This script toggles the mobile navigation menu and can be extended to
// include additional behaviours (e.g. form validation, accordion icons).

// Wait until the DOM is fully loaded before attaching event listeners
document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const navList = document.querySelector('nav ul');

  if (menuToggle && navList) {
    menuToggle.addEventListener('click', () => {
      navList.classList.toggle('active');
    });
  }

  // Example form submission handler for demonstration
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      // Basic validation: ensure required fields are filled
      const name = contactForm.querySelector('[name="name"]');
      const email = contactForm.querySelector('[name="email"]');
      const message = contactForm.querySelector('[name="message"]');
      if (name.value.trim() && email.value.trim() && message.value.trim()) {
        alert('Thank you for reaching out! We will get back to you soon.');
        contactForm.reset();
      } else {
        alert('Please fill in all required fields.');
      }
    });
  }
});