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
    postImg: "https://images.unsplash.com/photo-1610312278520-bcc893a3ff1d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGFtZXJpY2F8ZW58MHx8MHx8fDA%3D",
    caption: "Foreign Tourism in Nepal is reaching breathtaking new heights! 🏔️✨",
    likes: "12,482",
    comments: "342",
    time: "1D",
  },
];

function Story({ story }) {
  return (
    <div className="flex flex-col items-center w-[66px] shrink-0 text-center">
      <div className="w-[64px] h-[64px] p-[2px] rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600">
        <img src={story.img} alt={story.name} className="w-full h-full rounded-full border-2 border-black object-cover" />
      </div>
      <span className="mt-1 text-[11px] text-neutral-400 truncate w-full">{story.name}</span>
    </div>
  );
}

function PostCard({ post }) {
  return (
    <article className="border-b border-neutral-800 pb-4 mb-3">
      <div className="flex items-center justify-between py-2 px-1">
        <div className="flex items-center gap-2.5">
          <img src={post.avatar} alt={post.username} className="w-8 h-8 rounded-full object-cover" />
          <div className="flex flex-col">
            <div className="flex items-center gap-1 text-sm font-semibold">
              <span>{post.username}</span>
              {post.verified && <span className="text-blue-500 text-xs">✔</span>}
              <span className="text-neutral-500">•</span>
              <span className="text-neutral-500 text-xs font-normal">{post.time}</span>
            </div>
            <span className="text-xs text-neutral-500">{post.location}</span>
          </div>
        </div>
        <button className="text-neutral-300 hover:text-white">•••</button>
      </div>

      <div className="w-full aspect-[4/5] bg-neutral-900 rounded border border-neutral-800 overflow-hidden">
        <img src={post.postImg} alt="Post content" className="w-full h-full object-cover" />
      </div>

      <div className="flex items-center justify-between py-2.5">
        <div className="flex gap-4">
          <button className="hover:opacity-60">
            <svg fill="currentColor" height="24" viewBox="0 0 24 24" width="24"><path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 5.955-5.519 8.951-1.04 1.07-2.13 2.16-3.231 3.22a.503.503 0 0 1-.702 0c-1.1-1.06-2.19-2.15-3.23-3.22C6.152 15.077 3.5 12.194 3.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.084.117.252.117.336 0a4.21 4.21 0 0 1 3.678-1.941z"></path></svg>
          </button>
          <button className="hover:opacity-60">
            <svg fill="none" height="24" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24"><path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z"></path></svg>
          </button>
          <button className="hover:opacity-60">
            <svg fill="none" height="24" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24"><line x1="22" x2="9.218" y1="3" y2="15.782"></line><polygon points="11.698 20.334 22 3.001 2 3.001 9.218 15.782 11.698 20.334"></polygon></svg>
          </button>
        </div>
        <button className="hover:opacity-60">
          <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24"><polygon points="20 21 12 13.44 4 21 4 3 20 3 20 21"></polygon></svg>
        </button>
      </div>

      <div className="space-y-1 text-sm">
        <strong className="block font-semibold">{post.likes} likes</strong>
        <p>
          <strong className="font-semibold">{post.username}</strong> {post.caption}
        </p>
        <button className="text-neutral-500 text-xs py-1">View all {post.comments} comments</button>
        <span className="block text-[10px] text-neutral-500 uppercase tracking-wide">{post.time}</span>
      </div>
    </article>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex justify-center gap-10 max-w-7xl mx-auto px-4">
      {/* Left Sidebar */}
      <aside className="sticky top-0 h-screen w-60 border-r border-neutral-800 hidden md:flex flex-col p-6 z-50">
        <Link to="/" className="text-2xl font-bold tracking-tight mb-8">
          Instagram
        </Link>
        <nav className="flex flex-col gap-2">
          <Link to="/" className="flex items-center gap-4 p-3 rounded-xl bg-neutral-900 font-bold">
            <span className="text-xl">🏠</span>
            <span className="text-sm font-medium">Home</span>
          </Link>
          <button className="flex items-center gap-4 p-3 rounded-xl hover:bg-neutral-900 transition">
            <span className="text-xl">🔍</span>
            <span className="text-sm font-medium">Search</span>
          </button>
          <button className="flex items-center gap-4 p-3 rounded-xl hover:bg-neutral-900 transition">
            <span className="text-xl">🧭</span>
            <span className="text-sm font-medium">Explore</span>
          </button>
          <button className="flex items-center gap-4 p-3 rounded-xl hover:bg-neutral-900 transition">
            <span className="text-xl">▶</span>
            <span className="text-sm font-medium">Reels</span>
          </button>
          <button className="flex items-center gap-4 p-3 rounded-xl hover:bg-neutral-900 transition">
            <span className="text-xl">💬</span>
            <span className="text-sm font-medium">Messages</span>
          </button>
          <button className="flex items-center gap-4 p-3 rounded-xl hover:bg-neutral-900 transition">
            <span className="text-xl">♡</span>
            <span className="text-sm font-medium">Notifications</span>
          </button>
          <Link to="/create" className="flex items-center gap-4 p-3 rounded-xl hover:bg-neutral-900 transition">
            <span className="text-xl">➕</span>
            <span className="text-sm font-medium">Create</span>
          </Link>
          <button className="flex items-center gap-4 p-3 rounded-xl hover:bg-neutral-900 transition">
            <span className="text-xl">👤</span>
            <span className="text-sm font-medium">Profile</span>
          </button>
        </nav>
        <div className="mt-auto">
          <button className="flex items-center gap-4 p-3 w-full rounded-xl hover:bg-neutral-900 transition">
            <span className="text-xl">☰</span>
            <span className="text-sm font-medium">More</span>
          </button>
        </div>
      </aside>

      {/* Center Feed */}
      <main className="flex-1 py-6 px-2 max-w-[630px]">
        <header className="flex md:hidden items-center justify-between p-2 border-b border-neutral-800 mb-4">
          <Link to="/" className="text-xl font-bold">Instagram</Link>
          <div className="flex gap-4 text-xl">
            <button>♡</button>
            <button>💬</button>
          </div>
        </header>

        {/* Stories */}
        <section className="flex gap-4 pb-6 overflow-x-auto scrollbar-none">
          {stories.map((story) => (
            <Story key={story.name} story={story} />
          ))}
        </section>

        {/* Posts */}
        <section className="flex flex-col gap-5">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </section>
      </main>

      {/* Right Sidebar */}
      <aside className="sticky top-0 h-screen w-80 pt-8 hidden lg:block">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80" alt="Profile" className="w-12 h-12 rounded-full object-cover" />
            <div>
              <strong className="block text-sm font-semibold">_mian.talha_</strong>
              <span className="text-xs text-neutral-400">Muhammad Talha</span>
            </div>
          </div>
          <button className="text-xs font-semibold text-blue-500 hover:text-white">Switch</button>
        </div>

        <div className="flex justify-between items-center mb-4">
          <strong className="text-xs font-bold text-neutral-400">Suggested for you</strong>
          <button className="text-xs font-semibold text-neutral-200 hover:text-neutral-400">See All</button>
        </div>

        <div className="space-y-3 mb-8">
          {[
            ["Daud.", "Followed by only_sallu1 + 23"],
            ["SEENUUU 🌹", "Suggested for you"],
            ["Muhammad Usman", "Followed by tayyab_taish + 1"],
            ["MIAN UMAR", "Followed by zain_ul_abdin_1"],
            ["Saad Shafqat", "Followed by ramis_alyy + 4"],
          ].map(([name, subtitle]) => (
            <div className="flex items-center justify-between" key={name}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-xs">{name.charAt(0)}</div>
                <div className="text-xs">
                  <strong className="block font-semibold">{name}</strong>
                  <span className="text-neutral-500 text-[11px]">{subtitle}</span>
                </div>
              </div>
              <button className="text-xs font-semibold text-blue-500 hover:text-white">Follow</button>
            </div>
          ))}
        </div>

        <div className="text-[11px] text-neutral-500 leading-relaxed">
          About · Help · Press · API · Jobs · Privacy · Terms · Locations · Language · Meta Verified
          <p className="mt-4 font-mono text-[10px]">© 2026 INSTAGRAM FROM META</p>
        </div>

        <div className="fixed right-6 bottom-6 bg-neutral-800 border border-neutral-700 px-4 py-2.5 rounded-full flex items-center gap-3 shadow-2xl cursor-pointer hover:bg-neutral-700 transition">
          <span className="text-lg">💬</span>
          <strong className="text-xs font-medium">Messages</strong>
          <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">3</span>
        </div>
      </aside>
    </div>
  );
}