import { useState, useEffect, useRef, useCallback, useMemo } from 'react'

const BASE = import.meta.env.BASE_URL
const BG_SRC = BASE + 'audio/fun-background.mp3'
const SONG_SRC = BASE + 'audio/tum-jiyo-hazaron-saal.mp3'
// Set to e.g. BASE + 'hritik.png' to replace the cartoon everywhere.
const CUSTOM_AVATAR = BASE + 'hritik-cartoon.png'
// Edit the letter here.
// ====== THE LETTER: edit the text here ======
const DEFAULT_LETTER = {
  greeting: 'Hi Prachi Sunnysideup! ☀️',
  paragraphs: [
    'Bhagwan teri har wish poori kare, aur aaj ka poora din bahut special ho. Khoob maje kar! 🥳',
    'Tune toh mera poora office adventure bana diya 😁😂 Tujhse bahut kuch seekhne ko mila, aur teri company aur teri vibe ke saath bahut maza aaya. Teri friendship ke liye thank you.',
    'Ek well-wisher ki taraf se bas itna: life mein jo bhi achieve karna chahti hai, woh sab kar. Aur kabhi koi problem aaye toh bina kuch soche-samjhe bol dena.',
    'Zyada kuch mat soch, chill kar. Jo hoga, dekh lenge. Aur agar paise zyada ho jaayein, toh is garib ko kabhi milke ek party de dena 😁😂',
    'Aur kabhi badalna mat. Jaisi office mein thi, aur abhi hai waisi hi rehna.',
    'Enjoy your day, God bless you, aur jitna chahe utna paisa kama 💸😂🥳',
  ],
  quote: 'Famous quote by Salmon bhai: “Do whatever you want to do man, don’t trouble your mata and pita.”',
  closing: 'With best wishes,',
  name: 'Hritik',
}
const LETTER = (typeof window !== 'undefined' && window.__LETTER__) || DEFAULT_LETTER
// Photos go in public/photos/ as memory-01 ... memory-08 (jpg, jpeg, png or webp). Edit the captions here.
const PHOTO_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'JPG', 'JPEG', 'PNG']
const CAPTIONS = ['Biryani Birthday at the Canteen', 'Same Meet, Same Vibes', 'Movie Night on Meet', 'Word Guessing Night', 'Debugging Together', 'MedAssist Late Nights', 'Leave Plan Laughs', '1 Year, Same Journey']
// The "# ..." line shown under each photo caption (same order as the photos). Edit freely.
const TAGS = [
  'college canteen biryani birthday treat',
  'same meet, different places, same vibes',
  'office time movie on meet',
  'chill and guess word in office time',
  'ignition bugs fixed together on meet',
  'medassist ai coding, chai and good vibes',
  'leave plan discussion and lots of laughs',
  '1 year work anniversary, same company same journey',
]
const photoSrc = (n, e) => `${BASE}photos/memory-0${n}.${PHOTO_EXTS[e]}`
const PRANK = [
  ['NO NO NO!', 'Birthday website bina music ke? Aisa kaise ho sakta hai!'],
  ['ARE YOU SURE?!', 'Music ke bina toh 50% masti missing hai!'],
  ['GALAT OPTION, MADAM JI!', 'Birthday vibes ke liye music choose karo!'],
]

/* ---------- smooth audio: nothing starts or stops abruptly ---------- */
function fadeTo(a, target, ms, done) {
  if (!a) return
  clearInterval(a.__fade)
  const from = a.volume, steps = Math.max(1, Math.round(ms / 50))
  let i = 0
  a.__fade = setInterval(() => {
    i++
    a.volume = Math.min(1, Math.max(0, from + (target - from) * (i / steps)))
    if (i >= steps) { clearInterval(a.__fade); if (done) done() }
  }, 50)
}
function playWithFade(a, target, ms) {
  a.volume = 0
  return a.play().then(() => fadeTo(a, target, ms))
}
function stopAudio(a) { if (a) { clearInterval(a.__fade); a.pause() } }

