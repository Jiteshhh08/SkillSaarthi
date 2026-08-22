const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const WEEKDAYS = ['Mon', '', 'Wed', '', 'Fri', '', '']

function levelClass(level) {
  // Stronger contrast on light card: 0 stays muted, 1-4 step up in brand saturation so green pops
  switch (level) {
    case 0:
      return 'bg-surface-strong border-line-soft'
    case 1:
      return 'bg-[#b8efe1] border-brand/30'
    case 2:
      return 'bg-[#5fdab8] border-brand/40'
    case 3:
      return 'bg-brand border-brand-hover'
    case 4:
      return 'bg-brand-deep border-brand-deep'
    default:
      return 'bg-surface-strong border-line-soft'
  }
}

function formatTooltip(dateStr, count) {
  if (!dateStr) return `${count} contributions`
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return `${dateStr}: ${count} contributions`
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
  const day = d.getUTCDate()
  const mon = months[d.getUTCMonth()]
  const year = d.getUTCFullYear()
  const label = count === 1 ? 'contribution' : 'contributions'
  return `${day} ${mon} ${year} — ${count} ${label}`
}

function monthLabels(days) {
  if (!days?.length) return []
  // Group by month start column
  const labels = []
  let lastMonth = null
  const weeks = Math.ceil(days.length / 7)
  for (let w = 0; w < weeks; w += 1) {
    const idx = w * 7
    const day = days[idx]
    if (!day) continue
    const month = new Date(day.date).getUTCMonth()
    if (month !== lastMonth) {
      lastMonth = month
      labels.push({ week: w, label: MONTHS[month] })
    } else {
      labels.push({ week: w, label: '' })
    }
  }
  return labels
}

export default function ContributionGrid({ days, totalContributions }) {
  if (!days?.length) {
    return (
      <div className="rounded-lg border border-line bg-warm px-4 py-10 text-center text-sm text-ink-muted">
        No contribution data yet.
      </div>
    )
  }

  const labels = monthLabels(days)
  const weeks = Math.ceil(days.length / 7)
  const grid = []
  for (let w = 0; w < weeks; w += 1) {
    const col = []
    for (let r = 0; r < 7; r += 1) {
      const idx = w * 7 + r
      col.push(days[idx] || null)
    }
    grid.push(col)
  }

  // Align month labels exactly above grid columns: label width = cell (w-3=12px) + gap-1, offset = weekday column width (w-8 + pr-2 + gap-1)
  return (
    <div className="overflow-x-auto rounded-lg border border-line-soft bg-warm p-4">
      <div className="min-w-[720px]">
        <div className="flex gap-1" style={{ marginLeft: '44px' }}>
          {labels.map((m, i) => (
            <span key={`${m.label}-${i}`} className="h-3 w-3 shrink-0 text-[10px] font-bold uppercase tracking-wide text-ink-soft">
              {m.label}
            </span>
          ))}
        </div>
        <div className="mt-1 flex gap-1">
          <div className="flex w-8 shrink-0 flex-col gap-1 pr-2 text-right">
            {WEEKDAYS.map((wd, i) => (
              <span key={`${wd}-${i}`} className="flex h-3 items-center justify-end text-[10px] leading-none text-ink-soft">
                {wd}
              </span>
            ))}
          </div>
          <div className="flex gap-1 rounded-md bg-white p-2 shadow-card-rest">
            {grid.map((col, ci) => (
              <div key={`col-${ci}`} className="flex w-3 shrink-0 flex-col gap-1">
                {col.map((day, ri) => {
                  if (!day) return <span key={`empty-${ri}`} className="h-3 w-3" />
                  return (
                    <span
                      key={day.date}
                      title={formatTooltip(day.date, day.count)}
                      className={`h-3 w-3 rounded-sm border shadow-sm ${levelClass(day.level)}`}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-line-soft pt-3 text-xs text-ink-soft">
          <span>{(totalContributions ?? 0).toLocaleString()} contributions in the last year</span>
          <span className="inline-flex items-center gap-1">
            Less
            <span className="inline-flex gap-1">
              {[0, 1, 2, 3, 4].map((lv) => (
                <span key={lv} className={`h-3 w-3 rounded-sm border ${levelClass(lv)}`} />
              ))}
            </span>
            More
          </span>
        </div>
      </div>
    </div>
  )
}
