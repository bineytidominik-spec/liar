'use client';

import { useState } from 'react';

const SLIDES = [
  {
    phase: '01',
    title: 'Das Wort.',
    icon: '🃏',
    body: 'Jeder sieht heimlich das Wort auf seinem Bildschirm — außer dem Liar. Der weiß gar nichts.',
    hint: 'Karten werden der Reihe nach weitergegeben.',
  },
  {
    phase: '02',
    title: 'Die Diskussion.',
    icon: '💬',
    body: 'Reihum beschreibt jeder das Wort — ohne es zu nennen. Zu konkret verrät die Crew, zu vage macht verdächtig.',
    hint: 'Der Liar muss mitbluffen.',
  },
  {
    phase: '03',
    title: 'Die Abstimmung.',
    icon: '🗳️',
    body: 'Wer ist der Liar? Jeder stimmt ab. Wird er entlarvt, gewinnt die Crew. Sonst gewinnt der Liar.',
    hint: 'Beim Verlieren darf der Liar das Wort erraten — und Bonuspunkte holen.',
  },
];

export function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const [slide, setSlide] = useState(0);
  const isLast = slide === SLIDES.length - 1;
  const s = SLIDES[slide];

  const next = () => {
    if (isLast) onDone();
    else setSlide(i => i + 1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#fdf7f0] flex flex-col">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(253,164,175,0.35),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(253,186,116,0.22),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(196,181,253,0.18),transparent_50%)]" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col max-w-md mx-auto w-full px-6 pt-12 pb-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="font-display text-4xl font-black italic tracking-tight leading-none">
            Li<span className="text-rose-500">ar</span>
          </h1>
          <p className="font-mono-game text-[10px] uppercase tracking-[0.3em] text-stone-400 mt-1">
            Das Partyspiel
          </p>
        </div>

        {/* Slide indicators */}
        <div className="flex gap-1.5 mb-8">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${i === slide ? 'bg-rose-500 flex-[2]' : i < slide ? 'bg-rose-300 flex-1' : 'bg-stone-200 flex-1'}`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center fade-up" key={slide}>
          <div className="font-mono-game text-[10px] uppercase tracking-[0.3em] text-rose-400 mb-3">
            Phase {s.phase}
          </div>

          <div className="text-6xl mb-6">{s.icon}</div>

          <h2 className="font-display text-4xl font-black italic text-stone-800 mb-4">
            {s.title}
          </h2>

          <p className="text-stone-600 text-lg leading-relaxed mb-6">
            {s.body}
          </p>

          <div className="bg-white border border-stone-100 rounded-xl px-4 py-3 shadow-sm">
            <p className="font-mono-game text-[11px] uppercase tracking-[0.2em] text-stone-400">
              {s.hint}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-3 mt-8">
          {slide > 0 && (
            <button
              onClick={() => setSlide(i => i - 1)}
              className="px-5 py-3 bg-white border border-stone-200 text-stone-500 font-mono-game text-xs uppercase tracking-wider hover:bg-rose-50 hover:border-rose-200 transition-colors rounded-xl shadow-sm"
            >
              ←
            </button>
          )}
          <button
            onClick={next}
            className="flex-1 py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-mono-game text-sm uppercase tracking-[0.2em] rounded-xl shadow-sm transition-colors active:scale-95"
          >
            {isLast ? 'Los geht\'s →' : 'Weiter →'}
          </button>
        </div>

        {!isLast && (
          <button
            onClick={onDone}
            className="mt-3 w-full text-center font-mono-game text-[10px] uppercase tracking-wider text-stone-400 hover:text-stone-600 transition-colors"
          >
            Überspringen
          </button>
        )}
      </div>
    </div>
  );
}