/* ---------- small reusable pieces ---------- */
function Hritik({ pose = 'popper', size = 200 }) {
  if (CUSTOM_AVATAR) return <img className="avatar bob" src={CUSTOM_AVATAR} width={size} alt="Hritik cartoon" />
  return (
    <svg className="avatar bob" width={size} height={size} viewBox="0 0 200 220" role="img" aria-label="Hritik cartoon with party hat">
      <path d="M60 205c0-45 20-60 40-60s40 15 40 60z" fill="#8b6fd1" />
      <path d="M85 150l15 18 15-18z" fill="#fff" />
      <circle cx="100" cy="100" r="42" fill="#ffd9b8" />
      <path d="M58 92c0-30 84-30 84 0-10-14-74-14-84 0z" fill="#3b2a4a" />
      <polygon points="100,12 72,68 128,68" fill="#ff8fb8" stroke="#fff" strokeWidth="3" />
      <circle cx="100" cy="12" r="7" fill="#fff" />
      <rect x="62" y="88" width="34" height="20" rx="8" fill="#222" /><rect x="104" y="88" width="34" height="20" rx="8" fill="#222" />
      <rect x="94" y="94" width="12" height="4" fill="#222" />
      <path d="M78 122q22 22 44 0" stroke="#b5475f" strokeWidth="5" fill="#fff" strokeLinecap="round" />
      {pose === 'thumbs'
        ? <g><rect x="140" y="150" width="26" height="30" rx="8" fill="#ffd9b8" /><rect x="147" y="128" width="12" height="28" rx="6" fill="#ffd9b8" /></g>
        : <g><rect x="142" y="140" width="22" height="22" rx="8" fill="#ffd9b8" /><polygon points="150,140 160,100 170,140" fill="#ff5fa2" />
          <circle cx="152" cy="92" r="3" fill="#ffd54a" /><circle cx="170" cy="96" r="3" fill="#7bdcb5" /><circle cx="160" cy="84" r="3" fill="#8b6fd1" /></g>}
    </svg>
  )
}

function Confetti({ count = 50 }) {
  const bits = useMemo(() => Array.from({ length: count }, (_, i) => ({
    l: Math.random() * 100, d: Math.random() * 2, t: 3 + Math.random() * 3,
    c: ['#ff8fb8', '#b497ff', '#ffd54a', '#7bdcb5', '#fff'][i % 5],
  })), [count])
  return <div className="confetti" aria-hidden="true">{bits.map((b, i) =>
    <i key={i} style={{ left: b.l + '%', background: b.c, animationDelay: b.d + 's', animationDuration: b.t + 's' }} />)}</div>
}

function Doodles() {
  return <div className="doodles" aria-hidden="true">{['✨', '🎈', '⭐', '🎉', '🧁', '✨'].map((d, i) => <span key={i} style={{ left: 8 + i * 17 + '%', animationDelay: i * 0.7 + 's' }}>{d}</span>)}</div>
}

function Sparkles() {
  const pts = [['6%', '20%'], ['90%', '14%'], ['0%', '58%'], ['95%', '54%'], ['20%', '2%'], ['76%', '0%']]
  return <div className="sparkles" aria-hidden="true">{pts.map(([l, t], i) =>
    <span key={i} style={{ left: l, top: t, animationDelay: i * 0.25 + 's' }}>{i % 2 ? '✨' : '⭐'}</span>)}</div>
}

function Breath() {
  return <div className="breath" aria-hidden="true"><i /><i /><i /></div>
}
function WishStars() {
  return <div className="wishstars" aria-hidden="true">{[-80, -40, 0, 40, 80].map((x, i) =>
    <span key={i} style={{ '--sx': x + 'px', animationDelay: 1.1 + i * 0.15 + 's' }}>{i % 2 ? '✨' : '⭐'}</span>)}</div>
}

