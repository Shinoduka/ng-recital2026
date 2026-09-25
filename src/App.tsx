import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { performances, type Performance } from "./performances";
import "./App.css";

const INITIAL = {
  left: { x1: 153, y1: 55, x2: 70, y2: 180 },
  right: { x1: 167, y1: 55, x2: 250, y2: 180 },
};
const CROSS = {
  left: { x1: 90, y1: 20, x2: 230, y2: 160 },
  right: { x1: 230, y1: 20, x2: 90, y2: 160 },
};

export default function App() {
  const stageRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const pointer = useRef<{ id: number; startY: number; lastY: number; lastTime: number; velocity: number; startPosition: number } | null>(null);
  const positionRef = useRef(0);
  const motionRef = useRef<gsap.core.Tween | null>(null);
  const wheelTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blockTapUntil = useRef(0);
  const [position, setPosition] = useState(0);
  const [dragging, setDragging] = useState(false);
  const busyRef = useRef(false);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState<Performance | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const tappedCardRect = useRef<DOMRect | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const ctx = gsap.context(() => {
      gsap.set(".road-left", { attr: INITIAL.left });
      gsap.set(".road-right", { attr: INITIAL.right });
      gsap.set(".horizon", { opacity: 0.45 });
      gsap.set(".cross-glow", { opacity: 0, scale: 0, transformOrigin: "50% 50%" });
    }, stage);
    return () => ctx.revert();
  }, []);

  // 詳細ページがDOMに現れてから、道→X→LPをひとつのタイムラインで再生
  useLayoutEffect(() => {
    if (!selected || !stageRef.current) return;
    const stage = stageRef.current;
    const ctx = gsap.context(() => {
      const official = selected.type === "official";
      const tl = gsap.timeline({ paused: true });
      timelineRef.current = tl;
      // The LP starts at the actual tapped card bounds (FLIP-style reveal).
      const rect = tappedCardRect.current;
      const top = rect ? Math.max(0, rect.top) : window.innerHeight * 0.4;
      const right = rect ? Math.max(0, window.innerWidth - rect.right) : window.innerWidth * 0.2;
      const bottom = rect ? Math.max(0, window.innerHeight - rect.bottom) : window.innerHeight * 0.4;
      const left = rect ? Math.max(0, rect.left) : window.innerWidth * 0.2;
      const startClip = `inset(${top}px ${right}px ${bottom}px ${left}px round 12px)`;
      gsap.set(".detail-overlay", { clipPath: startClip, opacity: 1, pointerEvents: "auto" });
      gsap.set(".detail-hero-content", { opacity: 0, y: 35 });
      gsap.set(".detail-body", { opacity: 0, y: 30 });
      gsap.set(".cross-glow", { opacity: 0, scale: 0 });

      if (official) {
        tl.to(".road-left", { attr: CROSS.left, duration: 0.85, ease: "power3.inOut" }, "cross")
          .to(".road-right", { attr: CROSS.right, duration: 0.85, ease: "power3.inOut" }, "cross")
          .to(".horizon", { opacity: 0, duration: 0.5 }, "cross")
          .to(".cross-glow", { opacity: 1, scale: 1, duration: 0.15 }, "cross+=0.72")
          .to(".cross-glow", { opacity: 0, scale: 3, duration: 0.45 });
      } else {
        // 有志は交差せず、道の線が左右へ開く
        tl.to(".road-left", { attr: { x2: -100 }, duration: 0.8, ease: "power3.inOut" }, "cross")
          .to(".road-right", { attr: { x2: 420 }, duration: 0.8, ease: "power3.inOut" }, "cross")
          .to(".horizon", { opacity: 0, duration: 0.5 }, "cross");
      }
      tl.to(".detail-overlay", {
        clipPath: "inset(0px 0px 0px 0px round 0px)",
        duration: 1.0,
        ease: "power3.inOut",
      }, "cross+=0.12")
        .to(".detail-hero-content", { opacity: 1, y: 0, duration: 0.65, ease: "power3.out" }, "-=0.35")
        .to(".detail-body", { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.4");

      tl.eventCallback("onComplete", () => {
        setExpanded(true);
        setTransitioning(false);
        busyRef.current = false;
      });
      tl.eventCallback("onReverseComplete", () => {
        setSelected(null);
        setExpanded(false);
        setTransitioning(false);
        busyRef.current = false;
      });
      if (reduceMotion) {
        tl.progress(1);
        setExpanded(true);
        setTransitioning(false);
        busyRef.current = false;
      } else tl.play();
    }, stage);
    return () => {
      timelineRef.current = null;
      ctx.revert();
    };
  }, [selected, reduceMotion]);

  useEffect(() => {
    if (!selected) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDetail();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  // closeDetail reads the latest refs and only updates state
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  // 小数位置を使い、指の移動中も全カードを連続的に描画する。
  const clamp = (value: number) => Math.max(0, Math.min(performances.length - 1, value));
  const updatePosition = (value: number) => {
    const next = clamp(value);
    positionRef.current = next;
    setPosition(next);
    const nearest = Math.round(next);
    activeRef.current = nearest;
    setActive(nearest);
  };
  const snapTo = (target: number, velocity = 0) => {
    motionRef.current?.kill();
    const model = { value: positionRef.current };
    const destination = clamp(Math.round(target));
    if (reduceMotion) { updatePosition(destination); return; }
    motionRef.current = gsap.to(model, {
      value: destination,
      duration: Math.min(0.85, Math.max(0.25, 0.38 + Math.abs(destination - model.value) * 0.13)),
      ease: Math.abs(velocity) > 0.002 ? "power3.out" : "power2.out",
      onUpdate: () => updatePosition(model.value),
      onComplete: () => updatePosition(destination),
    });
  };
  const goTo = (index: number) => {
    if (busyRef.current || selected || !showCards) return;
    snapTo(index);
  };
  useEffect(() => () => {
    motionRef.current?.kill();
    if (wheelTimer.current) clearTimeout(wheelTimer.current);
  }, []);

  const openDetail = (performance: Performance, card?: HTMLElement) => {
    if (busyRef.current || Date.now() < blockTapUntil.current || selected) return;
    motionRef.current?.kill();
    if (wheelTimer.current) clearTimeout(wheelTimer.current);
    tappedCardRect.current = card?.getBoundingClientRect() ?? null;
    busyRef.current = true;
    setTransitioning(true);
    setExpanded(false);
    setSelected(performance);
  };

  const closeDetail = () => {
    if (busyRef.current || !selected) return;
    busyRef.current = true;
    setExpanded(false);
    setTransitioning(true);
    const tl = timelineRef.current;
    if (tl && !reduceMotion) tl.reverse();
    else {
      setSelected(null);
      setTransitioning(false);
      busyRef.current = false;
    }
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (selected || !showCards || busyRef.current || event.button !== 0) return;
    motionRef.current?.kill();
    if (wheelTimer.current) clearTimeout(wheelTimer.current);
    pointer.current = {
      id: event.pointerId, startY: event.clientY, lastY: event.clientY,
      lastTime: performance.now(), velocity: 0, startPosition: positionRef.current,
    };
    // Capture only after an actual drag. Capturing on pointerdown can retarget
    // the subsequent click to .card-scene instead of the card button.
    setDragging(false);
  };
  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const p = pointer.current;
    if (!p || p.id !== event.pointerId) return;
    const now = performance.now();
    const elapsed = Math.max(1, now - p.lastTime);
    const delta = event.clientY - p.startY;
    // 上スワイプで正方向。画面高に応じた移動距離にする。
    const pxPerCard = Math.max(125, Math.min(240, window.innerHeight * 0.28));
    const next = p.startPosition - delta / pxPerCard;
    if (Math.abs(delta) > 7) {
      blockTapUntil.current = Date.now() + 400;
      if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.setPointerCapture(event.pointerId);
      }
      setDragging(true);
    } else if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      return; // A tap is handled by the card button onClick.
    }
    p.velocity = p.velocity * 0.35 + ((p.lastY - event.clientY) / pxPerCard / elapsed) * 0.65;
    p.lastY = event.clientY;
    p.lastTime = now;
    updatePosition(next);
  };
  const finishPointer = (event: React.PointerEvent<HTMLDivElement>, cancelled = false) => {
    const p = pointer.current;
    if (!p || p.id !== event.pointerId) return;
    pointer.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    const moved = Math.abs(event.clientY - p.startY) > 7;
    if (moved) blockTapUntil.current = Date.now() + 400;
    if (!moved) return; // Do not snap or cancel the native click on a tap.
    // 直近の指速度から慣性距離を算出。速いフリックで複数枚移動できる。
    const age = performance.now() - p.lastTime;
    const velocity = cancelled || age > 100 ? 0 : p.velocity;
    const projected = positionRef.current + velocity * 230;
    snapTo(projected, velocity);
  };
  const onWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (selected || !showCards || busyRef.current) return;
    event.preventDefault();
    motionRef.current?.kill();
    const normalized = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaMode === 2 ? event.deltaY * window.innerHeight : event.deltaY;
    updatePosition(positionRef.current + Math.max(-130, Math.min(130, normalized)) / 220);
    if (wheelTimer.current) clearTimeout(wheelTimer.current);
    wheelTimer.current = setTimeout(() => snapTo(positionRef.current), 140);
  };
  const onJourneyKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (selected || busyRef.current) return;
    if (["ArrowDown", "PageDown", "ArrowUp", "PageUp"].includes(event.key)) {
      event.preventDefault();
      goTo(activeRef.current + (["ArrowDown", "PageDown"].includes(event.key) ? 1 : -1));
    }
  };

  return (
    <main className="stage" ref={stageRef}>
      <div className="background-grid" aria-hidden="true" />
      <header className="site-header"><span>NEXT GROOOVE</span><span>11TH ANNIVERSARY</span></header>
      <div className={`road-title ${showCards ? "road-title--small" : ""} ${selected ? "road-title--hidden" : ""}`}>
        <span className="eyebrow">THE JOURNEY CONTINUES</span>
        <h1>BEYOND THE LINES.</h1>
        <p>この先へ、どこまでも。</p>
      </div>

      <svg className="motion-svg" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid meet" role="img" aria-label="水平線へ続く2本の道">
        <defs>
          <linearGradient id="road-gradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fff" stopOpacity=".3"/><stop offset="100%" stopColor="#fff" stopOpacity="1"/></linearGradient>
          <radialGradient id="glow-gradient"><stop offset="0%" stopColor="#fff" stopOpacity=".9"/><stop offset="100%" stopColor="#fff" stopOpacity="0"/></radialGradient>
        </defs>
        <line className="horizon" x1="0" y1="55" x2="320" y2="55" stroke="#fff" strokeWidth=".5" />
        <line className="road-left" {...INITIAL.left} stroke="url(#road-gradient)" strokeWidth="2" strokeLinecap="round" />
        <line className="road-right" {...INITIAL.right} stroke="url(#road-gradient)" strokeWidth="2" strokeLinecap="round" />
        <circle className="cross-glow" cx="160" cy="90" r="25" fill="url(#glow-gradient)" />
      </svg>

      {!showCards && <div className="start-controls"><button type="button" onClick={() => setShowCards(true)}>EXPLORE THE NUMBERS <span aria-hidden="true">↗</span></button></div>}

      {showCards && <>
        <div className={`card-scene ${expanded ? "card-scene--hidden" : ""} ${dragging ? "card-scene--dragging" : ""}`} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={event => finishPointer(event)} onPointerCancel={event => finishPointer(event, true)} onWheel={onWheel} onKeyDown={onJourneyKeyDown} tabIndex={0} aria-label="演目一覧。上下スワイプまたは矢印キーで移動">
          {performances.map((p, i) => {
            const offset = i - position;
            // 通過済みカードは奥へ最大2枚。次カードは手前から連続的に進入。
            const behind = offset < 0;
            const depth = Math.abs(offset);
            const visible = offset >= -2.7 && offset <= 1.8;
            const isActive = i === active && Math.abs(offset) < 0.32 && !dragging;
            const backY = -29 * (1 - Math.exp(-depth * 0.88)) / (1 - Math.exp(-1.76));
            const y = behind ? Math.max(-33, backY) : offset * 68;
            const scale = behind ? Math.max(0.16, Math.exp(-depth * 0.47)) : 1 + offset * 0.12;
            const opacity = !visible ? 0 : behind ? Math.max(0, 1 - depth * 0.34) : Math.max(0.22, 1 - offset * 0.55);
            const brightness = behind ? Math.max(0.35, 1 - depth * 0.26) : Math.max(0.4, 1 - offset * 0.4);
            const cardStyle = {
              "--accent": p.accent,
              "--card-y": `${y}vh`,
              "--card-scale": scale,
              "--card-opacity": opacity,
              "--card-filter": `brightness(${brightness}) saturate(${Math.max(0.5, 1 - depth * 0.18)})`,
              zIndex: Math.round(100 - depth * 10 + (behind ? 0 : 1)),
              visibility: visible ? "visible" : "hidden",
            } as React.CSSProperties;
            return <button
              key={p.id} data-index={i} type="button" className={`number-card ${isActive ? "number-card--active" : ""}`}
              style={cardStyle}
              aria-label={`${p.id} ${p.title} 詳細を開く`}
              tabIndex={isActive ? 0 : -1}
              aria-hidden={!isActive}
              disabled={!isActive}
              onClick={event => { if (!pointer.current && !dragging) openDetail(p, event.currentTarget); }}
            >
              <span className="card-shine" />
              <span className="card-meta"><span>{p.id}</span><span>{p.type === "official" ? "OFFICIAL" : "VOLUNTARY"}</span></span>
              <span className="card-main"><span className="card-genre">{p.genre}</span><strong>{p.title}</strong><span className="card-caption">{p.instructors.length ? p.instructors.join(" × ") : "DANCER'S CREATION"}</span></span>
              <span className="card-bottom">{isActive ? "TAP TO EXPLORE ↗" : ""}</span>
            </button>;
          })}
        </div>
        {!selected && <div className="journey-controls" aria-live="polite">
          <div className="journey-status"><span>{String(active + 1).padStart(2, "0")} / {String(performances.length).padStart(2, "0")}</span><small>↑ DRAG / SWIPE / SCROLL ↓</small></div>
        </div>}
      </>}

      {selected && <div className={`detail-overlay ${expanded ? "detail-overlay--open" : ""}`} role="dialog" aria-modal="true" aria-label={`${selected.title} の詳細`}>
        <div className="detail-backdrop" style={{ "--accent": selected.accent } as React.CSSProperties} />
        <section className="detail-panel">
          <button type="button" className="close-button" onClick={closeDetail} disabled={transitioning} aria-label="詳細を閉じる">× <span>CLOSE</span></button>
          <div className="detail-hero" style={{ "--accent": selected.accent } as React.CSSProperties}>
            {selected.cover && <img src={selected.cover} alt="" className="detail-cover" />}
            <div className="detail-hero-content"><span className="detail-kicker">{selected.id} / {selected.type === "official" ? "OFFICIAL NUMBER" : "VOLUNTARY NUMBER"}</span><h2>{selected.title}</h2><p>{selected.genre}</p></div>
          </div>
          <div className="detail-body"><div className="detail-section-label">ABOUT THE NUMBER <span>01</span></div><p className="detail-description">{selected.description}</p>
            {selected.instructors.length > 0 && <><div className="detail-section-label">INSTRUCTORS <span>02</span></div><p className="detail-instructors">{selected.instructors.join(" × ")}</p></>}
            <div className="detail-section-label">MEMBERS <span>{String(selected.members.length).padStart(2, "0")}</span></div>
            <div className="member-grid">{selected.members.map(member => <div className="member" key={member.id}><div className="member-photo">{member.photo ? <img src={member.photo} alt={member.name} loading="lazy" /> : <span aria-hidden="true">{member.name.replace("MEMBER ", "")}</span>}</div><span className="member-name">{member.name}</span></div>)}</div>
            <p className="detail-end">THE JOURNEY CONTINUES. — 11TH ANNIVERSARY</p>
          </div>
        </section>
      </div>}
    </main>
  );
}
