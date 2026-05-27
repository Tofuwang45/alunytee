'use client';
import styles from './Hero.module.css';
import Starfield from './Starfield';
import ScrollZoomSection from '../ScrollZoom/ScrollZoomSection';
import TargetStar from '../TargetStar/Star';

export default function Hero() {
  return (
    <>
      {/* The .heroRoot class from the module provides the stacking context */}
      <section className={`${styles.heroRoot} bg-slate-950 text-slate-50 antialiased`}>
        <Starfield
          starCount={1000}
          starColor={[255, 255, 255]}
          speedFactor={0.1}
          backgroundColor="black"
        />

        <TargetStar
          maxScrollDistance={0.5}
          maxZoomScale={5}
          visibleUntilDistance={1.1}
          leftPosition="15%"
          topPosition="45%"
        />

        {/* Aurora layers*/}
        <div className={`${styles.auroraLayer} ${styles.vignette}`}>
          <div className={`${styles.auroraStrand} ${styles.s1} ${styles.bgAurora1}`} />
          <div
            className={`${styles.auroraStrand} ${styles.s2} ${styles.bgAurora2}`}
            style={{ top: '0%', transformOrigin: '30% 50%' }}
          />
          <div
            className={`${styles.auroraStrand} ${styles.s3} ${styles.bgAurora3}`}
            style={{ top: '20%', transformOrigin: '70% 40%' }}
          />
          <div
            className={`${styles.auroraStrand} ${styles.s4} ${styles.bgAurora4}`}
            style={{ top: '35%', transformOrigin: '50% 60%' }}
          />
        </div>

        {/* Foreground content (z-index: 20, from Tailwind utility) */}
        <div className="relative z-20 mx-auto flex max-w-6xl flex-col items-center px-6 pt-32 pb-24 text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-xs font-medium text-sky-200/90 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-300 shadow-[0_0_12px_2px_rgba(125,211,252,0.8)]" />
            Now in Development
          </span>

          <h1 className="mt-2 text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl">
            Keep critical knowledge{' '}
            <span className="bg-gradient-to-r from-sky-300 via-cyan-200 to-indigo-200 bg-clip-text text-transparent">
              in your company
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-slate-300/90">
            Transform employee transitions with AI-powered documentation that captures tacit knowledge and creates living guides for seamless onboarding.
          </p>

          <div className="mt-8 flex items-center gap-4">
            <a
              href="#signup"
              className="rounded-lg bg-sky-400 px-5 py-3 text-slate-900 transition hover:bg-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300"
            >
              Get early access
            </a>
            <a
              href="#learn"
              className="rounded-lg border border-sky-300/30 bg-white/0 px-5 py-3 text-sky-100 backdrop-blur transition hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-sky-300/40"
            >
              Learn more
            </a>
          </div>
        </div>

        {/* Subtle bottom gradient (z-index: 30, from Tailwind utility) */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-18 bg-gradient-to-t from-slate-950 to-transparent" />
      </section>

      <ScrollZoomSection />
    </>
  );
}