function Cake({ candles = 0, lit = false, out = false, name = false, write = false, cut = false, drop = false, smoke = true }) {
  const xs = Array.from({ length: candles }, (_, i) => 92 + (candles > 1 ? (i * 116) / (candles - 1) : 58))
  const fd = candles * 0.25 + 0.5 // flames light up after every candle has landed
  const body = (
    <svg viewBox="20 44 260 212" className="cake-svg" role="img" aria-label="Pink birthday cake">
      <defs>
        <radialGradient id="glow"><stop offset="0" stopColor="#ffd36b" stopOpacity=".6" /><stop offset="1" stopColor="#ffd36b" stopOpacity="0" /></radialGradient>
        <linearGradient id="flameg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff7a18" /><stop offset=".55" stopColor="#ffb21f" /><stop offset="1" stopColor="#ffe27a" /></linearGradient>
        <clipPath id="nameclip"><rect className={write ? 'reveal' : ''} x="70" y="120" width={name ? 160 : 0} height="40" /></clipPath>
      </defs>
      <ellipse cx="150" cy="240" rx="130" ry="14" fill="#e9d7f5" />
      <rect x="40" y="170" width="220" height="68" rx="14" fill="#ff9ec4" />
      <rect x="70" y="105" width="160" height="70" rx="14" fill="#ffb8d5" />
      <path d="M70 120q10 18 20 0t20 0 20 0 20 0 20 0 20 0 20 0 10 0v-12H70z" fill="#fff" />
      <path d="M40 184q11 20 22 0t22 0 22 0 22 0 22 0 22 0 22 0 22 0 22 0 22 0 0-14H40z" fill="#fff" />
      {[[100, 205], [150, 215], [200, 203], [88, 166], [206, 166]].map(([x, y], i) => <rect key={i} x={x} y={y} width="8" height="3" rx="1.5" fill={['#8b6fd1', '#ffd54a', '#7bdcb5'][i % 3]} transform={`rotate(${i * 40} ${x} ${y})`} />)}
      <g clipPath="url(#nameclip)"><text x="150" y="150" textAnchor="middle" fontFamily="Caveat, cursive" fontSize="34" fontWeight="700" fill="#c2417f">Prachi</text></g>
      {xs.map((x, i) => (
        <g key={i} className={'candle' + (drop ? ' drop' : '')} style={{ '--d': i * 0.25 + 0.2 + 's' }}>
          <rect x={x - 4} y="75" width="8" height="32" rx="3" fill={i % 2 ? '#b497ff' : '#fff'} stroke="#ffd0e3" />
          {(lit || out) && (
            <g className={'flm' + (out ? ' out' : '')} style={{ '--fd': fd + 's', '--od': i * 0.1 + 's', '--fs': 0.9 + (i % 3) * 0.18 + 's' }}>
              <circle className="glow" cx={x} cy="63" r="17" fill="url(#glow)" />
              <g className="fl">
                <path d={`M${x} 75C${x - 6.5} 75 ${x - 6} 62 ${x} 49C${x + 6} 62 ${x + 6.5} 75 ${x} 75Z`} fill="url(#flameg)" />
                <path d={`M${x} 74C${x - 3.2} 74 ${x - 3} 67 ${x} 59C${x + 3} 67 ${x + 3.2} 74 ${x} 74Z`} fill="#fff6c8" />
              </g>
              {smoke && out && <>
                <circle className="ember" cx={x} cy="75.5" r="1.8" fill="#ff7a2a" />
                <path className="wisp" pathLength="100" d={`M${x} 70c-6 -8 6 -14 0 -24s-6 -14 2 -26`} />
                <path className="wisp w2" pathLength="100" d={`M${x} 70c5 -7 -5 -13 0 -21s5 -11 -1 -20`} />
              </>}
            </g>)}
        </g>))}
    </svg>
  )
  if (!cut) return <div className="cake">{body}</div>
  return <div className="cake cut"><div className="half l">{body}</div><div className="half r">{body}</div></div>
}

