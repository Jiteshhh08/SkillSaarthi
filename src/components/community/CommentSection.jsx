import { useEffect, useState } from 'react'
import Avatar from './Avatar'
import { timeAgo } from '../../services/notifications'
import { addComment, deleteComment, getComments, updateComment } from '../../services/community'

function toUserShape(author) {
  if (!author) return null
  return { name: author.name, prefs: { avatar_file_id: author.avatar_file_id || '' } }
}

export default function CommentSection({ postId, currentUserId, onCountChange }) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editingContent, setEditingContent] = useState('')
  const [formError, setFormError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const rows = await getComments(postId)
      setComments(rows)
      onCountChange?.(rows.length)
    } catch {
      setError('Could not load comments. Please try again shortly.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [postId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (event) => {
    event.preventDefault()
    const text = content.trim()
    if (!text) {
      setFormError('Write a comment before posting.')
      return
    }
    setSubmitting(true)
    setFormError('')
    try {
      const created = await addComment(postId, text)
      setComments((prev) => [...prev, created])
      setContent('')
      onCountChange?.(comments.length + 1)
    } catch {
      setFormError('Could not post your comment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async (commentId) => {
    const text = editingContent.trim()
    if (!text) return
    try {
      const updated = await updateComment(commentId, text)
      setComments((prev) => prev.map((comment) => (comment.$id === commentId ? { ...comment, content: updated.content } : comment)))
      setEditingId(null)
      setEditingContent('')
    } catch {
      // best-effort: keep the list intact
    }
  }

  const handleDelete = async (commentId) => {
    try {
      await deleteComment(commentId)
      setComments((prev) => prev.filter((comment) => comment.$id !== commentId))
      onCountChange?.(Math.max(0, comments.length - 1))
    } catch {
      // best-effort
    }
  }

  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold tracking-tight">
        Comments <span className="text-sm font-bold text-ink-muted">({comments.length})</span>
      </h2>

      <form onSubmit={handleSubmit} className="mt-4" noValidate>
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Share your thoughts or ask a question…"
          rows={3}
          className="input-base h-auto resize-y !py-3"
          maxLength={4000}
        />
        {formError && <p className="field-error">{formError}</p>}
        <div className="mt-3 flex justify-end">
          <button type="submit" disabled={submitting} className="btn-primary !h-10 !px-4 !text-sm">
            {submitting ? 'Posting…' : 'Post comment'}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 rounded-lg border border-danger-soft bg-danger-soft px-4 py-3 text-sm font-bold text-danger">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-5 space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="card animate-pulse bg-warm !p-4" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="mt-5 rounded-lg border border-line bg-white px-4 py-8 text-center text-sm text-ink-muted">
          No comments yet — be the first to reply.
        </p>
      ) : (
        <ul className="mt-5 space-y-3">
          {comments.map((comment) => (
            <li key={comment.$id} className="card !p-4">
              <div className="flex items-start gap-3">
                <div className="flex items-center gap-3">
                  <Avatar user={toUserShape(comment.author)} size={32} />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-ink">{comment.author?.name || 'Community member'}</p>
                    <p className="text-xs text-ink-soft">{timeAgo(comment.created_at)}</p>
                  </div>
                </div>
                {comment.user_id === currentUserId && (
                  <div className="ml-auto flex items-center gap-1">
                    {editingId === comment.$id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleEdit(comment.$id)}
                          className="btn-text !px-2 !py-1 !text-xs"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(null)
                            setEditingContent('')
                          }}
                          className="btn-text !px-2 !py-1 !text-xs text-ink-muted"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(comment.$id)
                            setEditingContent(comment.content)
                          }}
                          className="btn-text !px-2 !py-1 !text-xs"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(comment.$id)}
                          className="btn-text !px-2 !py-1 !text-xs text-danger"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
              {editingId === comment.$id ? (
                <textarea
                  value={editingContent}
                  onChange={(event) => setEditingContent(event.target.value)}
                  rows={2}
                  className="input-base mt-3 h-auto resize-y !py-3"
                  maxLength={4000}
                />
              ) : (
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink">
                  {comment.content}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}