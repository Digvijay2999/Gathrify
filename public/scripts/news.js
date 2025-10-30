
let newsFeed = [];
let currentNewsIndex = 0;

// Fetch news articles (default or search)
async function fetchNews(query = '') {
  try {
    const url = query
      ? `/api/news/search?q=${encodeURIComponent(query)}`
      : `/api/news`;

    const res = await fetch(url);
    const data = await res.json();
    newsFeed = shuffle(data);
    currentNewsIndex = 0;
    loadMoreNewsPosts();
  } catch (err) {
    console.error('Error fetching news feeds:', err);
  }
}

// Shuffle helper (same as the others)
function shuffle(array) {
  return array
    .map(item => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

// Create a news post card
function createNewsPost(item) {
  const card = document.createElement('div');
  card.className = 'post-card';
  let mediaContent = '';

  // News article with image (if available)
  if (item.mediaUrl) {
    mediaContent = `<img src="${item.mediaUrl}" alt="News Media" onerror="this.onerror=null;this.src='/images/Fallback_Img.jpeg';" style="max-width: 100%;">`;
  }

  card.innerHTML = `
    ${mediaContent}
    <div class="post-info">
      <h3>${item.title}</h3>
      <p>${item.description || ''}</p>
      <small>Source: News</small><br/>
      <a href="${item.articleUrl || '#'}" target="_blank">Read More</a>
    </div>
  `;
  return card;
}

// Load more news posts (infinite scroll)
function loadMoreNewsPosts(count = 9) {
  const feedContainer = document.getElementById('feed-container');
  const end = currentNewsIndex + count;
  const postsToAdd = newsFeed.slice(currentNewsIndex, end);
  postsToAdd.forEach(item => {
    setTimeout(() => {
      feedContainer.appendChild(createNewsPost(item));
    }, 50);
  });
  currentNewsIndex = end;
}

// Infinite scroll
window.addEventListener('scroll', () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 5) {
    loadMoreNewsPosts();
  }
});

// Init when page loads for news
window.initPage = function (query = '') {
  const feedContainer = document.getElementById('feed-container');
  feedContainer.innerHTML = `<p>Loading news...</p>`;
  newsFeed = [];
  currentNewsIndex = 0;
  fetchNews(query);
}