/* ---------- screens ---------- */
function Welcome({ onMusic, onSilent }) {
  const [sel, setSel] = useState(null)
  const [tries, setTries] = useState(-1)
  const [open, setOpen] = useState(false)
  const pickSilent = () => { setSel('silent'); setTries(t => t + 1); setOpen(true) }
  const pickMusic = () => { setSel('music'); setOpen(false); onMusic() }
  const msg = PRANK[Math.min(Math.max(tries, 0), 2)]
  return (
    <section className="screen center">
      <Hritik size={210} />
      <h1 className="hand big">Hey Prachi!</h1>
      <p className="sub">Choose your vibe to start this crazy birthday ride!</p>
      <div className="cards">
        <button className={'choice' + (sel === 'music' ? ' sel' : '')} onClick={pickMusic} aria-pressed={sel === 'music'}>
          <span className="ico">🎧</span><span className="ct"><b>With Music</b><small>Background beats, birthday vibes and full masti!</small></span></button>
        <button className={'choice' + (sel === 'silent' ? ' sel' : '')} onClick={pickSilent} aria-pressed={sel === 'silent'}>
          <span className="ico">🔇</span><span className="ct"><b>Without Sound</b><small>Silent mode, same crazy animations.</small></span></button>
      </div>
      {open && (
        <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="pt">
          <div className="modal shake" key={tries}>
            <h2 id="pt" className="hand">{msg[0]}</h2><p>{msg[1]}</p>
            <div className="row">
              <button className="btn ghost" onClick={() => setOpen(false)}>Nahi yaar</button>
              <button className="btn" onClick={pickMusic} autoFocus>With Music hi chahiye</button>
            </div>
            <button className="link" onClick={() => { setOpen(false); onSilent() }}>Okay, silent mode</button>
          </div>
        </div>)}
    </section>
  )
}

function Loading({ mode, onDone }) {
  const [p, setP] = useState(0)
  useEffect(() => {
    const start = Date.now()
    let to
    const id = setInterval(() => {
      const v = Math.min(100, Math.round(((Date.now() - start) / 2400) * 100))
      setP(v)
      if (v >= 100) { clearInterval(id); to = setTimeout(onDone, 250) }
    }, 60)
    return () => { clearInterval(id); clearTimeout(to) }
  }, [onDone])
  const items = [mode === 'music' ? 'Turning on the music' : 'Keeping it silent (visuals only)', 'Preparing birthday chaos', 'Loading memories', 'Getting Prachi ready']
  return (
    <section className="screen center">
      <Hritik size={150} /><Doodles />
      <h2 className="hand big">Setting up your Birthday Vibes...</h2>
      <div className="bar" role="progressbar" aria-valuenow={p} aria-valuemin="0" aria-valuemax="100"><div style={{ width: p + '%' }} /></div>
      <b className="pct">{p}%</b>
      <ul className="checks">{items.map((t, i) => { const d = p >= (i + 1) * 25 - 10; return <li key={t} className={d ? 'done' : ''}>{d ? '✔' : '○'} {t}</li> })}</ul>
    </section>
  )
}

