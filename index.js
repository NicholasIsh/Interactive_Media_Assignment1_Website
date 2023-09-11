window.addEventListener("DOMContentLoaded", function() {
    const links = Array.from(document.querySelectorAll('a[href*="#"]'));
    links.forEach(function(link) {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            const offset = target.offsetTop + 110;
            window.scrollTo({top: offset, behavior:'smooth'});
        });
    });
  });

  function openPage(page) {
    window.location.href = page;
}






