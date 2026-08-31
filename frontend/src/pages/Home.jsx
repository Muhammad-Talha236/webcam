import { Link } from "react-router-dom";

const stories = [
  { name: "nuces.com...", img: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80" },
  { name: "saad_kaka...", img: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80" },
  { name: "_taimoor.a...", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80" },
  { name: "nahadmug...", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" },
  { name: "najoomite...", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80" },
  { name: "najoomite...", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80" },
];

const posts = [
  {
    id: 1,
    username: "startuppakistansp",
    verified: true,
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    location: "Pakistan",
    postImg: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80",
    caption: "Foreign Tourism in Pakistan is reaching breathtaking new heights! 🏔️✨",
    likes: "12,482",
    comments: "342",
    time: "1D",
  },
];

function Story({ story }) {
  return (
    <div className="ig-story">
      <div className="ig-story-ring">
        <img src={story.img} alt={story.name} className="ig-story-avatar-img" />
      </div>
      <span>{story.name}</span>
    </div>
  );
}

function PostCard({ post }) {
  return (
    <article className="ig-post">
      <div className="ig-post-header">
        <div className="ig-post-user">
          <img src={post.avatar} alt={post.username} className="ig-post-user-img" />
          <div className="ig-post-user-info">
            <div className="ig-username-row">
              <strong>{post.username}</strong>
              {post.verified && <span className="verified-badge">✔</span>}
              <span className="dot-sep">•</span>
              <span className="post-time-top">{post.time}</span>
            </div>
            <span>{post.location}</span>
          </div>
        </div>
        <button className="ig-more-button">•••</button>
      </div>

      <div className="ig-post-media">
        <img src={post.postImg} alt="Post content" />
      </div>

      <div className="ig-post-actions">
        <div className="ig-actions-left">
          <button aria-label="Like">
            <svg fill="currentColor" height="24" viewBox="0 0 24 24" width="24"><path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 5.955-5.519 8.951-1.04 1.07-2.13 2.16-3.231 3.22a.503.503 0 0 1-.702 0c-1.1-1.06-2.19-2.15-3.23-3.22C6.152 15.077 3.5 12.194 3.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.084.117.252.117.336 0a4.21 4.21 0 0 1 3.678-1.941z"></path></svg>
          </button>
          <button aria-label="Comment">
            <svg fill="none" height="24" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24"><path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z"></path></svg>
          </button>
          <button aria-label="Share">
            <svg fill="none" height="24" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24"><line x1="22" x2="9.218" y1="3" y2="15.782"></line><polygon points="11.698 20.334 22 3.001 2 3.001 9.218 15.782 11.698 20.334"></polygon></svg>
          </button>
        </div>
        <button aria-label="Save">
          <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24"><polygon points="20 21 12 13.44 4 21 4 3 20 3 20 21"></polygon></svg>
        </button>
      </div>

      <div className="ig-post-details">
        <strong>{post.likes} likes</strong>
        <p>
          <strong>{post.username}</strong> {post.caption}
        </p>
        <button className="ig-comments">View all {post.comments} comments</button>
        <span className="ig-post-time">{post.time}</span>
      </div>
    </article>
  );
}

export default function Home() {
  return (
    <div className="ig-app">
      {/* Left Sidebar */}
      <aside className="ig-sidebar">
        <Link to="/" className="ig-logo">
          Instagram
        </Link>
        <nav className="ig-nav">
          <Link to="/" className="ig-nav-item active">
            <span className="ig-nav-icon">🏠</span>
            <span>Home</span>
          </Link>
          <button className="ig-nav-item">
            <span className="ig-nav-icon">🔍</span>
            <span>Search</span>
          </button>
          <button className="ig-nav-item">
            <span className="ig-nav-icon">🧭</span>
            <span>Explore</span>
          </button>
          <Link to="/viewer" className="ig-nav-item">
            <span className="ig-nav-icon">▶</span>
            <span>Reels</span>
          </Link>
          <button className="ig-nav-item">
            <span className="ig-nav-icon">💬</span>
            <span>Messages</span>
          </button>
          <button className="ig-nav-item">
            <span className="ig-nav-icon">♡</span>
            <span>Notifications</span>
          </button>
          <Link to="/create" className="ig-nav-item">
            <span className="ig-nav-icon">➕</span>
            <span>Create</span>
          </Link>
          <button className="ig-nav-item">
            <span className="ig-nav-icon">👤</span>
            <span>Profile</span>
          </button>
        </nav>
        <div className="ig-sidebar-bottom">
          <button className="ig-nav-item">
            <span className="ig-nav-icon">☰</span>
            <span>More</span>
          </button>
        </div>
      </aside>

      {/* Center Feed */}
      <main className="ig-feed">
        <header className="ig-mobile-header">
          <Link to="/" className="ig-mobile-logo">Instagram</Link>
          <div>
            <button>♡</button>
            <button>💬</button>
          </div>
        </header>

        {/* Stories */}
        <section className="ig-stories">
          {stories.map((story) => (
            <Story key={story.name} story={story} />
          ))}
        </section>

        {/* Posts */}
        <section className="ig-feed-posts">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </section>
      </main>

      {/* Right Sidebar */}
      <aside className="ig-right">
        <div className="ig-profile-row">
          <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80" alt="Profile" className="ig-profile-avatar-img" />
          <div className="ig-profile-info">
            <strong>_mian.talha_</strong>
            <span>Muhammad Talha</span>
          </div>
          <button className="ig-switch">Switch</button>
        </div>

        <div className="ig-suggestion-heading">
          <strong>Suggested for you</strong>
          <button>See All</button>
        </div>

        <div className="ig-suggestions">
          {[
            ["Daud.", "Followed by only_sallu1 + 23"],
            ["SEENUUU 🌹", "Suggested for you"],
            ["Muhammad Usman", "Followed by tayyab_taish + 1"],
            ["MIAN UMAR", "Followed by zain_ul_abdin_1"],
            ["Saad Shafqat", "Followed by ramis_alyy + 4"],
          ].map(([name, subtitle]) => (
            <div className="ig-suggestion" key={name}>
              <div className="ig-suggestion-avatar">{name.charAt(0)}</div>
              <div className="ig-suggestion-info">
                <strong>{name}</strong>
                <span>{subtitle}</span>
              </div>
              <button className="ig-follow">Follow</button>
            </div>
          ))}
        </div>

        <div className="ig-footer">
          About · Help · Press · API · Jobs · Privacy · Terms · <br />
          Locations · Language · Meta Verified
          <p>© 2026 INSTAGRAM FROM META</p>
        </div>

        <div className="ig-messages">
          <span className="ig-message-icon">💬</span>
          <strong>Messages</strong>
          <span className="ig-message-badge">3</span>
        </div>
      </aside>
    </div>
  );
}