function Polaroids() {
  const [imgs, setImgs] = useState(CAPTIONS.map((cap, k) => ({ n: k + 1, cap, tag: TAGS[k], e: 0, ok: null })))
  const [i, setI] = useState(0)
  const [pv, setPv] = useState(3)
  const [pause, setPause] = useState(false)
  const [light, setLight] = useState(null)
  const touch = useRef(null)
  useEffect(() => {
    const f = () => setPv(window.innerWidth >= 900 ? 3 : window.innerWidth >= 560 ? 2 : 1)
    f(); window.addEventListener('resize', f)
    return () => window.removeEventListener('resize', f)
  }, [])
  const max = Math.max(0, imgs.length - pv)
  useEffect(() => { if (i > max) setI(max) }, [max, i])
  useEffect(() => {
    if (pause || light !== null) return
    const id = setInterval(() => setI(x => (x >= max ? 0 : x + 1)), 3500)
    return () => clearInterval(id)
  }, [pause, light, max])
  const go = d => setI(x => Math.min(max, Math.max(0, x + d)))
  const loaded = k => setImgs(a => a.map((x, j) => (j === k ? { ...x, ok: true } : x)))
  // try the next file extension (jpg -> jpeg -> png -> webp); show a placeholder only if none exist
  const failed = k => setImgs(a => a.map((x, j) => (j !== k ? x : x.e < PHOTO_EXTS.length - 1 ? { ...x, e: x.e + 1 } : { ...x, ok: false })))
  const rot = [-3, 2, -1.5, 3, -2.5]
  return (
    <div className="gallery">
      <h2 className="hand">Little moments, big memories.</h2>
      <div className="carousel" onMouseEnter={() => setPause(true)} onMouseLeave={() => setPause(false)}
        onTouchStart={e => (touch.current = e.touches[0].clientX)}
        onTouchEnd={e => { if (touch.current === null) return; const dx = e.changedTouches[0].clientX - touch.current; touch.current = null; if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1) }}>
        <button className="arrow l" onClick={() => go(-1)} aria-label="Previous photos">‹</button>
        <div className="viewport"><div className="track" style={{ transform: `translateX(-${(i * 100) / pv}%)` }}>
          {imgs.map((p, k) => (
            <div className="slot" key={p.n} style={{ flex: `0 0 ${100 / pv}%` }}>
              <figure className="polaroid" style={{ '--r': rot[k % rot.length] + 'deg', animationDelay: k * 0.4 + 's' }}>
                <button className="photo" onClick={() => setLight(k)} aria-label={`Open ${p.cap}`}>
                  <img key={p.e} src={photoSrc(p.n, p.e)} alt={p.cap} style={{ opacity: p.ok ? 1 : 0 }} onLoad={() => loaded(k)} onError={() => failed(k)} />
                  {p.ok === false && <span className="empty"><span>📷</span>Your photo goes here</span>}
                </button>
                <figcaption className="tagline"><b>#</b>{p.tag}</figcaption>
              </figure>
            </div>))}
        </div></div>
        <button className="arrow r" onClick={() => go(1)} aria-label="Next photos">›</button>
      </div>
      <div className="dots">{Array.from({ length: max + 1 }, (_, k) => <button key={k} className={k === i ? 'on' : ''} onClick={() => setI(k)} aria-label={`Go to slide ${k + 1}`} />)}</div>
      {light !== null && (
        <div className="overlay" onClick={() => setLight(null)} role="dialog" aria-modal="true" aria-label="Photo preview">
          <figure className="polaroid big" onClick={e => e.stopPropagation()}>
            <div className="photo">{imgs[light].ok ? <img style={{ opacity: 1 }} src={photoSrc(imgs[light].n, imgs[light].e)} alt={imgs[light].cap} /> : <span className="empty"><span>📷</span>Your photo goes here</span>}</div>
            <figcaption className="tagline"><b>#</b>{imgs[light].tag}</figcaption>
            <button className="btn small" onClick={() => setLight(null)} autoFocus>Close</button>
          </figure>
        </div>)}
    </div>
  )
}

function Screen2({ next }) {
  return (
    <section className="screen center"><Doodles />
      <Hritik size={150} />
      <h1 className="hand big">It's Your Happy Birthday, Prachi!</h1>
      <p className="msg">So happy birthday! May God bless you with joy, success, good health and endless happiness. Keep being the same crazy and amazing you!</p>
      <p className="sub"><b>More smiles, more adventures, more memories!</b></p>
      <Polaroids />
      <button className="btn" onClick={next}>Next Surprise →</button>
    </section>
  )
}

