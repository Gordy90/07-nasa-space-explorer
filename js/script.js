// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Find the button and gallery elements
const getImagesBtn = document.getElementById('getImagesBtn');
const gallery = document.getElementById('gallery');

// Find modal elements
const modal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');
const closeModal = document.querySelector('.close');

// NASA API configuration
const NASA_API_KEY = 'BfhfNatycEwPMXHjczgxgA7iARqpoqAGDVeuEsad';
const NASA_API_URL = 'https://api.nasa.gov/planetary/apod';

// Array of fun space facts
const spaceFacts = [
  "One day on Venus is longer than one year on Venus! It takes 243 Earth days to rotate once, but only 225 Earth days to orbit the Sun.",
  "Neutron stars are so dense that a teaspoon of neutron star material would weigh about 6 billion tons on Earth.",
  "There are more possible games of chess than there are atoms in the observable universe.",
  "Jupiter's Great Red Spot is a storm that has been raging for over 400 years and is larger than Earth.",
  "Saturn's moon Titan has lakes and rivers, but they're made of liquid methane instead of water.",
  "A single cloud in space can be trillions of miles wide and contain enough material to make millions of stars.",
  "If you could drive a car to the Moon at highway speeds, it would take you about 6 months of non-stop driving.",
  "The International Space Station travels at 17,500 mph and orbits Earth every 90 minutes.",
  "There are more stars in the universe than grains of sand on all the beaches on Earth.",
  "The Milky Way galaxy is on a collision course with the Andromeda galaxy, but they won't collide for about 4.5 billion years.",
  "Mars has the largest volcano in the solar system - Olympus Mons is about 13.6 miles high, nearly three times taller than Mount Everest.",
  "A year on Mercury is only 88 Earth days, but a day on Mercury lasts 176 Earth days.",
  "The Sun is so large that about 1.3 million Earths could fit inside it.",
  "Space is completely silent because sound needs air to travel, and there's no air in space.",
  "The footprints left by astronauts on the Moon will last for millions of years because there's no wind or water to erode them."
];

// Function to fetch NASA APOD data for a date range
async function fetchNASAImages(startDate, endDate) {
  try {
    // Build the API URL with our parameters
    const url = `${NASA_API_URL}?api_key=${NASA_API_KEY}&start_date=${startDate}&end_date=${endDate}`;
    
    // Fetch data from NASA API
    const response = await fetch(url);
    
    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`Failed to fetch images: ${response.status}`);
    }
    
    // Convert response to JSON
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('Error fetching NASA images:', error);
    throw error;
  }
}

// Function to display images in the gallery
function displayImages(images) {
  // Clear the gallery first
  gallery.innerHTML = '';
  
  // Loop through each image and create a gallery item
  images.forEach(image => {
    // Create a container for each image
    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';
    
    // Handle both images and videos
    if (image.media_type === 'image') {
      // Show only the image - no text content
      galleryItem.innerHTML = `
        <img src="${image.url}" alt="${image.title}" />
      `;
      
      // Add click event to the image to open modal
      const img = galleryItem.querySelector('img');
      img.addEventListener('click', () => {
        openModal(image);
      });
      
    } else if (image.media_type === 'video') {
      // For videos, create a clickable thumbnail with video icon
      galleryItem.innerHTML = `
        <div class="video-thumbnail" style="height: 200px; background-color: #0B3D91; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 4px; cursor: pointer; position: relative;">
          <div style="font-size: 48px; color: white; margin-bottom: 10px;">🎥</div>
          <p style="color: white; font-weight: bold; text-align: center; padding: 5px;">${image.title}</p>
          <p style="color: #FC3D21; font-size: 14px;">Click to view video</p>
        </div>
      `;
      
      // Add click event to open modal with video
      const videoThumbnail = galleryItem.querySelector('.video-thumbnail');
      videoThumbnail.addEventListener('click', () => {
        openModal(image);
      });
    }
    
    // Add the gallery item to the gallery
    gallery.appendChild(galleryItem);
  });
}

