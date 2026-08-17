import { useState } from 'react'
import { createPost, POST_CATEGORIES } from '../../services/community'

export default function PostComposer({ onCreated, onCancelled, initialPost, onUpdated }) {
  const editing = Boolean(initialPost)
  const [title, setTitle] = useState(initialPost?.title || '')
  const [category, setCategory] = useState(initialPost?.category || POST_CATEGORIES[0])
  const [tags, setTags] = useState(initialPost?.tags?.join(', ') || '')
  const [content, setContent] = useState(initialPost?.content || '')
  const [status, setStatus] = useState(initialPost?.status || 'published')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    const tagList = tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)

    if (!title.trim()) {
      setError('Give your post a title.')
      return
    }
    if (!content.trim()) {
      setError('Write the body of your post.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      const input = { title: title.trim(), content: content.trim(), category, tags: tagList, status }
      if (editing) {
        await onUpdated?.({ ...initialPost, ...input })
      } else {
        await createPost(input)
      }
      onCreated?.()
    } catch {
      setError('Could not save your post. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card" noValidate>
      <h2 className="text-xl font-bold tracking-tight">{editing ? 'Edit post' : 'Write a post'}</h2>
      <p className="mt-1 text-sm text-ink-muted">
        Share knowledge, ask a question, or offer encouragement.
      </p>

      <label className="mt-5 block">
        <span className="mb-1.5 block text-sm font-bold text-ink">Title</span>
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="A clear, useful title"
          className="input-base"
          maxLength={300}
        />
      </label>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-bold text-ink">Category</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="input-base"
          >
            {POST_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-bold text-ink">Tags</span>
          <input
            type="text"
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="react, interview, resume"
            className="input-base"
          />
          <span className="mt-1 block text-xs text-ink-soft">Comma-separated, up to 8 tags</span>
        </label>
      </div>

      <label className="mt-4 block">
        <span className="mb-1.5 block text-sm font-bold text-ink">Content</span>
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="What would you like to share?"
          rows={7}
          className="input-base h-auto resize-y !py-3"
          maxLength={20000}
        />
      </label>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm font-bold text-ink">
          <input
            type="radio"
            name="status"
            checked={status === 'published'}
            onChange={() => setStatus('published')}
            className="h-4 w-4 accent-brand"
          />
          Publish now
        </label>
        <label className="flex items-center gap-2 text-sm font-bold text-ink">
          <input
            type="radio"
            name="status"
            checked={status === 'draft'}
            onChange={() => setStatus('draft')}
            className="h-4 w-4 accent-brand"
          />
          Save as draft
        </label>

        {error && <p className="field-error">{error}</p>}

        <div className="ml-auto flex items-center gap-3">
          <button type="button" onClick={onCancelled} className="btn-text !text-sm">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn-primary !h-10 !px-4 !text-sm">
            {submitting ? 'Saving…' : editing ? 'Save changes' : 'Publish'}
          </button>
        </div>
      </div>
    </form>
  )
}