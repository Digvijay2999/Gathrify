// let combinedFeed = [];
let currentIndex = 0;
async function fetchAllFeeds() {
    try {
        const [redditRes, youtubeRes, newsRes, tumblrRes] = await Promise.all([
            fetch('/api/reddit'),
            fetch('/api/youtube'),
            fetch('/api/news'),
            fetch('/api/tumblr?blogs=technology, new arival')
        ]);

        const [reddit, youtube, news, tumblr] = await Promise.all([
            redditRes.json(),
            youtubeRes.json(),
            newsRes.json(),
            tumblrRes.json()
        ]);

        combinedFeed = shuffle([...reddit, ...youtube, ...news, ...tumblr]);
        loadMorePosts();
        console.log(combinedFeed);
    } catch (err) {
        console.error('Error fetching feeds:', err);
    }
}

// Shuffle helper
function shuffle(array) {
    return array
        .map(item => ({ item, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ item }) => item);
}

// Create post card
function createPost(item) {
    const card = document.createElement('div');
    card.className = 'post-card';
    let mediaContent = '';

    if (item.source === 'reddit') {
        if (item.mediaUrl.includes('v.redd.it')) {
            mediaContent = `<a href="${item.permalink}" target="_blank"><img src="${item.thumbnail}" onerror="this.onerror=null;this.src='/images/Fallback_Img.jpeg';" alt="Preview" style="max-width: 100%;"></a>`;
        } else if (item.mediaUrl && item.mediaUrl.endsWith('.mp4')) {
            mediaContent = `<video controls width="100%"><source src="${item.mediaUrl}" type="video/mp4"></video>`;
        } else {
            mediaContent = `<img src="${item.mediaUrl}" onerror="this.onerror=null;this.src='/images/Fallback_Img.jpeg';">`;
        }
    } else if (item.source === 'youtube') {
        mediaContent = `<iframe width="100%" height="300" src="${item.mediaUrl}" frameborder="0" allowfullscreen></iframe>`;
    } else if (item.source === 'tumblr') {
        if (item.mediaUrl?.endsWith('.mp4')) {
            mediaContent = `<video controls width="100%" preload="none"><source src="${item.mediaUrl}" type="video/mp4"></video>`;
        } else if (item.mediaUrl?.includes('iframe')) {
            mediaContent = `<div class="video-wrapper">${item.mediaUrl}</div>`;
        } else if (item.mediaUrl) {
            mediaContent = `<img src="${item.mediaUrl}" alt="Tumblr Media" onerror="this.onerror=null;this.src='/images/Fallback_Img.jpeg';" style="max-width: 100%;">`;
        }

        mediaContent += `
      <div class="tumblr-meta">
        <p><strong>Blog:</strong> ${item.blogName}</p>
        <p><strong>Tags:</strong> ${item.tags?.join(', ')}</p>
        <p><strong>Type:</strong> ${item.type}</p>
        <p><strong>Notes:</strong> ${item.noteCount}</p>
      </div>
    `;
    } else {
        mediaContent = item.mediaUrl
            ? `<img src="${item.mediaUrl}" alt="media" style="max-width: 100%;">`
            : '';
    }

    card.innerHTML = `
    ${mediaContent}
    <div class="post-info">
      <h3>${item.title}</h3>
      <p>${item.content || ''}</p>
      <small>Source: ${item.source}</small><br/>
      <a href="${item.articleUrl || item.mediaUrl || '#'}" target="_blank">View</a>
    </div>
  `;
    return card;
}

const feedContainer = document.getElementById('feed-container');
// Load more posts
function loadMorePosts(count = 9) {
    const end = currentIndex + count;
    const postsToAdd = combinedFeed.slice(currentIndex, end);
    postsToAdd.forEach(item => {
        setTimeout(() => {
            feedContainer.appendChild(createPost(item));
        }, 50);
    });
    currentIndex = end;
}

// Page Load Logic
window.addEventListener("DOMContentLoaded", () => {
  fetchAllFeeds(); // Call fetchAllFeeds when the page loads
});

// Infinite scroll
window.addEventListener('scroll', () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 5) {
        loadMorePosts();
    }
});
// Mobile menu toggle
const toggleBtn = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');

toggleBtn?.addEventListener('click', () => {
  mobileMenu.classList.toggle('active');
});


// Popup logic
const userIcon = document.getElementById("profile-pic");
const bellIcon = document.getElementById("bellIcon");
const profilePopup = document.getElementById("profile-popup");
const notificationPopup = document.getElementById("notification-popup");

userIcon?.addEventListener("click", () => {
  profilePopup.style.display = profilePopup.style.display === "block" ? "none" : "block";
  notificationPopup.style.display = "none";
});

