

let youtubeFeed = [];
let currentYoutubeIndex = 0;

// Fetch YouTube videos (default or search)
async function fetchYoutubeVideos(query = '', type = 'videos') {
  try {
    const url = query
      ? `/api/youtube/search?q=${encodeURIComponent(query)}&type=${type}`
      : `/api/youtube?type=${type}&maxResult=30`;

    const res = await fetch(url);
    const data = await res.json();
    youtubeFeed = shuffle(data);
    currentYoutubeIndex = 0;
    loadMoreYoutubePosts();
  } catch (err) {
    console.error('Error fetching YouTube feeds:', err);
  }
}

// Shuffle helper (same as the others)
function shuffle(array) {
  return array
    .map(item => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

// Create YouTube post card
function createYoutubePost(item) {
  const card = document.createElement('div');
  card.className = 'post-card';
  let mediaContent = '';

  // YouTube video
  if (item.mediaUrl?.includes('youtube.com')) {
    mediaContent = `
      <iframe width="100%" height="300"
        key="${item.mediaUrl}"
        src="${item.mediaUrl}"
        frameborder="0" allowfullscreen>
      </iframe>
    `;
  } else if (item.mediaUrl?.endsWith('.mp4')) {
    mediaContent = `
      <video controls width="100%">
        <source src="${item.mediaUrl}" type="video/mp4">
        Your browser does not support the video tag.
      </video>
    `;
  }

  card.innerHTML = `
    ${mediaContent}
    <div class="post-info">
      <h3>${item.title}</h3>
      <p>${item.content || ''}</p>
      <small>Source: YouTube</small><br/>
      <a href="${item.articleUrl || item.mediaUrl || '#'}" target="_blank">Watch</a>
    </div>
  `;
  return card;
}

// Load more YouTube posts (infinite scroll)
function loadMoreYoutubePosts(count = 9) {
  const feedContainer = document.getElementById('feed-container');
  const end = currentYoutubeIndex + count;
  const postsToAdd = youtubeFeed.slice(currentYoutubeIndex, end);
  postsToAdd.forEach(item => {
    setTimeout(() => {
      feedContainer.appendChild(createYoutubePost(item));
    }, 50);
  });
  currentYoutubeIndex = end;
}

// Infinite scroll
window.addEventListener('scroll', () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 5) {
    loadMoreYoutubePosts();
  }
});

// Init when page loads for YouTube videos or Shorts
window.initPage = function (query = '', type = 'videos') {
  const feedContainer = document.getElementById('feed-container');
  feedContainer.innerHTML = `<p>Loading YouTube ${type}...</p>`;
  youtubeFeed = [];
  currentYoutubeIndex = 0;
  fetchYoutubeVideos(query, type);
}
