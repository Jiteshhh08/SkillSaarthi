import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  createInternship,
  deleteInternship,
  getAdminInternships,
  sendNotification,
  updateInternship,
} from '../../services/admin'
import { useAdmin } from '../../hooks/useAdmin'
import TopBar from '../../components/layout/TopBar'
import Footer from '../../components/layout/Footer'

function NotificationForm() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', message: '', email: '' })
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const update = (key) => (event) => setForm((f) => ({ ...f, [key]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    setSending(true)
    setError('')
    setNotice('')
    try {
      const payload = { title: form.title.trim(), message: form.message.trim() }
      if (form.email.trim()) payload.email = form.email.trim()
      const result = await sendNotification(payload)
      setNotice(
        form.email.trim()
          ? `Notification sent to ${form.email.trim()}.`
          : `Notification broadcast to ${result.sent} user(s).`,
      )
      setForm({ title: '', message: '', email: '' })
      setOpen(false)
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not send the notification.')
    } finally {
      setSending(false)
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-secondary !h-10 !px-4 !text-sm">
        📢 Send notification
      </button>
    )
  }

  return (
    <form onSubmit={submit} className="card grid gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-black">Send a notification</h2>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm font-bold text-ink-muted hover:text-ink"
        >
          Close
        </button>
      </div>
      <p className="text-sm text-ink-muted">
        Leave the recipient blank to broadcast to all users, or enter a specific user's
        <strong> email</strong> (e.g. <code>user1@user1.com</code>) to notify just that one person.
      </p>
      <label className="block text-sm font-bold text-ink">
        Title *
        <input
          value={form.title}
          onChange={update('title')}
          required
          maxLength={300}
          className="input-base mt-1"
          placeholder="e.g. New internships available"
        />
      </label>
      <label className="block text-sm font-bold text-ink">
        Message
        <textarea
          value={form.message}
          onChange={update('message')}
          rows={3}
          className="input-base mt-1 resize-y"
          placeholder="Optional short detail…"
        />
      </label>
      <label className="block text-sm font-bold text-ink">
        Recipient email (blank = all users)
        <input
          value={form.email}
          onChange={update('email')}
          type="email"
          className="input-base mt-1"
          placeholder="user1@user1.com"
        />
      </label>
      {error && <p className="text-sm font-bold text-danger">{error}</p>}
      {notice && <p className="text-sm font-bold text-success">{notice}</p>}
      <div>
        <button type="submit" disabled={sending} className="btn-primary !h-10 !px-4 !text-sm disabled:opacity-50">
          {sending ? 'Sending…' : 'Send notification'}
        </button>
      </div>
    </form>
  )
}

const STATUS_BADGES = {
  pending: 'bg-warning-soft text-warning',
  active: 'bg-success-soft text-success',
  rejected: 'bg-danger-soft text-danger',
}

const STATUS_LABELS = { pending: 'Pending', active: 'Active', rejected: 'Rejected' }

const FILTERS = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'active', label: 'Active' },
  { key: 'rejected', label: 'Rejected' },
]