function Milestone({ next }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    let v = 0; const id = setInterval(() => { v += 1; setN(v); if (v >= 23) clearInterval(id) }, 70)
    return () => clearInterval(id)
  }, [])
  return (
    <section className="screen center">
      <Hritik pose="thumbs" size={150} />
      <h1 className="hand big">Prachi, 23 years complete!</h1>
      <div className="counter" aria-label="23 out of 100">{n} / 100</div>
      <div className="bar"><div style={{ width: n + '%' }} /></div>
      <p className="msg">23 saal ki masti, 23 saal ki yaadein... aur abhi 77 saal ki adventures baaki hain!</p>
      <ul className="ach">{['🏆 23 years of memories', '🎉 Unlimited crazy moments', '🚀 New adventures unlocked'].map(t => <li key={t}>{t}</li>)}</ul>
      <button className="btn" onClick={next}>Let's Cut the Cake!</button>
    </section>
  )
}

function CakeReveal({ next }) {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const ts = [setTimeout(() => setStep(1), 1100), setTimeout(() => setStep(2), 3000)]
    return () => ts.forEach(clearTimeout)
  }, [])
  return (
    <section className="screen center">
      <h1 className="hand big">Wait for it... the birthday cake has arrived!</h1>
      <p className="sub">Chef Hritik has made exactly zero cakes before. Good luck, Prachi.</p>
      <div className="stage pop"><Cake name={step >= 1} write />{step >= 2 && <Sparkles />}</div>
      <p className="tag">{step >= 2 ? 'Name icing complete: Prachi' : 'Chef is writing…'}</p>
      <button className="btn" onClick={next} disabled={step < 2}>Aree... candles toh baaki hain! →</button>
    </section>
  )
}

function Wish({ next }) {
  const [blown, setBlown] = useState(false)
  const [locked, setLocked] = useState(false)
  const [ready, setReady] = useState(false)
  const timers = useRef([])
  useEffect(() => {
    const r = setTimeout(() => setReady(true), 3000) // candles land, then flames light up
    return () => { clearTimeout(r); timers.current.forEach(clearTimeout) }
  }, [])
  const blow = () => {
    if (blown || !ready) return
    setBlown(true)
    timers.current = [setTimeout(() => setLocked(true), 1500), setTimeout(next, 4400)]
  }
  return (
    <section className="screen center">
      <h1 className="hand big">Make a Wish!</h1>
      <p className="msg">Soch le, Prachi. Ekdum dil se. Wish confidential rahegi.</p>
      <div className="stage">
        <Cake candles={8} lit name drop out={blown} />
        {blown && <Breath />}{blown && <WishStars />}
      </div>
      {blown
        ? (locked ? <p className="tag ok" role="status">Wish locked! Universe ko forward kar diya.</p> : <p className="tag">Phoooo… 💨</p>)
        : <button className="btn" onClick={blow} disabled={!ready}>{ready ? '💨 Blow the Candles!' : 'Lighting the candles…'}</button>}
    </section>
  )
}

function CutCake({ next, onCut }) {
  const [cut, setCut] = useState(false)
  const t = useRef(null)
  useEffect(() => () => clearTimeout(t.current), [])
  const go = () => { if (cut) return; setCut(true); onCut(); t.current = setTimeout(next, 4000) }
  return (
    <section className="screen center">
      {cut && <Confetti count={60} />}
      <h1 className="hand big">Time to cut the cake!</h1>
      <p className="msg">Wish done? Candles out? Bas phir, cake pe attack!</p>
      <div className="stage">
        <Cake candles={8} lit={false} name cut={cut} smoke={false} />
        {cut && <div className="knife" aria-hidden="true">🔪</div>}
        {cut && <><span className="popper pl">🎉</span><span className="popper pr">🎉</span></>}
      </div>
      {cut ? <p className="tag ok" role="status">Cake officially cut. Ab calories count nahi hongi.</p>
        : <button className="btn" onClick={go}>Cut the Cake!</button>}
    </section>
  )
}