bellIcon?.addEventListener("click", () => {
  notificationPopup.style.display = notificationPopup.style.display === "block" ? "none" : "block";
  profilePopup.style.display = "none";
});

// EventListner on Seacrh bar and Select options
const selectWrapper = document.getElementById('select-wrapper');
const select = document.getElementById('platform');

select.addEventListener('change', (e) => {
  const selectedSource = e.target.value;

  // Replace the dropdown with a search bar
  if(selectedSource == "tumblr"){
    selectWrapper.innerHTML = `
      <div class="search-container">
        <i class="fa-solid fa-magnifying-glass fa-lg" style="color: #141415;"></i>
        <input type="text" id="search-input" placeholder="Enter tagname or blog identifier...">
        <button id="change-platform-btn" class="change-btn">Change Platform</button>
      </div>
    `;
  }else {
    selectWrapper.innerHTML = `
      <div class="search-container">
        <i class="fa-solid fa-magnifying-glass fa-lg" style="color: #141415;"></i>
        <input type="text" id="search-input" placeholder="Search ${selectedSource}...">
        <button id="change-platform-btn" class="change-btn">Change Platform</button>
      </div>
    `;
  }

  const searchInput = document.getElementById('search-input');

  searchInput.addEventListener('keypress', async (event) => {
    if (event.key === 'Enter') {
      const query = searchInput.value.trim();
      if (!query) return;

      try {
        const params = new URLSearchParams({ q: query });
        const res = await fetch(`/api/${selectedSource}/search?${params.toString()}`);

        const data = await res.json();

        const combined = shuffle(data);
        console.log(combined);
        feedContainer.innerHTML = ''; // Optional: clear previous content
        combined.forEach(item => {
          feedContainer.appendChild(createPost(item));
        });

      } catch (err) {
        console.error('Search failed:', err);
      }
    }
  });

  addChangePlatformListener();
});

// Event to change the search bar back to dropdown
function addChangePlatformListener() {
  const changeBtn = document.getElementById('change-platform-btn');
  changeBtn.addEventListener('click', () => {
    // When "Change Platform" is clicked, restore the dropdown
    selectWrapper.innerHTML = `
      <div class="select-container">
        <select name="platform" id="platform">
          <option value="">-- Choose a platform --</option>
          <option value="youtube">YouTube</option>
          <option value="reddit">Reddit</option>
          <option value="news">News</option>
          <option value="tumblr">Tumblr</option>
        </select>
      </div>
    `;

    // Reattach the select change event
    const newSelect = document.getElementById('platform');
    newSelect.addEventListener('change', (e) => {
      selectedSource = e.target.value;
      select.dispatchEvent(new Event('change'));
    });
  });
}

// Map of page scripts
const pageScripts = {
  home: "../scripts/home.js",
  reddit: "../scripts/reddit.js",
  tumblr: "../scripts/tumblr.js",
  shorts: "../scripts/shorts.js",
  videos: "../scripts/videos.js",
  news: "../scripts/news.js",
  wallpapers: "../scripts/wallpapers.js",
  about: "../scripts/about.js",
};

// Track current page to prevent blank reloads
let currentPage = null;

// Load JS file and call optional initPage function
function loadPageScript(page) {
  if (!pageScripts[page]) {
    console.error(`Script for "${page}" not found.`);
    return;
  }

  if (page === currentPage) {
    // Re-invoke content rendering manually if needed
    if (typeof window.initPage === "function") {
      window.initPage();
    }
    return;
  }

  currentPage = page;

  // Remove existing script if any
  const existingScript = document.getElementById("page-script");
  if (existingScript) existingScript.remove();

  // Clear the feed container
  const feedContainer = document.getElementById("feed-container");
  if (feedContainer) {
    feedContainer.innerHTML = `<p>Loading ${page}...</p>`;
  }

  // Add new script with cache busting
  const script = document.createElement("script");
  script.src = `${pageScripts[page]}?v=${Date.now()}`;
  script.id = "page-script";

  script.onload = () => {
    if (typeof window.initPage === "function") {
      window.initPage(); // optional initializer from section file
    }
  };

  document.body.appendChild(script);
}

// Sidebar nav
document.querySelectorAll(".sidebar a").forEach(link => {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    const page = this.getAttribute("data-page");

    window.scrollTo({ top: 0, behavior: 'smooth' });

    loadPageScript(page);

    // Check if the clicked page is "home" and load mixed feeds
    if (page === "home") {
      fetchAllFeeds(); // Load the mixed feed when "home" is clicked
    }
    else if(page === "about"){
      // Redirect to about.html page
      window.location.href = "about.html";
    }
  });
});
