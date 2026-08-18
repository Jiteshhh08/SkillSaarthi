import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import TopBar from '../../components/layout/TopBar'
import Footer from '../../components/layout/Footer'
import Avatar from '../../components/community/Avatar'
import PostCard from '../../components/community/PostCard'
import ProfileEditor from '../../components/community/ProfileEditor'
import Icon from '../../components/common/Icon'
import { useAuth } from '../../hooks/useAuth'
import {
  getUserProfile,
  toggleBookmark,
  toggleLike,
} from '../../services/community'

function toUserShape(user) {
  if (!user) return null
  return { name: user.name, prefs: { avatar_file_id: (user && user.avatar_file_id) || '' } }
}

function CommunityUserProfile() {
  const { userId } = useParams()
  const { user: currentUser } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingProfile, setEditingProfile] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await getUserProfile(userId)
      setData(result)
    } catch {
      setData(null)
      setError('This profile could not be found.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setEditingProfile(false)
    load()
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  const isMine = currentUser?.$id === userId

  const handleLike = async (post) => {
    const result = await toggleLike(post.$id)
    setData((prev) => ({
      ...prev,
      posts: (prev?.posts || []).map((item) =>
        item.$id === post.$id ? { ...item, liked_by_me: result.liked, likes_count: result.likes_count } : item,
      ),
    }))
  }

  const handleBookmark = async (post) => {
    const result = await toggleBookmark(post.$id)
    setData((prev) => ({
      ...prev,
      posts: (prev?.posts || []).map((item) =>
        item.$id === post.$id ? { ...item, bookmarked_by_me: result.bookmarked } : item,
      ),
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <TopBar />
        <main className="mx-auto max-w-7xl px-6 py-10">
          <div className="card h-64 animate-pulse bg-warm" />
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen">
        <TopBar />
        <main className="mx-auto max-w-7xl px-6 py-10">
          <div className="card p-10 text-center">
            <Icon name="users" size={40} className="mx-auto text-ink-soft" />
            <p className="mt-4 text-2xl font-black tracking-tight">Profile unavailable</p>
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

  const { user, profile, posts } = data

  return (
    <div className="min-h-screen">
      <TopBar />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <Link to="/community" className="btn-text !text-sm">
          ← Back to community
        </Link>

        <div className="card mt-6">
          <div className="flex flex-wrap items-center gap-4">
            <Avatar user={toUserShape(user)} size={80} className="!text-3xl" />
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-black tracking-tight">{user?.name || 'Community member'}</h1>
              {profile?.location || profile?.role ? (
                <p className="mt-1 text-sm font-bold text-ink-muted">
                  {[profile.role, profile.location].filter(Boolean).join(' · ')}
                </p>
              ) : null}
            </div>
            {isMine && (
              <button onClick={() => setEditingProfile((open) => !open)} className="btn-secondary !h-10 !px-4 !text-sm">
                {editingProfile ? 'Done' : 'Edit my profile'}
              </button>
            )}
          </div>

          {profile?.bio && !editingProfile && (
            <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-ink">{profile.bio}</p>
          )}

          {profile?.interests?.length > 0 && !editingProfile && (
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.interests.map((interest) => (
                <span key={interest} className="chip !px-2.5 !py-0.5 !text-xs">
                  {interest}
                </span>
              ))}
            </div>
          )}
        </div>

        {isMine && editingProfile && (
          <div className="mt-6">
            <ProfileEditor
              initialProfile={profile}
              onSaved={() => {
                setEditingProfile(false)
                load()
              }}
            />
          </div>
        )}

        <div className="mt-10 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {isMine ? 'My posts' : `${user?.name?.split(' ')[0] || 'Their'} posts`}
            </h2>
            <p className="mt-1 text-sm text-ink-muted">{posts.length} published post{posts.length === 1 ? '' : 's'}</p>
          </div>
        </div>

        {posts.length > 0 ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {posts.map((post) => (
              <PostCard key={post.$id} post={post} onLike={handleLike} onBookmark={handleBookmark} />
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-lg border border-line bg-white px-4 py-8 text-center text-sm text-ink-muted">
            {isMine ? 'You have not published any posts yet.' : 'No published posts yet.'}
          </p>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default CommunityUserProfile