function InternshipRow({ internship, onAction, busy }) {
  const action = (target, label) => (
    <button
      onClick={() => onAction(internship.$id, target)}
      disabled={busy}
      className="btn-secondary !h-9 !px-3 !text-xs"
    >
      {label}
    </button>
  )

  return (
    <article className="card flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-bold text-ink">{internship.title}</h3>
          <p className="text-sm font-bold text-ink-muted">
            {internship.company}
            {internship.location ? ` · ${internship.location}` : ''}
            {internship.source ? ` · via ${internship.source}` : ''}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-black ${STATUS_BADGES[internship.status] || 'bg-surface-strong text-ink-muted'}`}>
          {STATUS_LABELS[internship.status] || internship.status}
        </span>
      </div>

      {internship.description && (
        <p className="text-sm leading-relaxed text-ink-muted line-clamp-2">{internship.description}</p>
      )}

      {internship.skills?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {internship.skills.map((skill) => (
            <span key={skill} className="chip !px-2.5 !py-0.5 !text-xs">{skill}</span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {internship.status === 'pending' && (
          <>
            {action('active', 'Approve')}
            {action('rejected', 'Reject')}
          </>
        )}
        {internship.status === 'active' && action('pending', 'Set pending')}
        {internship.status === 'rejected' && action('pending', 'Restore')}
        {action('delete', 'Delete')}
      </div>

      <p className="text-xs text-ink-soft">
        {internship.expires_at
          ? `Expires ${new Date(internship.expires_at).toLocaleDateString()}`
          : 'No expiry set'}
        {internship.eligibility ? ` · ${internship.eligibility}` : ''}
      </p>
    </article>
  )
}

function AddForm({ onAdded }) {
  const [open, setOpen] = useState(false)
  const defaultExpiry = () => {
    const date = new Date(Date.now() + 30 * 86400000)
    return date.toISOString().slice(0, 10)
  }
  const [form, setForm] = useState({
    title: '',
    company: '',
    location: '',
    url: '',
    description: '',
    eligibility: '',
    skills: '',
    expires_at: defaultExpiry(),
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const update = (key) => (event) => setForm((f) => ({ ...f, [key]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await createInternship(form)
      setForm({
        title: '',
        company: '',
        location: '',
        url: '',
        description: '',
        eligibility: '',
        skills: '',
        expires_at: defaultExpiry(),
      })
      setOpen(false)
      onAdded()
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not add the internship.')
    } finally {
      setSaving(false)
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary !h-10 !px-4 !text-sm">
        + Add internship
      </button>
    )
  }

  return (
    <form onSubmit={submit} className="card grid gap-3 sm:grid-cols-2">
      <label className="block text-sm font-bold text-ink sm:col-span-2">
        Title *
        <input value={form.title} onChange={update('title')} required className="input-base mt-1" placeholder="e.g. Frontend Engineering Intern" />
      </label>
      <label className="block text-sm font-bold text-ink">
        Company
        <input value={form.company} onChange={update('company')} className="input-base mt-1" placeholder="e.g. Airbnb" />
      </label>
      <label className="block text-sm font-bold text-ink">
        Location
        <input value={form.location} onChange={update('location')} className="input-base mt-1" placeholder="e.g. Remote" />
      </label>
      <label className="block text-sm font-bold text-ink sm:col-span-2">
        URL
        <input type="url" value={form.url} onChange={update('url')} className="input-base mt-1" placeholder="https://…" />
      </label>
      <label className="block text-sm font-bold text-ink sm:col-span-2">
        Description
        <textarea
          value={form.description}
          onChange={update('description')}
          rows={4}
          className="input-base mt-1 resize-y"
          placeholder="Role overview, day-to-day work, what the intern will learn…"
        />
      </label>
      <label className="block text-sm font-bold text-ink">
        Skills (comma separated)
        <input value={form.skills} onChange={update('skills')} className="input-base mt-1" placeholder="React, Node.js, SQL" />
      </label>
      <label className="block text-sm font-bold text-ink">
        Expires
        <input type="date" value={form.expires_at} onChange={update('expires_at')} className="input-base mt-1" />
      </label>
      <label className="block text-sm font-bold text-ink sm:col-span-2">
        Eligibility
        <input value={form.eligibility} onChange={update('eligibility')} className="input-base mt-1" placeholder="Open to undergraduate students…" />
      </label>

      {error && <p className="text-sm font-bold text-danger sm:col-span-2">{error}</p>}

      <div className="flex items-center gap-3 sm:col-span-2">
        <button type="submit" disabled={saving} className="btn-primary !h-10 !px-4 !text-sm disabled:opacity-50">
          {saving ? 'Saving…' : 'Save as pending'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn-secondary !h-10 !px-4 !text-sm">
          Cancel
        </button>
      </div>
    </form>
  )
}

function AdminInternships() {
  const { isAdmin, loading } = useAdmin()
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [allInternships, setAllInternships] = useState([])
  const [pageLoading, setPageLoading] = useState(true)
  const [busyId, setBusyId] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    setPageLoading(true)
    setError('')
    try {
      const data = await getAdminInternships()
      setAllInternships(data.internships || [])
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not load internships.')
    } finally {
      setPageLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAdmin) load()
  }, [isAdmin, load])

  const runAction = async (id, target) => {
    setBusyId(id)
    setNotice('')
    setError('')
    try {
      if (target === 'delete') {
        await deleteInternship(id)
      } else {
        await updateInternship(id, { status: target })
      }
      setBusyId('')
      setNotice(target === 'delete' ? 'Deleted.' : `Moved to “${STATUS_LABELS[target] || target}”.`)
      load()
    } catch (err) {
      setBusyId('')
      setError(err?.response?.data?.message || 'Action failed.')
    }
  }

  const counts = useMemo(() => {
    return allInternships.reduce((acc, item) => {
      const status = item.status || 'active'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})
  }, [allInternships])

  const visibleInternships = useMemo(() => {
    const query = search.trim().toLowerCase()
    return allInternships.filter((item) => {
      if (statusFilter && (item.status || 'active') !== statusFilter) return false
      if (!query) return true
      return `${item.title} ${item.company || ''} ${item.location || ''} ${item.description || ''} ${(item.skills || []).join(' ')}`
        .toLowerCase()
        .includes(query)
    })
  }, [allInternships, statusFilter, search])

  if (loading) {
    return (
      <div className="min-h-screen">
        <TopBar />
        <main className="mx-auto max-w-7xl px-6 py-10 text-ink-muted">Checking access…</main>
        <Footer />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen">
        <TopBar />
        <main className="mx-auto max-w-7xl px-6 py-10">
          <h1 className="text-2xl font-black tracking-tight">Admin</h1>
          <p className="mt-2 rounded-lg border border-danger-soft bg-danger-soft px-4 py-3 text-sm font-bold text-danger">
            Admin access required. Your account is not in the admin list — contact the project owner.
          </p>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <TopBar />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.08em]">Admin</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">Internship approvals</h1>
            <p className="mt-2 max-w-2xl text-lg text-ink-muted">
              Approve, reject, or remove internship listings. Openings collected by the daily
              importer arrive as <strong>Pending</strong> and only appear on the public site once
              approved.
            </p>
          </div>
          <AddForm onAdded={load} />
        </div>

        {notice && (
          <div className="mt-6 rounded-lg border border-success-soft bg-success-soft px-4 py-3 text-sm font-bold text-success">
            {notice}
          </div>
        )}
        {error && (
          <div className="mt-6 rounded-lg border border-danger-soft bg-danger-soft px-4 py-3 text-sm font-bold text-danger">
            {error}
          </div>
        )}

        <div className="mt-8">
          <NotificationForm />
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-2">
          {FILTERS.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setStatusFilter(filter.key)}
              className={`rounded-full px-4 py-1.5 text-sm font-bold ${
                statusFilter === filter.key
                  ? 'bg-brand text-white'
                  : 'border border-line bg-white text-ink hover:bg-surface-soft'
              }`}
            >
              {filter.label}
              {filter.key ? ` (${counts[filter.key] || 0})` : ` (${allInternships.length})`}
            </button>
          ))}
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search title, company…"
            className="input-base ml-auto sm:w-72"
          />
        </div>

        {pageLoading ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="card h-44 animate-pulse bg-warm" />
            ))}
          </div>
        ) : allInternships.length === 0 ? (
          <p className="mt-6 rounded-lg border border-line bg-white px-4 py-8 text-center text-sm text-ink-muted">
            Nothing here yet. Run <code>node scripts/import-internships.mjs</code> to pull new openings.
          </p>
        ) : visibleInternships.length > 0 ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {visibleInternships.map((internship) => (
              <InternshipRow
                key={internship.$id}
                internship={internship}
                onAction={runAction}
                busy={busyId === internship.$id}
              />
            ))}
          </div>
        ) : (
          <p className="mt-6 rounded-lg border border-line bg-white px-4 py-8 text-center text-sm text-ink-muted">
            No listings match this filter or search.
          </p>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default AdminInternships