// Function to open the modal with image or video details
function openModal(imageData) {
  // Set the modal title, date, and explanation
  modalTitle.textContent = imageData.title;
  modalDate.textContent = imageData.date;
  modalExplanation.textContent = imageData.explanation;
  
  // Handle different media types
  if (imageData.media_type === 'image') {
    // Show image
    modalImage.src = imageData.url;
    modalImage.alt = imageData.title;
    modalImage.style.display = 'block';
    
    // Hide video container if it exists
    const existingVideo = modal.querySelector('.video-container');
    if (existingVideo) {
      existingVideo.remove();
    }
    
  } else if (imageData.media_type === 'video') {
    // Hide the image
    modalImage.style.display = 'none';
    
    // Remove any existing video container
    const existingVideo = modal.querySelector('.video-container');
    if (existingVideo) {
      existingVideo.remove();
    }
    
    // Create video container
    const videoContainer = document.createElement('div');
    videoContainer.className = 'video-container';
    videoContainer.style.marginBottom = '20px';
    
    // Check if it's a YouTube video (most common for NASA APOD)
    if (imageData.url.includes('youtube.com') || imageData.url.includes('youtu.be')) {
      // Extract YouTube video ID and create embed
      let videoId = '';
      if (imageData.url.includes('youtube.com/watch?v=')) {
        videoId = imageData.url.split('watch?v=')[1].split('&')[0];
      } else if (imageData.url.includes('youtu.be/')) {
        videoId = imageData.url.split('youtu.be/')[1].split('?')[0];
      }
      
      if (videoId) {
        videoContainer.innerHTML = `
          <iframe 
            width="100%" 
            height="400" 
            src="https://www.youtube.com/embed/${videoId}" 
            frameborder="0" 
            allowfullscreen
            style="border-radius: 4px;">
          </iframe>
        `;
      } else {
        // Fallback for YouTube links we can't parse
        videoContainer.innerHTML = `
          <div style="text-align: center; padding: 20px; background-color: #f0f0f0; border-radius: 4px;">
            <p style="margin-bottom: 15px; color: #333;">🎥 Video Content</p>
            <a href="${imageData.url}" target="_blank" style="background-color: #FC3D21; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Watch Video on YouTube</a>
          </div>
        `;
      }
    } else {
      // For other video types, provide a link
      videoContainer.innerHTML = `
        <div style="text-align: center; padding: 20px; background-color: #f0f0f0; border-radius: 4px;">
          <p style="margin-bottom: 15px; color: #333;">🎥 Video Content</p>
          <a href="${imageData.url}" target="_blank" style="background-color: #FC3D21; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Watch Video</a>
        </div>
      `;
    }
    
    // Insert video container after the image
    modalImage.parentNode.insertBefore(videoContainer, modalImage.nextSibling);
  }
  
  // Show the modal
  modal.style.display = 'block';
}

// Function to close the modal
function closeModalWindow() {
  modal.style.display = 'none';
}

// Add event listeners for closing the modal
closeModal.addEventListener('click', closeModalWindow);

// Close modal when clicking outside of it
window.addEventListener('click', (event) => {
  if (event.target === modal) {
    closeModalWindow();
  }
});

// Close modal when pressing Escape key
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && modal.style.display === 'block') {
    closeModalWindow();
  }
});

// Function to show loading state
function showLoading() {
  gallery.innerHTML = `
    <div class="placeholder">
      <div class="placeholder-icon">⏳</div>
      <p>Loading amazing space images...</p>
    </div>
  `;
}

// Function to show error message
function showError(message) {
  gallery.innerHTML = `
    <div class="placeholder">
      <div class="placeholder-icon">❌</div>
      <p>Error: ${message}</p>
      <p>Please try again with a different date range.</p>
    </div>
  `;
}

// Function to display a random space fact
function displayRandomSpaceFact() {
  // Pick a random fact from the array
  const randomIndex = Math.floor(Math.random() * spaceFacts.length);
  const randomFact = spaceFacts[randomIndex];
  
  // Find the fact display element and update it
  const factDisplay = document.getElementById('spaceFact');
  factDisplay.textContent = randomFact;
}

// Add event listener to the button
getImagesBtn.addEventListener('click', async () => {
  // Get the selected dates
  const startDate = startInput.value;
  const endDate = endInput.value;
  
  // Make sure both dates are selected
  if (!startDate || !endDate) {
    alert('Please select both start and end dates');
    return;
  }
  
  // Show a new random space fact with each search
  displayRandomSpaceFact();
  
  // Show loading state
  showLoading();
  
  try {
    // Fetch images from NASA API
    const images = await fetchNASAImages(startDate, endDate);
    
    // Display the images
    displayImages(images);
    
  } catch (error) {
    // Show error message if something goes wrong
    showError('Could not load space images. Please try again.');
  }
});

// Display a random space fact when the page loads
displayRandomSpaceFact();
