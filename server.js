require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3000;
const bodyParser = require('body-parser');

app.use(bodyParser.json()); // to parse JSON bodies

// Firebase Config endpoint
app.get('/api/firebase-config', (req, res) => {
  res.json({
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
  });
});

// Tumblr data will be fetched here
// Tumblr set to fetch multiple blogs
const TUMBLR_API_KEY = process.env.TUMBLR_API_KEY;

app.get('/api/tumblr', async (req, res) => {
  const blogsParam = req.query.blogs; // Comma-separated blog identifiers
  if (!blogsParam) return res.status(400).json({ error: 'Missing blog identifiers' });

  const blogList = blogsParam.split(',').map(b => b.trim());
  const posts = [];

  try {
    const fetches = blogList.map(async blog => {
      const apiUrl = `https://api.tumblr.com/v2/blog/${blog}/posts?api_key=${TUMBLR_API_KEY}&limit=40`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.response?.posts) {
        const formatted = data.response.posts.map(post => {
          let mediaUrl = '';

          // Handle photo posts
          if (post.type === 'photo' && post.photos?.length) {
            mediaUrl = post.photos[0].original_size.url;
          }

          // Handle direct .mp4 video posts
          else if (post.type === 'video' && post.video_url) {
            mediaUrl = post.video_url;
          }

          // Handle embedded videos (iframe)
          else if (Array.isArray(post.player) && post.player.length) {
            const lastPlayer = post.player[post.player.length - 1];
            if (lastPlayer && typeof lastPlayer.embed_code === 'string') {
              const match = lastPlayer.embed_code.match(/src="([^"]+)"/);
              if (match) {
                // You can also return full embed HTML instead if preferred by frontend
                const iframe = `<div class="video-wrapper"><iframe src="${match[1]}" frameborder="0" allowfullscreen></iframe></div>`;
                mediaUrl = iframe;
              }
            }
          }


          return {
            title: post.summary || post.slug || 'Tumblr Post',
            content: post.caption || post.body || '',
            mediaUrl,
            articleUrl: post.post_url,
            source: 'tumblr',
            createdAt: new Date(post.timestamp * 1000).getTime() / 1000,
            blogName: post.blog_name,
            tags: post.tags,
            type: post.type,
            noteCount: post.note_count
          };
        });

        // console.log(posts);
        posts.push(...formatted);
      }
    });

    await Promise.all(fetches);
    res.json(posts);
  } catch (err) {
    console.error('Tumblr fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch Tumblr posts' });
  }
});



// Serve the index.html from here
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});



// Reddit data fetching
async function getRedditToken() {
  const credentials = Buffer.from(
    `${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`
  ).toString('base64');


  const response = await axios.post(
    'https://www.reddit.com/api/v1/access_token',
    `grant_type=password&username=${process.env.REDDIT_USERNAME}&password=${process.env.REDDIT_PASSWORD}`,
    {
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'social-aggregator/0.1 by DeathlyGod000001'
      }
    }
  );

  return response.data.access_token;
}


app.get('/api/reddit', async (req, res) => {
  try {
    const token = await getRedditToken();

    const response = await axios.get('https://oauth.reddit.com/r/popular/hot', {
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'social-aggregator/0.1 by myreddituser'
      }
    });

    // const posts = response.data.data.children.map(post => ({
    //   title: post.data.title,
    //   content: post.data.selftext,
    //   mediaUrl: post.data.url,
    //   source: 'reddit',
    //   createdAt: post.data.created_utc
    // }));

    const posts = response.data.data.children
      .map(post => ({
        title: post.data.title,
        content: post.data.selftext,
        mediaUrl: post.data.url,
        thumbnail: post.data.thumbnail && post.data.thumbnail.startsWith('http') ? post.data.thumbnail : '',
        source: 'reddit',
        permalink: post.data.permalink ? `https://www.reddit.com${post.data.permalink}` : '',
        createdAt: new Date(post.data.created_utc * 1000).toISOString()
      }))

      .filter(post => post.content || post.mediaUrl);

    res.json(posts);
    // console.log(posts);
  } catch (err) {
    res.status(500).json({ error: 'Reddit fetch failed', details: err.message });
  }
});


// Youtube Data fecthing
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

app.get('/api/youtube', async (req, res) => {
  try {
    const response = await axios.get(
      'https://www.googleapis.com/youtube/v3/search',
      {
        params: {
          part: 'snippet',
          q: 'AMVs',         // 🔍 You can change this keyword
          type: 'video',
          maxResults: 10,
          key: YOUTUBE_API_KEY
        }
      }
    );

    const videos = response.data.items.map(item => ({
      title: item.snippet.title,
      content: item.snippet.description,
      mediaUrl: `https://www.youtube.com/embed/${item.id.videoId}?autoplay=1&controls=1&modestbranding=1&rel=0`,
      source: 'youtube',
      createdAt: item.snippet.publishedAt
    }));

    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: 'YouTube fetch failed', details: err.message });
  }
});

// NEWS DATA fetching
const NEWS_API_KEY = process.env.NEWS_API_KEY;

app.get('/api/news', async (req, res) => {
  try {
    const response = await axios.get(
      'https://newsapi.org/v2/top-headlines',
      {
        params: {
          country: 'US',         // Change to your target country
          category: 'technology', // Change category (tech, sports, etc.)
          pageSize: 10,
          apiKey: NEWS_API_KEY
        }
      }
    );

    const articles = response.data.articles.map(article => ({
      title: article.title,
      content: article.description || article.content,
      mediaUrl: article.urlToImage,
      source: 'news',
      createdAt: article.publishedAt,
      articleUrl: article.url
    }));

    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch news', details: err.message });
  }
});

