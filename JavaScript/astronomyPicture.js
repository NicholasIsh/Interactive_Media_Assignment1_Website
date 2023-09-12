window.addEventListener("DOMContentLoaded", function() {
    fetchAstronomyPicture();
  });

async function fetchAstronomyPicture() {
    const apiKey = 'raGr2ktvfncBRDB6x4deDM1nfsrJHKrEetIrJVF0'; 
    const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.media_type === 'image') {
            const apodContent = document.querySelector('.apod');

            const imageElement = document.createElement('img');
            imageElement.src = data.url;
            imageElement.alt = data.title;
            imageElement.className = "aPOTD"
            // imageElement.onclick(openPage('https://apod.nasa.gov/apod/astropix.html'))
            
            const titleElement = document.createElement('h3');
            titleElement.textContent = data.title;

            const explanationElement = document.createElement('p');
            explanationElement.textContent = data.explanation;

            apodContent.appendChild(imageElement);
            apodContent.appendChild(titleElement);
            apodContent.appendChild(explanationElement);
        } else {
            console.log('No image available for today.');
        }
    } catch (error) {
        console.error('Error fetching APOD data:', error);
    }
}