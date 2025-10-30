// reddit.js

let redditFeed = [];
let currentRedditIndex = 0;

// Fetch Reddit feeds (default or search)
async function fetchRedditFeeds(query = '') {
  try {
    const url = query
      ? `/api/reddit/search?q=${encodeURIComponent(query)}`
      : `/api/reddit`;

    const res = await fetch(url);
    const data = await res.json();
    redditFeed = shuffle(data);
    currentRedditIndex = 0;
    loadMoreRedditPosts();
    console.log(redditFeed);
  } catch (err) {
    console.error('Error fetching Reddit feeds:', err);
  }
}

// Shuffle helper
function shuffle(array) {
  return array
    .map(item => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

// Create Reddit post card
function createRedditPost(item) {
  const card = document.createElement('div');
  card.className = 'post-card';
  let mediaContent = '';

  if (item.mediaUrl.includes('v.redd.it')) {
    mediaContent = `
        <a href="${item.permalink}" target="_blank">
            <img src="${item.thumbnail}" onerror="this.onerror=null;this.src='/images/Fallback_Img.jpeg';" alt="Preview" style="max-width: 100%;">
        </a>
        `;
  } else if (item.mediaUrl && item.mediaUrl.endsWith('.mp4')) {
    // Reddit video
    mediaContent = `
      <video controls width="100%">
        <source src="${item.mediaUrl}" type="video/mp4">
        Your browser does not support the video tag.
      </video>
    `;
  } else {
    // Reddit image
    mediaContent = `<img src="${item.mediaUrl}" onerror="this.onerror=null;this.src='/images/Fallback_Img.jpeg';">`;

  }

  card.innerHTML = `
    ${mediaContent}
    <div class="post-info">
      <h3>${item.title}</h3>
      <p>${item.content || ''}</p>
      <small>Source: Reddit</small><br/>
      <a href="${item.articleUrl || item.mediaUrl || '#'}" target="_blank">View</a>
    </div>
  `;
  return card;
}

// Load more Reddit posts
function loadMoreRedditPosts(count = 9) {
  const feedContainer = document.getElementById('feed-container');
  const end = currentRedditIndex + count;
  const postsToAdd = redditFeed.slice(currentRedditIndex, end);
  postsToAdd.forEach(item => {
    setTimeout(() => {
      feedContainer.appendChild(createRedditPost(item));
    }, 50);
  });
  currentRedditIndex = end;
}

// Infinite scroll
window.addEventListener('scroll', () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 5) {
    loadMoreRedditPosts();
  }
});

// Init when page loads
window.initPage = function (query = '') {
  const feedContainer = document.getElementById('feed-container');
  feedContainer.innerHTML = `<p>Loading Reddit...</p>`;
  redditFeed = [];
  currentRedditIndex = 0;
  fetchRedditFeeds(query);
}
