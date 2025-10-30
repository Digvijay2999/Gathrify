# Gathrify - Social Media Content Aggregator

Gathrify is a web application that aggregates content from multiple social media platforms and news sources into a single, unified feed. It provides a seamless way to browse and search content from Tumblr, Reddit, YouTube, and News APIs.

## Features

- **Multi-Platform Integration**: Fetch and display content from:
  - Tumblr
  - Reddit
  - YouTube
  - News API
  - High-quality Wallpapers (via Picsum Photos API)

- **Search Functionality**: Search content across all platforms
- **Responsive Design**: Mobile-friendly user interface
- **Authentication**: Secure user authentication system
- **Real-time Updates**: Fresh content from all platforms

## Getting Started

### Prerequisites

- Node.js (latest LTS version)
- npm package manager
- API keys for:
  - Tumblr
  - Reddit
  - YouTube
  - News API

### Installation

1. Clone the repository:
```bash
git clone [your-repository-url]
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your API keys:
```env
TUMBLR_API_KEY=your_tumblr_api_key
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_USERNAME=your_reddit_username
REDDIT_PASSWORD=your_reddit_password
YOUTUBE_API_KEY=your_youtube_api_key
NEWS_API_KEY=your_news_api_key
```

4. Start the server:
```bash
npm start
```

The application will be available at `http://localhost:3000`


## API Endpoints

### Tumblr
- `GET /api/tumblr` - Fetch posts from specified Tumblr blogs
- `GET /api/tumblr/search` - Search Tumblr posts

### Reddit
- `GET /api/reddit` - Fetch popular posts from Reddit
- `GET /api/reddit/search` - Search Reddit posts

### YouTube
- `GET /api/youtube` - Fetch YouTube videos
- `GET /api/youtube/search` - Search YouTube videos

### News
- `GET /api/news` - Fetch latest news
- `GET /api/news/search` - Search news articles

### Wallpapers
- Uses the Picsum Photos API to provide high-quality wallpapers
- Features:
  - Infinite scroll loading of wallpapers
  - High-resolution images (2056x2056)
  - Lazy loading for optimal performance
  - One-click download functionality
  - Random wallpaper generation

## Technologies Used

- **Backend**: Node.js, Express.js
- **APIs**: 
  - Tumblr API
  - Reddit API
  - YouTube Data API
  - News API
- **Authentication**: Firebase Authentication
- **Deployment**: Firebase Hosting

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the LICENSE file for details.