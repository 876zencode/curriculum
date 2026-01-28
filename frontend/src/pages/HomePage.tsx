import WorldScene from '@/components/WorldScene'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

const TOPICS = [
  'Java',
  'JavaScript',
  'React',
  'Testing',
  'Heart of Data',
  'DevOps',
]

const TOPIC_STATUSES = [
  { label: 'Verified', enabled: true },
  { label: 'Being developed', enabled: true },
  { label: '', enabled: false },
  { label: '', enabled: false },
  { label: '', enabled: false },
  { label: '', enabled: false },
]

export function HomePage() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [muted, setMuted] = useState(true)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.volume = 0.5
    audioRef.current.muted = true
  }, [])

  useEffect(() => {
    const originalBody = document.body.style.overflow
    const originalHtml = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalBody
      document.documentElement.style.overflow = originalHtml
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return undefined

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        audio.pause()
      } else if (!muted && entered) {
        void audio.play().catch(() => {
          // Resume may be blocked; ignore.
        })
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [entered, muted])

  const handleEnter = async () => {
    const audio = audioRef.current
    setEntered(true)
    if (!audio) return
    audio.muted = false
    setMuted(false)
    try {
      await audio.play()
    } catch {
      setMuted(true)
      audio.muted = true
    }
  }

  const toggleAudio = async () => {
    const audio = audioRef.current
    if (!audio) return
    const nextMuted = !muted
    setMuted(nextMuted)
    audio.muted = nextMuted
    if (!nextMuted) {
      try {
        await audio.play()
      } catch {
        // Autoplay might be blocked; user can try again.
      }
    } else {
      audio.pause()
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {!entered && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-transparent">
          <div className="text-center text-[#1f4f86] px-6">
            <h1 className="text-[clamp(2rem,4vw,2.6rem)] font-semibold leading-none">
              Welcome to Curriculum
            </h1>
            <p className="mt-2 text-[#5c7aa3] text-[1.1rem]">
              Where every particle tells of new topics.
            </p>
            <button
              className="mt-7 rounded-full bg-[#1f4f86] px-9 py-3 text-white font-semibold shadow-[0_10px_25px_rgba(31,79,134,0.25)] cursor-pointer"
              onClick={handleEnter}
            >
              Enter
            </button>
          </div>
        </div>
      )}

      <main className="relative min-h-screen">
        <div className="absolute inset-0">
          <WorldScene entered={entered} />
          <div className="absolute inset-0 pointer-events-none [background:radial-gradient(circle_at_15%_25%,rgba(215,229,244,0.7),transparent_40%),radial-gradient(circle_at_10%_70%,rgba(214,229,244,0.8),transparent_45%),radial-gradient(circle_at_90%_15%,rgba(216,232,248,0.7),transparent_35%)]" />
        </div>
      </main>

      <audio ref={audioRef} src="/ambient.mp3" loop />
      {entered && (
        <button
          className="absolute top-6 right-6 z-40 rounded-full border border-[rgba(90,165,228,0.35)] bg-[rgba(255,255,255,0.7)] px-3 py-1.5 text-[0.7rem] uppercase tracking-[0.08em] text-[#2f6fb1] backdrop-blur"
          onClick={toggleAudio}
        >
          {muted ? 'Sound Off' : 'Sound On'}
        </button>
      )}

      {entered && (
        <div className="fixed inset-x-6 top-20 z-40 flex justify-center text-center sm:absolute sm:inset-x-[clamp(1.5rem,6vw,6rem)] sm:top-auto sm:bottom-[calc(2.2rem+140px+1.6rem)] sm:justify-start sm:text-left">
          <div className="flex w-full flex-col items-center gap-1 text-center sm:items-start sm:text-left">
            <h1 className="text-[clamp(2.4rem,4.5vw,3.6rem)] font-extrabold text-[#1f4f86] tracking-[0.01em] opacity-0 animate-fade-up [animation-delay:0.25s] leading-none">
              CLICK A TOPIC &
              <br />
              START YOUR JOURNEY
            </h1>
            {/* <p className="max-w-[520px] text-[1.1rem] font-medium text-[#6b7f9f] opacity-0 animate-fade-up [animation-delay:0.4s]">
              Becoming an expert begins with a single click.
            </p> */}
          </div>
        </div>
      )}

      {entered && (
        <footer className="absolute left-[clamp(1.5rem,6vw,6rem)] right-[clamp(1.5rem,6vw,6rem)] bottom-[2.2rem] z-30 flex flex-col gap-4 opacity-0 animate-fade-up [animation-duration:1.6s] sm:gap-4 max-sm:left-6 max-sm:right-6 max-sm:bottom-5 max-sm:gap-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-[repeat(auto-fit,minmax(180px,1fr))] sm:gap-4">
            {TOPICS.map((label, index) => {
              const status = TOPIC_STATUSES[index] ?? { label: 'Coming soon', enabled: false }
              return (
              <article
                className={`group relative h-[110px] rounded-[18px] overflow-hidden border border-[rgba(90,165,228,0.25)] bg-[rgba(255,255,255,0.18)] shadow-[0_12px_24px_rgba(31,79,134,0.1)] transition sm:h-[140px] opacity-0 animate-fade-up ${
                  status.enabled
                    ? 'cursor-pointer hover:-translate-y-1.5 hover:border-[rgba(90,165,228,0.9)] hover:shadow-[0_16px_35px_rgba(31,79,134,0.2)] active:-translate-y-1.5 active:border-[rgba(90,165,228,0.9)] active:shadow-[0_16px_35px_rgba(31,79,134,0.2)]'
                    : 'cursor-not-allowed opacity-70'
                }`}
                style={{ animationDelay: `${0.6 + index * 0.15}s` }}
                key={label}
              >
                <div className={`absolute right-3 top-3 rounded-full border border-[rgba(31,79,134,0.2)] bg-white/80 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-[#2f6fb1] transition ${
                  status.enabled
                    ? 'group-hover:border-[rgba(90,165,228,0.9)] group-hover:text-[#2f6fb1] group-hover:shadow-[0_0_14px_rgba(90,165,228,0.55)]'
                    : ''
                }`}
                >
                  {status.label}
                </div>
                {status.enabled ? (
                  <Link to={`/language/${label}`} className="absolute inset-0">
                    <div className="absolute inset-0 rounded-[18px] bg-[linear-gradient(140deg,rgba(90,165,228,0.1),rgba(255,255,255,0.7)),radial-gradient(circle_at_20%_20%,rgba(90,165,228,0.25),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(122,164,209,0.3),transparent_55%)] transition duration-300 group-hover:scale-[1.02] group-active:scale-[1.02]" />
                    <div className="absolute inset-0 flex items-center justify-center gap-2 text-center text-[#1f4f86] font-semibold transition-colors group-hover:text-[#2f6fb1] group-active:text-[#2f6fb1]">
                      <span>{label}</span>
                    </div>
                  </Link>
                ) : (
                  <div className="absolute inset-0" aria-disabled="true">
                    <div className="absolute inset-0 rounded-[18px] bg-[linear-gradient(140deg,rgba(90,165,228,0.06),rgba(255,255,255,0.55)),radial-gradient(circle_at_20%_20%,rgba(90,165,228,0.18),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(122,164,209,0.2),transparent_55%)]" />
                    <div className="absolute inset-0 flex items-center justify-center gap-2 text-center text-[#1f4f86] font-semibold">
                      <span>{label}</span>
                    </div>
                  </div>
                )}
              </article>
            )})}
          </div>
        </footer>
      )}
    </div>
  );
}
