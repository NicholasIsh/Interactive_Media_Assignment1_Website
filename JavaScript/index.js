window.addEventListener("DOMContentLoaded", function() {
    appendNavigation();
    
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

function appendNavigation() {
    const header = document.createElement('header');
    const headerContent = document.createElement('section');
    headerContent.classList.add('headerContent');
    const logo = document.createElement('img');
    logo.src = "/Images/logo.png";
    logo.alt = "Logo";
    logo.classList.add('logo');
    logo.onclick = () => openPage('index.html');
    headerContent.appendChild(logo);
    const nav = document.createElement('nav');
    const ul = document.createElement('ul');

    const pages = [
        {name: "Home", link: "index.html"},
        {name: "Blog", link: "blog.html"},
        {name: "Design", link: "design.html"},
        {name: "Data Visualisation", link: "dataVisualisation.html"},
        {name: "Data Art", link: "dataArt.html"}
    ];

    pages.forEach(page => {
        const li = document.createElement('li');
        const a = document.createElement('a'); 
        a.textContent = page.name;
        a.href = page.link;
        a.onclick = () => openPage(page.link);

        if (window.location.pathname.endsWith(page.link)) {
            a.classList.add('active-link');  
        }
        li.appendChild(a); 
        ul.appendChild(li);
    });

    nav.appendChild(ul);
    headerContent.appendChild(nav);
    header.appendChild(headerContent);

    const currentHeader = document.querySelector('header');
    if(currentHeader) {
        document.body.replaceChild(header, currentHeader);
    } else {
        document.body.insertBefore(header, document.body.firstChild);
    }
}