import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Page } from '../../components/layout/Page'
import { PageHero } from '../../components/layout/PageHero'
import { NextUp } from '../../components/ui/Bits'
import { useFx } from '../../lib/fx'
import guide from '../../data/guide.json'
import NotFound from '../NotFound'

type Article = (typeof guide.articles)[number]
type Section = { id: string; title: string; text?: string; callout?: { type: string; title: string; text: string }; checklist?: Array<{ id: string; text: string }> }
const hrefOf = (a: Article) => (a.categoryId === 'introduction' && a.slug === 'overview' ? '/guide' : `/guide/${a.categoryId}/${a.slug}`)
const ORDERED: Article[] = guide.categories.flatMap((c) => c.articles.map((s) => guide.articles.find((a) => a.categoryId === c.id && a.slug === s)!))

function Body({ text }: { text: string }) {
  const lines = text.split('\n').filter(Boolean)
  if (lines.length === 1) return <p>{text}</p>
  if (lines.every((l) => /^\d+\.\s/.test(l))) return <ol className="garticle__ol">{lines.map((l) => <li key={l}>{l.replace(/^\d+\.\s/, '')}</li>)}</ol>
  return <ul className="garticle__ul">{lines.map((l) => <li key={l}>{l.replace(/^-\s/, '')}</li>)}</ul>
}

function Checklist({ scope, items }: { scope: string; items: Array<{ id: string; text: string }> }) {
  const key = `gh-guide:${scope}`
  const [done, setDone] = useState<string[]>([])
  useEffect(() => {
    try { setDone(JSON.parse(localStorage.getItem(key) || '[]')) } catch { /* storage blocked */ }
  }, [key])
  const toggle = (id: string) => {
    const next = done.includes(id) ? done.filter((x) => x !== id) : [...done, id]
    setDone(next)
    try { localStorage.setItem(key, JSON.stringify(next)) } catch { /* storage blocked */ }
  }
  return (
    <fieldset className="checklist">
      <legend className="mono">Checklist · {done.length}/{items.length}</legend>
      {items.map((it) => (
        <label key={it.id} className={done.includes(it.id) ? 'is-done' : ''}>
          <input type="checkbox" checked={done.includes(it.id)} onChange={() => toggle(it.id)} />
          <span className="checklist__box" aria-hidden="true" />
          <span>{it.text}</span>
        </label>
      ))}
    </fieldset>
  )
}

export default function Guide() {
  const { category, slug } = useParams()
  const ref = useRef<HTMLDivElement>(null)
  const [q, setQ] = useState('')
  const search = useRef<HTMLInputElement>(null)
  const article = category ? ORDERED.find((a) => a.categoryId === category && a.slug === slug) : ORDERED[0]
  useFx(ref, undefined, [article?.slug])

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); search.current?.focus() }
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [])

  const hits = useMemo(() => {
    const n = q.trim().toLowerCase()
    if (!n) return null
    return ORDERED.filter((a) => JSON.stringify([a.title, a.desc, a.content]).toLowerCase().includes(n))
  }, [q])

  if (!article) return <NotFound />
  const i = ORDERED.indexOf(article)
  const prev = ORDERED[i - 1]
  const next = ORDERED[i + 1]
  const sections = article.content.sections as Section[]

  return (
    <Page>
      <div ref={ref} key={article.categoryId + article.slug}>
        <PageHero size="m" eyebrow={`Organiser guide · ${article.categoryTitle}`} title={article.title} lead={article.content.subtitle} />
        <section className="section section--tight guide">
          <div className="wrap guide__grid">
            <nav className="guide__nav" aria-label="Guide contents" data-lenis-prevent>
              <label className="search">
                <span className="sr-only">Search the guide</span>
                <input ref={search} type="search" placeholder="Search the guide  ⌘K" value={q} onChange={(e) => setQ(e.target.value)} />
              </label>
              {hits ? (
                <ul className="guide__hits">
                  {hits.map((a) => (
                    <li key={hrefOf(a)}><Link to={hrefOf(a)} onClick={() => setQ('')}>{a.title}<span className="mono faint">{a.categoryTitle}</span></Link></li>
                  ))}
                  {!hits.length && <li className="muted">No articles match.</li>}
                </ul>
              ) : (
                guide.categories.map((c) => (
                  <details key={c.id} open={c.id === article.categoryId}>
                    <summary className="mono">{c.title}</summary>
                    <ul>
                      {c.articles.map((s) => {
                        const a = ORDERED.find((x) => x.categoryId === c.id && x.slug === s)!
                        return (
                          <li key={s}>
                            <Link to={hrefOf(a)} aria-current={a === article ? 'page' : undefined}>{('navTitle' in a && a.navTitle) || a.title}</Link>
                          </li>
                        )
                      })}
                    </ul>
                  </details>
                ))
              )}
            </nav>
            <article className="garticle">
              <p className="mono faint garticle__meta">Updated {article.lastUpdated} · {article.readTime} · Structure adapted from the <a className="ul" href="https://guide.mlh.io" target="_blank" rel="noopener noreferrer">MLH Hackathon Organizer Guide</a></p>
              <p className="garticle__hero" data-fx="lines">{article.content.heroText}</p>
              {sections.map((s) => (
                <section key={s.id} id={s.id} className="garticle__sec" data-fx="fade">
                  <h2 className="display">{s.title}</h2>
                  {s.text && <Body text={s.text} />}
                  {s.callout && (
                    <aside className={`callout callout--${s.callout.type}`}>
                      <strong className="mono">{s.callout.title}</strong>
                      <p>{s.callout.text}</p>
                    </aside>
                  )}
                  {s.checklist && <Checklist scope={`${article.slug}:${s.id}`} items={s.checklist} />}
                </section>
              ))}
              <p className="muted">Something missing or wrong? <a className="ul" href="mailto:partner@genesishacks.com">Email partner@genesishacks.com</a>.</p>
              <div className="garticle__pager">
                {prev ? <Link to={hrefOf(prev)} className="pager"><span className="mono faint">← Previous</span><span className="display">{prev.title}</span></Link> : <span />}
                {next ? <Link to={hrefOf(next)} className="pager pager--next"><span className="mono faint">Next →</span><span className="display">{next.title}</span></Link> : <span />}
              </div>
            </article>
            <aside className="guide__toc">
              <p className="mono faint">On this page</p>
              <ul>
                {sections.map((s) => (
                  <li key={s.id}><a href={`#${s.id}`}>{s.title}</a></li>
                ))}
              </ul>
            </aside>
          </div>
        </section>
        <NextUp to="/collaborate" kicker="Running a hackathon?" title="Bring Genesis in" meta="We help with sponsors, judges and mentors" />
      </div>
    </Page>
  )
}
