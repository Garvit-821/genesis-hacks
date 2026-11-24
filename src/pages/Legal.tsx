import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Page } from '../components/layout/Page'
import { PageHero } from '../components/layout/PageHero'
import { ContactLines } from '../components/ui/Bits'
import { useFx } from '../lib/fx'
import legal from '../data/legal.json'

type Part = string | { text: string; href: string }
type Block = { t: 'p'; parts: Part[] } | { t: 'ul'; items: Part[][] } | { t: 'h4'; text: string } | { t: 'table'; caption: string | null; rows: string[][] }

function Parts({ parts }: { parts: Part[] }) {
  return (
    <>
      {parts.map((p, i) => {
        const next = parts[i + 1]
        const gap = typeof next === 'string' && /^[.,;:)]/.test(next) ? '' : ' '
        if (typeof p === 'string') return <span key={i}>{p}{i < parts.length - 1 ? gap : ''}</span>
        const internal = p.href.startsWith('/')
        return (
          <span key={i}>
            {internal ? <Link className="ul" to={p.href}>{p.text}</Link> : <a className="ul" href={p.href}>{p.text}</a>}
            {i < parts.length - 1 ? gap : ''}
          </span>
        )
      })}
    </>
  )
}

export default function Legal({ kind }: { kind: 'privacy' | 'terms' }) {
  const ref = useRef<HTMLDivElement>(null)
  useFx(ref, undefined, [kind])
  const doc = legal[kind]
  return (
    <Page>
      <div ref={ref} key={kind}>
        <PageHero size="l" title={kind === 'privacy' ? 'Privacy\n*policy*' : 'Terms of\n*service*'} lead={doc.lead} />
        <section className="section section--tight">
          <div className="wrap legal">
            <aside className="legal__side" data-lenis-prevent>
              <p className="mono faint">{doc.updated}</p>
              <div className="legal__switch mono">
                <Link to="/privacy" aria-current={kind === 'privacy' ? 'page' : undefined}>Privacy policy</Link>
                <Link to="/terms" aria-current={kind === 'terms' ? 'page' : undefined}>Terms of service</Link>
              </div>
              <p className="mono faint">On this page</p>
              <ol className="legal__toc">
                {doc.toc.map((t) => (
                  <li key={t.id}><a href={`#${t.id}`}><span className="mono faint">{t.n}</span>{t.title}</a></li>
                ))}
              </ol>
              <p className="mono faint">Questions</p>
              <ContactLines className="contact-lines--s" />
            </aside>
            <div className="legal__body">
              {doc.sections.map((s, i) => (
                <section key={s.id} id={s.id} className="legal__sec">
                  <h2 className="display"><span className="mono faint">{String(i + 1).padStart(2, '0')}</span>{s.title}</h2>
                  {(s.blocks as Block[]).map((b, j) => {
                    if (b.t === 'h4') return <h3 key={j}>{b.text}</h3>
                    if (b.t === 'ul') return <ul key={j}>{b.items.map((it, k) => <li key={k}><Parts parts={it} /></li>)}</ul>
                    if (b.t === 'table')
                      return (
                        <div key={j} className="legal__table" data-lenis-prevent>
                          <table>
                            {b.caption && <caption className="mono">{b.caption}</caption>}
                            <thead><tr>{b.rows[0].map((c) => <th key={c} scope="col">{c}</th>)}</tr></thead>
                            <tbody>{b.rows.slice(1).map((r, k) => <tr key={k}>{r.map((c, m) => <td key={m}>{c}</td>)}</tr>)}</tbody>
                          </table>
                        </div>
                      )
                    return <p key={j}><Parts parts={b.parts} /></p>
                  })}
                </section>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Page>
  )
}
