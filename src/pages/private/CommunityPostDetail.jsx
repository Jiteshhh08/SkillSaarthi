import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import TopBar from '../../components/layout/TopBar'
import Footer from '../../components/layout/Footer'
import Avatar from '../../components/community/Avatar'
import PostComposer from '../../components/community/PostComposer'
import CommentSection from '../../components/community/CommentSection'
import Icon from '../../components/common/Icon'
import { timeAgo } from '../../services/notifications'
import { useAuth } from '../../hooks/useAuth'
import {
  deletePost,
  getPost,
  toggleBookmark,
  toggleLike,
  updatePost,
} from '../../services/community'

function toUserShape(author) {
  if (!author) return null
  return { name: author.name, prefs: { avatar_file_id: author.avatar_file_id || '' } }
}

function CommunityPostDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const fetched = await getPost(id)
      setPost(fetched)
    } catch {
      setPost(null)
      setError('This post could not be found or is no longer available.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  const [likeBusy, setLikeBusy] = useState(false)
  const [bookmarkBusy, setBookmarkBusy] = useState(false)
  const handleLike = async () => {
    if (likeBusy || !post) return
    setLikeBusy(true)
    try {
      const result = await toggleLike(post.$id)
      setPost((prev) => ({ ...prev, liked_by_me: result.liked, likes_count: result.likes_count }))
    } finally {
      setLikeBusy(false)
    }
  }

  const handleBookmark = async () => {
    if (bookmarkBusy || !post) return
    setBookmarkBusy(true)
    try {
      const result = await toggleBookmark(post.$id)
      setPost((prev) => ({ ...prev, bookmarked_by_me: result.bookmarked }))
    } finally {
      setBookmarkBusy(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return
    await deletePost(post.$id)
    navigate('/community')
  }

  const handleUpdated = async (updated) => {
    const saved = await updatePost(post.$id, {
      title: updated.title,
      content: updated.content,
      category: updated.category,
      tags: updated.tags,
      status: updated.status,
    })
    setPost(saved)
    setEditing(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <TopBar />
        <main className="mx-auto max-w-6xl px-6 py-10">
          <div className="card h-64 animate-pulse bg-warm" />
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen">
        <TopBar />
        <main className="mx-auto max-w-6xl px-6 py-10">
          <div className="card p-10 text-center">
            <Icon name="message" size={40} className="mx-auto text-ink-soft" />
            <p className="mt-4 text-2xl font-black tracking-tight">Post unavailable</p>
            <p className="mt-2 text-sm text-ink-muted">{error}</p>
            <Link to="/community" className="btn-primary mt-6 !h-10 !px-4 !text-sm inline-flex">
              Back to community
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const isOwner = post.user_id === user.$id

  return (
    <div className="min-h-screen">
      <TopBar />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <Link to="/community" className="btn-text !text-sm">
          ← Back to community
        </Link>

        {editing ? (
          <div className="mt-6 max-w-3xl">
            <PostComposer
              initialPost={post}
              onCreated={() => setEditing(false)}
              onUpdated={handleUpdated}
              onCancelled={() => setEditing(false)}
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[56px_minmax(0,1fr)_260px]">
            <div className="hidden flex-col items-center gap-1 lg:flex">
              <button
                type="button"
                onClick={handleLike}
                disabled={likeBusy}
                aria-pressed={post.liked_by_me}
                aria-label="Like this post"
                title="Like this post"
                className={`rounded-lg p-2 transition-colors disabled:opacity-50 ${
                  post.liked_by_me ? 'text-danger' : 'text-ink-soft hover:text-danger'
                }`}
              >
                <Icon name="arrow-up" size={26} strokeWidth={2.5} />
              </button>
              <span
                className={`text-sm font-black tabular-nums ${
                  post.liked_by_me ? 'text-danger' : 'text-ink'
                }`}
              >
                {post.likes_count || 0}
              </span>
              <button
                type="button"
                aria-label="Downvotes are not supported yet"
                title="Downvotes are not supported yet"
                className="cursor-not-allowed rounded-lg p-2 text-ink-soft opacity-40"
                disabled
              >
                <Icon name="arrow-down" size={26} strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={handleBookmark}
                disabled={bookmarkBusy}
                aria-pressed={post.bookmarked_by_me}
                aria-label="Save post"
                title="Save post"
                className={`mt-4 rounded-lg p-2 transition-colors disabled:opacity-50 ${
                  post.bookmarked_by_me ? 'text-accent-purple' : 'text-ink-soft hover:text-accent-purple'
                }`}
              >
                <Icon name="book-open" size={20} />
              </button>
            </div>

            <div className="min-w-0">
              <article className="card">
                <div className="flex items-center gap-3">
                  <Link to={`/community/users/${post.user_id}`}>
                    <Avatar user={toUserShape(post.author)} size={44} />
                  </Link>
                  <div className="min-w-0">
                    <Link
                      to={`/community/users/${post.user_id}`}
                      className="text-sm font-bold text-ink hover:text-brand-deep hover:underline"
                    >
                      {post.author?.name || 'Community member'}
                    </Link>
                    <p className="text-xs text-ink-soft">{timeAgo(post.created_at)}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-black text-brand-deep">
                      {post.category}
                    </span>
                    {isOwner && (
                      <>
                        <button onClick={() => setEditing(true)} className="btn-text !text-sm">
                          Edit
                        </button>
                        <button onClick={handleDelete} className="btn-text !text-sm text-danger">
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <h1 className="mt-6 text-3xl font-black tracking-tight">{post.title}</h1>

                {post.tags?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span key={tag} className="chip !px-2.5 !py-0.5 !text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-6 whitespace-pre-line text-base leading-relaxed text-ink">
                  {post.content}
                </div>

                <div className="mt-8 flex items-center gap-1 border-t border-line-soft pt-4">
                  <button
                    type="button"
                    onClick={handleLike}
                    disabled={likeBusy}
                    aria-pressed={post.liked_by_me}
                    className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-bold transition-colors disabled:opacity-50 ${
                      post.liked_by_me ? 'text-danger' : 'text-ink-muted hover:text-danger'
                    }`}
                  >
                    <Icon name="heart" size={18} fill={post.liked_by_me} />
                    {post.likes_count || 0} {post.likes_count === 1 ? 'like' : 'likes'}
                  </button>
                  <span className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-bold text-ink-muted">
                    <Icon name="message" size={18} />
                    {post.comments_count || 0}
                  </span>
                  <button
                    type="button"
                    onClick={handleBookmark}
                    disabled={bookmarkBusy}
                    aria-pressed={post.bookmarked_by_me}
                    className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-bold transition-colors ml-auto disabled:opacity-50 ${
                      post.bookmarked_by_me ? 'text-accent-purple' : 'text-ink-muted hover:text-accent-purple'
                    }`}
                  >
                    <Icon name="book-open" size={18} />
                    {post.bookmarked_by_me ? 'Saved' : 'Save post'}
                  </button>
                </div>
              </article>

              <CommentSection postId={post.$id} currentUserId={user.$id} />
            </div>

            <aside className="hidden space-y-4 lg:block">
              <div className="card">
                <h2 className="text-sm font-black tracking-tight text-brand-deep">
                  About the Skill Saarthi Community
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  Share career questions, skill-building tips, internship leads, and success
                  stories with fellow learners. Be kind, stay on topic, and help others grow.
                </p>
                <p className="mt-3 flex items-center gap-2 text-xs font-bold text-ink-muted">
                  <Icon name="users" size={14} />
                  Learn together, grow faster.
                </p>
              </div>

              <div className="card">
                <h2 className="text-sm font-black tracking-tight text-brand-deep">About the author</h2>
                <div className="mt-3 flex items-center gap-3">
                  <Link to={`/community/users/${post.user_id}`}>
                    <Avatar user={toUserShape(post.author)} size={40} />
                  </Link>
                  <div className="min-w-0">
                    <Link
                      to={`/community/users/${post.user_id}`}
                      className="text-sm font-bold text-ink hover:text-brand-deep hover:underline"
                    >
                      {post.author?.name || 'Community member'}
                    </Link>
                    <p className="text-xs text-ink-soft">{post.community_profile?.role || 'Member'}</p>
                  </div>
                </div>
                {post.community_profile?.bio && (
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted line-clamp-3">
                    {post.community_profile.bio}
                  </p>
                )}
                <Link
                  to={`/community/users/${post.user_id}`}
                  className="btn-secondary mt-4 w-full !h-9 !text-xs"
                >
                  View profile
                </Link>
              </div>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default CommunityPostDetail
