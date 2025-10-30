function initPage() {
  const feedContainer = document.getElementById('feed-container');
  if (!feedContainer) {
    console.error("Feed container not found!");
    return;
  }

  let postCount = 0;

  function createPost() {
    postCount++;

    const card = document.createElement('div');
    card.className = 'post-card';

    const img = document.createElement('img');
    img.src = `https://picsum.photos/2056/2056?random=${postCount}`; // High-res image
    img.alt = `Post ${postCount}`;
    img.loading = "lazy";

    // Create a download button
    const downloadButton = document.createElement('button');
    downloadButton.textContent = 'Download';
    downloadButton.className = 'download-button';
    
    // Add click event to the download button
    downloadButton.onclick = () => {
      fetch(img.src)
        .then(response => response.blob()) // Convert the image to a Blob
        .then(blob => {
          // Create a URL for the Blob
          const url = URL.createObjectURL(blob);
          
          // Create an anchor element for downloading
          const link = document.createElement('a');
          link.href = url;
          link.download = `image-${postCount}.jpg`; // Set the filename for download
          
          // Trigger the download
          link.click();
          
          // Clean up the URL object after download
          URL.revokeObjectURL(url);
        })
        .catch(error => {
          console.error("Error downloading the image:", error);
        });
    };

    // Append the image and download button to the card
    card.appendChild(img);
    card.appendChild(downloadButton);

    return card;
  }

  function loadMorePosts(count = 20) {
    for (let i = 0; i < count; i++) {
      const card = createPost();
      feedContainer.appendChild(card);
    }
  }

  feedContainer.innerHTML = "";
  loadMorePosts(20);  // Initial load (5 posts)

  window.addEventListener('scroll', () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 5) {
      loadMorePosts(5);  // Load more posts when near the bottom
    }
  });
}

window.onload = initPage;  // Automatically call initPage when the page loads
