
// Fetch combined feeds (Reddit, YouTube, News, Tumblr)
let combinedFeed = [];
let currentIndex = 0;

async function fetchAllFeeds() {
    try {
        const [redditRes, youtubeRes, newsRes, tumblrRes] = await Promise.all([
            fetch('/api/reddit'),
            fetch('/api/youtube'),
            fetch('/api/news'),
            fetch('/api/tumblr?blogs=anime,movies')
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

// Load more posts
function loadMorePosts(count = 9) {
    const feedContainer = document.getElementById('feed-container');
    const end = currentIndex + count;
    const postsToAdd = combinedFeed.slice(currentIndex, end);
    postsToAdd.forEach(item => {
        setTimeout(() => {
            feedContainer.appendChild(createPost(item));
        }, 50);
    });
    currentIndex = end;
}

// Infinite scroll
window.addEventListener('scroll', () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 5) {
        loadMorePosts();
    }
});

// Init when page loads
window.initPage = function () {
    const feedContainer = document.getElementById('feed-container');
    feedContainer.innerHTML = `<p>Loading Home...</p>`;
    combinedFeed = [];
    currentIndex = 0;
    fetchAllFeeds();
}
