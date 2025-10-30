// tumblr.js

let tumblrFeed = [];
let currentTumblrIndex = 0;

// Fetch Tumblr feeds (default or search)
async function fetchTumblrFeeds(query = '') {
  try {
    const url = query
      ? `/api/tumblr/search?q=${encodeURIComponent(query)}`
      : `/api/tumblr?blogs=anime,movies`;

    const res = await fetch(url);
    const data = await res.json();
    tumblrFeed = shuffle(data);
    currentTumblrIndex = 0;
    loadMoreTumblrPosts();
  } catch (err) {
    console.error('Error fetching Tumblr feeds:', err);
  }
}

// Shuffle helper
function shuffle(array) {
  return array
    .map(item => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

// Create Tumblr post card
function createTumblrPost(item) {
  const card = document.createElement('div');
  card.className = 'post-card';
  let mediaContent = '';

  if (item.mediaUrl?.endsWith('.mp4')) {
    mediaContent = `<video controls width="100%" preload="none"><source src="${item.mediaUrl}" type="video/mp4"></video>`;
  } else if (item.mediaUrl?.includes('iframe')) {
    mediaContent = `<div class="video-wrapper">${item.mediaUrl}</div>`;
  } else if (item.mediaUrl) {
    mediaContent = `<img src="${item.mediaUrl}" alt="Tumblr Media" onerror="this.onerror=null;this.src='/images/Fallback_Img.jpeg';" style="max-width: 100%;">`;
  }

  card.innerHTML = `
    ${mediaContent}
    <div class="post-info">
      <h3>${item.title}</h3>
      <p>${item.content || ''}</p>
      <div class="tumblr-meta">
        <p><strong>Blog:</strong> ${item.blogName}</p>
        <p><strong>Tags:</strong> ${item.tags?.join(', ')}</p>
        <p><strong>Type:</strong> ${item.type}</p>
        <p><strong>Notes:</strong> ${item.noteCount}</p>
      </div>
      <small>Source: Tumblr</small><br/>
      <a href="${item.articleUrl || item.mediaUrl || '#'}" target="_blank">View</a>
    </div>
  `;
  return card;
}

// Load more Tumblr posts
function loadMoreTumblrPosts(count = 9) {
  const feedContainer = document.getElementById('feed-container');
  const end = currentTumblrIndex + count;
  const postsToAdd = tumblrFeed.slice(currentTumblrIndex, end);
  postsToAdd.forEach(item => {
    setTimeout(() => {
      feedContainer.appendChild(createTumblrPost(item));
    }, 50);
  });
  currentTumblrIndex = end;
}

// Infinite scroll
window.addEventListener('scroll', () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 5) {
    loadMoreTumblrPosts();
  }
});

// Init when page loads
window.initPage = function (query = '') {
  const feedContainer = document.getElementById('feed-container');
  feedContainer.innerHTML = `<p>Loading Tumblr...</p>`;
  tumblrFeed = [];
  currentTumblrIndex = 0;
  fetchTumblrFeeds(query);
}
