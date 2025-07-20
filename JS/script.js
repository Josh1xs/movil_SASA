document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById('menuToggle');
  const profileMenu = document.getElementById('profileMenu');
  const overlay = document.getElementById('overlay');
  const closeMenu = document.getElementById('closeMenu');


  
  function closeProfileMenu() {
    profileMenu.classList.remove('open');
    overlay.classList.remove('show');
  }

  menuToggle.addEventListener('click', () => {
    profileMenu.classList.add('open');
    overlay.classList.add('show');
  });

  closeMenu.addEventListener('click', closeProfileMenu);
  overlay.addEventListener('click', closeProfileMenu);
});