function Celebrate({ mode, next, getSong }) {
  const [blocked, setBlocked] = useState(false)
  // "One Last Surprise" unlocks when the birthday song has finished (or right away if there is no song to wait for)
  const [ready, setReady] = useState(false)

  // The song starts when the cake is cut (see CutCake) and plays once. Silent mode never plays anything.
  useEffect(() => {
    const a = getSong()
    const timers = []
    const unlock = () => setReady(true)
    const onEnded = () => unlock()
    const onPause = () => { if (a.currentTime > 0.5) unlock() } // e.g. visitor pressed mute
    const onError = () => { console.warn('Birthday song not found: add public/audio/tum-jiyo-hazaron-saal.mp3'); unlock() }
    a.addEventListener('ended', onEnded)
    a.addEventListener('pause', onPause)
    a.addEventListener('error', onError)
    if (mode !== 'music') unlock() // silent mode: nothing to wait for
    else if (a.error) onError()
    else if (a.ended) unlock()
    else {
      if (a.paused) {
        playWithFade(a, 1, 3500).catch(err => { if (err && err.name === 'NotAllowedError') { setBlocked(true); unlock() } })
      }
      timers.push(setTimeout(unlock, 40000)) // safety net so the visitor can never get stuck
    }
    return () => {
      timers.forEach(clearTimeout)
      a.removeEventListener('ended', onEnded); a.removeEventListener('pause', onPause); a.removeEventListener('error', onError)
    }
  }, [mode, getSong])

  const playNow = () => getSong().play().then(() => setBlocked(false)).catch(() => {})
  return (
    <section className="screen center party">
      <Confetti count={70} /><Doodles />
      <span className="popper pl">🎉</span><span className="popper pr">🎉</span>
      <Hritik pose="thumbs" size={170} />
      <h1 className="hand big">Happy Birthday, Prachi!</h1>
      <p className="msg">May your day be full of laughter, cake, and absolutely zero boring moments!</p>
      {blocked && <button className="btn ghost small" onClick={playNow}>🎵 Tap to play the birthday song</button>}
      {!ready && <p className="tag" role="status">Wait for it… your message arrives when the song ends 💌</p>}
      <button className="btn" onClick={next} disabled={!ready}>One Last Surprise →</button>
    </section>
  )
}

function Message({ replay }) {
  const [open, setOpen] = useState(false)
  const [reading, setReading] = useState(false)
  const t = useRef(null)
  useEffect(() => () => clearTimeout(t.current), [])
  const toggle = () => {
    clearTimeout(t.current)
    if (open) { setOpen(false); setReading(false); return }
    setOpen(true)
    t.current = setTimeout(() => setReading(true), 1500) // let the envelope open first
  }
  const close = () => { clearTimeout(t.current); setReading(false); setOpen(false) }
  return (
    <section className="screen center">
      <h1 className="hand big">A Message For You</h1>
      <p className="sub">Last surprise, birthday girl. Open when ready.</p>
      <div className={'env-wrap' + (open ? ' open' : '')}>
        <button className="envelope" onClick={toggle} aria-expanded={open} aria-label={open ? 'Close the envelope' : 'Open the envelope'}>
          <span className="env-back" />
          <span className="letter"><span className="letter-in"><span className="hand l-title">{LETTER.greeting}</span></span></span>
          <svg className="env-front" viewBox="0 0 340 224" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="gl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffc9df" /><stop offset="1" stopColor="#ffa6c9" /></linearGradient>
              <linearGradient id="gr" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffbdd8" /><stop offset="1" stopColor="#ff9ac2" /></linearGradient>
              <linearGradient id="gb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffb3d1" /><stop offset="1" stopColor="#ff93bd" /></linearGradient>
            </defs>
            <polygon points="0,0 172,122 0,224" fill="url(#gl)" />
            <polygon points="340,0 168,122 340,224" fill="url(#gr)" />
            <polygon points="0,224 170,106 340,224" fill="url(#gb)" />
            <polyline points="0,224 170,106 340,224" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="1.5" />
          </svg>
          <span className="to hand">To: Prachi 🎂</span>
          <span className="flap"><span className="seal">⭐</span></span>
          <span className="spark s1">✨</span><span className="spark s2">🎉</span><span className="spark s3">✨</span><span className="spark s4">⭐</span>
        </button>
      </div>
      <p className="hint">{open ? 'Tap the envelope to close it' : '💌 Tap the envelope to open'}</p>
      <p className="tag">Made with friendship, fun and a lot of smiles.</p>
      <button className="btn" onClick={replay}>Replay the birthday story ↻</button>
      {reading && (
        <div className="overlay" onClick={close} role="dialog" aria-modal="true" aria-label="Letter for Prachi">
          <article className="paper" onClick={e => e.stopPropagation()}>
            <h2 className="hand">{LETTER.greeting}</h2>
            {LETTER.paragraphs.map((p, k) => <p key={k}>{p}</p>)}
            {LETTER.quote && <p className="quote">{LETTER.quote}</p>}
            <p className="sign">{LETTER.closing}<br /><b className="hand">{LETTER.name}</b></p>
            <button className="btn small" onClick={close}>Close</button>
          </article>
        </div>)}
    </section>
  )
}

