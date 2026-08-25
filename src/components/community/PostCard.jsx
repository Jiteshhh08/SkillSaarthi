import { memo, useState } from 'react'
import { Link } from 'react-router-dom'
import Avatar from './Avatar'
import Icon from '../common/Icon'
import { timeAgo } from '../../services/notifications'

function toUserShape(author) {
  if (!author) return null
  return { name: author.name, prefs: { avatar_file_id: author.avatar_file_id || '' } }
}

function PostCard({ post, onLike, onBookmark, onDelete, onEdit }) {
  const [likeBusy, setLikeBusy] = useState(false)
  const [bookmarkBusy, setBookmarkBusy] = useState(false)

  const handleLike = async () => {
    if (likeBusy) return
    setLikeBusy(true)
    try {
      await onLike?.(post)
    } finally {
      setLikeBusy(false)
    }
  }
  const handleBookmark = async () => {
    if (bookmarkBusy) return
    setBookmarkBusy(true)
    try {
      await onBookmark?.(post)
    } finally {
      setBookmarkBusy(false)
    }
  }
  const excerpt = (post.content || '').length > 280
    ? `${post.content.slice(0, 280)}…`
    : post.content

  return (
    <article className="card flex flex-col">
      <div className="flex items-center gap-3">
        <Link to={`/community/users/${post.user_id}`} aria-label={`View ${post.author?.name || 'author'} profile`}>
          <Avatar user={toUserShape(post.author)} size={40} />
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
        <span className="ml-auto rounded-full bg-brand-soft px-3 py-1 text-xs font-black text-brand-deep">
          {post.category}
        </span>
      </div>

      <Link to={`/community/posts/${post.$id}`} className="mt-4 block">
        <h3 className="text-lg font-bold text-ink hover:text-brand-deep hover:underline">
          {post.title}
        </h3>
      </Link>
      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-muted">{excerpt}</p>

      {post.tags?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span key={tag} className="chip !px-2.5 !py-0.5 !text-xs">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-5 flex items-center gap-1 border-t border-line-soft pt-4">
        <button
          type="button"
          onClick={handleLike}
          disabled={likeBusy}
          aria-pressed={post.liked_by_me}
          className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-bold transition-colors disabled:opacity-50 ${
            post.liked_by_me ? 'text-danger' : 'text-ink-muted hover:text-danger'
          }`}
        >
          <Icon name="heart" size={16} fill={post.liked_by_me} />
          {post.likes_count || 0}
        </button>

        <Link
          to={`/community/posts/${post.$id}`}
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-bold text-ink-muted transition-colors hover:text-brand-deep"
        >
          <Icon name="message" size={16} />
          {post.comments_count || 0}
        </Link>

        <button
          type="button"
          onClick={handleBookmark}
          disabled={bookmarkBusy}
          aria-pressed={post.bookmarked_by_me}
          className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-bold transition-colors ml-auto disabled:opacity-50 ${
            post.bookmarked_by_me ? 'text-accent-purple' : 'text-ink-muted hover:text-accent-purple'
          }`}
        >
          <Icon name="book-open" size={16} />
          {post.bookmarked_by_me ? 'Saved' : 'Save'}
        </button>

        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(post)}
            aria-label="Edit post"
            className="inline-flex items-center rounded-md px-2 py-1.5 text-sm font-bold text-ink-muted transition-colors hover:text-brand-deep"
          >
            <Icon name="gear" size={16} />
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(post)}
            aria-label="Delete post"
            className="inline-flex items-center rounded-md px-2 py-1.5 text-sm font-bold text-ink-muted transition-colors hover:text-danger"
          >
            <Icon name="trash" size={16} />
          </button>
        )}
      </div>
    </article>
  )
}

export default memo(PostCard)