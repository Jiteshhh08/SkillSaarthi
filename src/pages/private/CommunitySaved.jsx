import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import TopBar from '../../components/layout/TopBar'
import Footer from '../../components/layout/Footer'
import PostCard from '../../components/community/PostCard'
import Icon from '../../components/common/Icon'
import { getSavedPosts, toggleBookmark, toggleLike } from '../../services/community'

function CommunitySaved() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await getSavedPosts()
      setPosts(result.posts || [])
    } catch {
      setPosts([])
      setError('Could not load your saved posts.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleLike = async (post) => {
    const result = await toggleLike(post.$id)
    setPosts((prev) =>
      prev.map((item) =>
        item.$id === post.$id ? { ...item, liked_by_me: result.liked, likes_count: result.likes_count } : item,
      ),
    )
  }

  const handleBookmark = async (post) => {
    const result = await toggleBookmark(post.$id)
    if (!result.bookmarked) {
      setPosts((prev) => prev.filter((item) => item.$id !== post.$id))
    } else {
      setPosts((prev) =>
        prev.map((item) =>
          item.$id === post.$id ? { ...item, bookmarked_by_me: result.bookmarked } : item,
        ),
      )
    }
  }

  return (
    <div className="min-h-screen">
      <TopBar />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.08em]">Community</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">Saved posts</h1>
            <p className="mt-2 max-w-2xl text-lg text-ink-muted">
              Posts you have bookmarked to read again later.
            </p>
          </div>
          <Link to="/community" className="btn-secondary !h-10 !px-4 !text-sm">
            Back to community
          </Link>
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-danger-soft bg-danger-soft px-4 py-3 text-sm font-bold text-danger">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="card h-56 animate-pulse bg-warm" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="mt-8 rounded-xl border border-accent-yellow bg-cream px-6 py-12 text-center">
            <Icon name="book-open" size={40} className="mx-auto text-brand-deep" />
            <p className="mt-4 text-2xl font-black tracking-tight">No saved posts yet</p>
            <p className="mt-2 mx-auto max-w-md text-sm text-ink-muted">
              Bookmark posts you find useful and they will appear here.
            </p>
            <Link to="/community" className="btn-primary mt-6 !h-10 !px-4 !text-sm inline-flex">
              Explore the community
            </Link>
          </div>
        ) : (
          <>
            <p className="mt-8 text-sm text-ink-muted">{posts.length} saved post{posts.length === 1 ? '' : 's'}</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {posts.map((post) => (
                <PostCard key={post.$id} post={post} onLike={handleLike} onBookmark={handleBookmark} />
              ))}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default CommunitySaved