// Search Rout for Reddit platform 
app.get('/api/reddit/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: 'Missing search query' });

  try {
    const response = await fetch(`https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=10`);
    const json = await response.json();

    const posts = json.data.children.map(post => {
      const data = post.data;
      return {
        title: data.title,
        content: data.selftext || '',
        mediaUrl: data.preview?.images?.[0]?.source?.url?.replace(/&amp;/g, '&') || '',  // fallback to empty
        source: 'reddit',
        articleUrl: `https://reddit.com${data.permalink}`,
        createdAt: data.created_utc
      };
    });

    res.json(posts);
  } catch (err) {
    console.error('Reddit search error:', err);
    res.status(500).json({ error: 'Failed to fetch from Reddit' });
  }
});

// Serach rout for Youtube Platform
app.get('/api/youtube/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: 'Missing search query' });

  try {
    const apiKey = process.env.YOUTUBE_API_KEY;

    // Search videos based on query
    const searchRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&maxResults=30&key=${apiKey}`
    );
    const searchJson = await searchRes.json();

    const videos = searchJson.items
      .filter(item => item.id && item.id.kind === 'youtube#video' && item.id.videoId)
      .map(item => {
        const videoId = item.id.videoId;
        const mediaUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1&rel=0`;

        return {
          title: item.snippet.title,
          content: item.snippet.description,
          mediaUrl,
          source: 'youtube',
          articleUrl: `https://www.youtube.com/watch?v=${videoId}`,
          createdAt: new Date(item.snippet.publishedAt).getTime() / 1000
        };
      });

    res.json(videos);
  } catch (err) {
    console.error('YouTube search error:', err);
    res.status(500).json({ error: 'Failed to fetch from YouTube' });
  }
});



// Search rout for News platform
app.get('/api/news/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: 'Missing search query' });

  try {
    const apiKey = process.env.NEWS_API_KEY;
    const response = await fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&pageSize=10&apiKey=${apiKey}`);
    const json = await response.json();

    const articles = json.articles.map(article => ({
      title: article.title,
      content: article.description || '',
      mediaUrl: article.urlToImage || '',
      source: 'news',
      articleUrl: article.url,
      createdAt: new Date(article.publishedAt).getTime() / 1000
    }));

    res.json(articles);
  } catch (err) {
    console.error('News API search error:', err);
    res.status(500).json({ error: 'Failed to fetch from News API' });
  }
});

// Tumblr search rout goes here
app.get('/api/tumblr/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: 'Missing search query' });

  const TUMBLR_API_KEY = process.env.TUMBLR_API_KEY;

  // Helper function to determine if input looks like a blog
  const isBlog = (q) => {
    return q.includes('.') || q.includes('.tumblr.com');
  };

  let searchUrl = '';

  if (isBlog(query)) {
    // Normalize blog identifier
    let blogIdentifier = query.toLowerCase();
    if (!blogIdentifier.includes('.tumblr.com')) {
      blogIdentifier += '.tumblr.com';
    }
    searchUrl = `https://api.tumblr.com/v2/blog/${blogIdentifier}/posts?api_key=${TUMBLR_API_KEY}`;
  } else {
    // Search by tag
    searchUrl = `https://api.tumblr.com/v2/tagged?tag=${encodeURIComponent(query)}&api_key=${TUMBLR_API_KEY}`;
  }

  try {
    const response = await fetch(searchUrl);
    const data = await response.json();

    let posts = [];

    if (data.response) {
      // `tagged` search returns array directly
      if (Array.isArray(data.response)) {
        posts = data.response;
      } else if (data.response.posts) {
        // `blog` search returns object with `posts` array
        posts = data.response.posts;
      }
    }

    const results = posts.map(post => {
      let mediaUrl = '';

      // Handle photo posts
      if (post.type === 'photo' && post.photos?.length) {
        mediaUrl = post.photos[0].original_size.url;
      }

      // Handle video posts
      if (post.type === 'video' && post.video_url) {
        mediaUrl = post.video_url;
      }

      // Fallback: extract media from embed HTML
      if (!mediaUrl && post.player?.length) {
        const lastPlayer = post.player[post.player.length - 1];
        const match = lastPlayer.embed_code?.match(/src="([^"]+)"/);
        if (match) mediaUrl = match[1];
      }

      return {
        title: post.summary || post.slug || 'Tumblr Post',
        content: post.caption || post.body || '',
        mediaUrl,
        articleUrl: post.post_url,
        source: 'tumblr',
        createdAt: new Date(post.timestamp * 1000).getTime() / 1000,
        blogName: post.blog_name,
        tags: post.tags,
        type: post.type,
        noteCount: post.note_count
      };
    });

    res.json(results);
  } catch (err) {
    console.error('Tumblr search error:', err);
    res.status(500).json({ error: 'Failed to search Tumblr' });
  }
});





// Serve index.html from public/pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/index.html'));
});

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/login.html'));
});

app.get('/main.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/main.html'));
});

app.get('/privacy.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/privacy.html'));
});

app.get('/terms.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/terms.html'));
});

app.get('/about.html', (req, res) =>{
  res.sendFile(path.join(__dirname, 'public/pages/about.html'))
})

app.listen(PORT, () => {
  console.log(`✅ Surver is running at http://localhost:${PORT}`);
});