/* ---------- app ---------- */
// screens: 0 welcome, 1 loading, 2 greeting, 3 milestone, 4 cake reveal, 5 wish, 6 cut, 7 celebration, 8 letter
export default function App() {
  const [screen, setScreen] = useState(0)
  const [mode, setMode] = useState(null)
  const [muted, setMuted] = useState(false)
  const bg = useRef(null)
  const song = useRef(null)
  const finishLoading = useCallback(() => setScreen(2), [])

  const startBg = () => {
    try {
      if (!bg.current) { bg.current = new Audio(BG_SRC); bg.current.loop = true; bg.current.onerror = () => {} }
      playWithFade(bg.current, 0.4, 2000).catch(() => {}) // intro music fades in gently
    } catch { /* missing/blocked audio never breaks the app */ }
  }
  const choose = m => { setMode(m); setMuted(false); if (m === 'music') startBg(); setScreen(1) }
  const getSong = useCallback(() => {
    if (!song.current) { const a = new Audio(SONG_SRC); a.preload = 'auto'; song.current = a } // the song plays once, then stops
    return song.current
  }, [])
  // called on the "Cut the Cake!" click: the birthday song starts with the cake cutting
  const startSong = () => {
    if (mode !== 'music') return
    const b = bg.current
    if (b) fadeTo(b, 0, 1500, () => b.pause()) // intro music fades out...
    playWithFade(getSong(), 1, 3500).catch(() => {}) // ...while the birthday song fades in
  }
  useEffect(() => () => { stopAudio(bg.current); stopAudio(song.current) }, [])
  const toggleMute = () => {
    const a = screen >= 6 ? song.current : bg.current; const m = !muted; setMuted(m)
    if (a) { if (m) stopAudio(a); else playWithFade(a, screen >= 6 ? 1 : 0.4, 800).catch(() => {}) }
  }
  const replay = () => { stopAudio(bg.current); bg.current = null; stopAudio(song.current); song.current = null; setMode(null); setMuted(false); setScreen(0) }

  const views = [
    () => <Welcome onMusic={() => choose('music')} onSilent={() => choose('silent')} />,
    () => <Loading mode={mode} onDone={finishLoading} />,
    () => <Screen2 next={() => setScreen(3)} />,
    () => <Milestone next={() => setScreen(4)} />,
    () => <CakeReveal next={() => setScreen(5)} />,
    () => <Wish next={() => setScreen(6)} />,
    () => <CutCake onCut={startSong} next={() => setScreen(7)} />,
    () => <Celebrate mode={mode} getSong={getSong} next={() => setScreen(8)} />,
    () => <Message replay={replay} />,
  ]
  return (
    <main>
      <div className="blobs" aria-hidden="true" />
      <div className="page" key={screen}>{views[screen]()}</div>
      {mode === 'music' && screen > 1 && screen < 8 && (
        <button className="mute" onClick={toggleMute} aria-label={muted ? 'Unmute music' : 'Mute music'}>{muted ? '🔇' : '🔊'}</button>)}
    </main>
  )
}