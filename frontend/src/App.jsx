import React, { useState, useRef, useMemo, useEffect } from "react";
import { createAdminClient } from "./api/adminClient";
import client from "./api/client";
import {
  Home,
  Package,
  ShoppingBag,
  User,
  Users,
  Gift,
  Sword,
  Shield,
  Zap,
  Gem,
  Flame,
  Star,
  Crown,
  ChevronRight,
  Check,
  ArrowUpRight,
  ArrowDownRight,
  History,
  Settings,
  Plus,
  Trash2,
  ArrowLeft,
  Tag,
  Sparkles,
  Wallet,
  Ban,
  ShieldCheck,
  Search,
  BarChart3,
  RefreshCw,
  Edit,
  X
} from "lucide-react";

/* ---------------------------------------------------------------
   TOKENS & RARITY
----------------------------------------------------------------*/
const RARITY = {
  common: {
    label: "Oddiy",
    color: "#9CA3AF",
    glow: "rgba(156,163,175,0.3)",
    bg: "linear-gradient(180deg, rgba(156,163,175,0.1) 0%, rgba(18,22,31,0.95) 100%)",
  },
  rare: {
    label: "Noyob",
    color: "#3B82F6",
    glow: "rgba(59,130,246,0.4)",
    bg: "linear-gradient(180deg, rgba(59,130,246,0.15) 0%, rgba(18,22,31,0.95) 100%)",
  },
  epic: {
    label: "Epik",
    color: "#A855F7",
    glow: "rgba(168,85,247,0.5)",
    bg: "linear-gradient(180deg, rgba(168,85,247,0.2) 0%, rgba(18,22,31,0.95) 100%)",
  },
  legend: {
    label: "Afsonaviy",
    color: "#EAB308",
    glow: "rgba(234,179,8,0.6)",
    bg: "linear-gradient(180deg, rgba(234,179,8,0.25) 0%, rgba(18,22,31,0.95) 100%)",
  },
  myth: {
    label: "Mif",
    color: "#EF4444",
    glow: "rgba(239,68,68,0.7)",
    bg: "linear-gradient(180deg, rgba(239,68,68,0.3) 0%, rgba(18,22,31,0.95) 100%)",
  },
};
const RARITY_ORDER = ["common", "rare", "epic", "legend", "myth"];
const ICONS = [Sword, Shield, Zap, Gem, Flame, Star, Crown];

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return h;
}
const iconFor = (id) => ICONS[Math.abs(hash(String(id))) % ICONS.length];
const fmt = (n) =>
  (+n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const norm = (o) => (o ? { ...o, id: o._id || o.id } : o);

function Thumb({ image, color, glow, Icon, size = 32 }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="w-full h-full flex items-center justify-center p-1.5 relative overflow-hidden">
      {image && !imgError ? (
        <img
          src={image}
          alt="skin"
          onError={() => setImgError(true)}
          className="w-full h-full object-contain drop-shadow-[0_5px_10px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-110"
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center"
          style={{
            background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`,
          }}
        >
          <Icon
            size={size}
            color={color}
            strokeWidth={1.5}
            style={{ filter: `drop-shadow(0 0 10px ${color})` }}
          />
        </div>
      )}
    </div>
  );
}

function ScreenHeader({ title, sub, right }) {
  return (
    <div className="flex items-center justify-between px-5 pt-6 pb-4">
      <div>
        <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
          {title}
        </h1>
        {sub && <p className="text-xs mt-0.5 text-gray-400">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

function SkinCard({ skin, onClick, badge, size = "md" }) {
  const R = RARITY[skin.rarity] || RARITY.common;
  const Icon = iconFor(skin.id);
  const h = size === "lg" ? "h-36" : size === "sm" ? "h-24" : "h-28";
  return (
    <button
      onClick={onClick}
      className="relative rounded-xl overflow-hidden text-left w-full transition-all duration-200 hover:-translate-y-1 active:scale-[0.97] bg-[#12161f] border border-white/5 hover:border-[#00ff66]/50 group"
      style={{ boxShadow: `0 4px 20px ${R.glow}` }}
    >
      <div className={`relative ${h} flex items-center justify-center`} style={{ background: R.bg }}>
        <Thumb image={skin.image} color={R.color} glow={R.glow} Icon={Icon} size={36} />
        {badge}
      </div>
      <div className="p-2.5 bg-[#0f131a]">
        <div className="text-xs font-bold text-white truncate group-hover:text-[#00ff66] transition-colors">
          {skin.name}
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <span
            className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-black/50 border border-white/5"
            style={{ color: R.color }}
          >
            {R.label}
          </span>
          <span className="text-xs font-extrabold text-[#00ff66] font-mono">
            ${fmt(skin.price)}
          </span>
        </div>
      </div>
    </button>
  );
}

/* ---------------------------------------------------------------
   ROULETTE REEL ANIMATION
----------------------------------------------------------------*/
function MiniReel({ skins, winner, height, itemWidth, onDone }) {
  const containerRef = useRef(null);
  const [items, setItems] = useState([]);
  const [offset, setOffset] = useState(0);
  const [started, setStarted] = useState(false);
  const DURATION = 4.2;

  useEffect(() => {
    const WIN_INDEX = 35;
    const arr = Array.from(
      { length: 42 },
      () => skins[Math.floor(Math.random() * skins.length)] || winner,
    );
    arr[WIN_INDEX] = winner;
    setItems(arr);

    const raf1 = requestAnimationFrame(() => {
      const w = containerRef.current?.offsetWidth || itemWidth * 3;
      const randomPadding = Math.random() * (itemWidth * 0.6) - itemWidth * 0.3;
      const target = -(WIN_INDEX * itemWidth + itemWidth / 2 - w / 2) + randomPadding;

      const raf2 = requestAnimationFrame(() => {
        setOffset(target);
        setStarted(true);
      });
      return () => cancelAnimationFrame(raf2);
    });

    const t = setTimeout(() => onDone && onDone(), DURATION * 1000 + 100);
    return () => {
      cancelAnimationFrame(raf1);
      clearTimeout(t);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative rounded-2xl overflow-hidden bg-[#07090e] border-2 border-[#00ff66]/30 shadow-[0_0_25px_rgba(0,255,102,0.15)] my-2"
      style={{ height }}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-[#00ff66] drop-shadow-[0_0_8px_#00ff66]" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-30 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[12px] border-b-[#00ff66] drop-shadow-[0_0_8px_#00ff66]" />
      
      <div className="absolute left-1/2 top-0 bottom-0 w-[2px] z-20 bg-[#00ff66] shadow-[0_0_15px_#00ff66] opacity-80" />
      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-[#07090e] via-transparent to-[#07090e] opacity-90" />

      <div
        className="flex h-full items-center absolute left-0 top-0"
        style={{
          transform: `translateX(${offset}px)`,
          transition: started
            ? `transform ${DURATION}s cubic-bezier(0.12, 0.8, 0.15, 1)`
            : "none",
        }}
      >
        {items.map((s, i) => {
          const R = RARITY[s?.rarity] || RARITY.common;
          const Icon = iconFor(s?.id || i);
          return (
            <div
              key={i}
              className="flex-shrink-0 flex items-center justify-center p-1"
              style={{ width: itemWidth, height }}
            >
              <div
                className="w-full h-full rounded-xl overflow-hidden flex flex-col items-center justify-between p-1.5 border relative group"
                style={{
                  background: R.bg,
                  borderColor: `${R.color}88`,
                  boxShadow: `inset 0 0 15px ${R.glow}`,
                }}
              >
                <div className="w-full h-full relative flex items-center justify-center">
                  <Thumb
                    image={s?.image}
                    color={R.color}
                    glow={R.glow}
                    Icon={Icon}
                    size={28}
                  />
                </div>
                <div
                  className="w-full h-1 rounded-full mt-1"
                  style={{ background: R.color, boxShadow: `0 0 6px ${R.color}` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   CASE DETAIL SCREEN
----------------------------------------------------------------*/
function CaseDetailScreen({
  cs,
  skins,
  balance,
  onBack,
  onBalanceChange,
  onAddTx,
  refreshInventory,
}) {
  const [qty, setQty] = useState(1);
  const [phase, setPhase] = useState("idle");
  const [winners, setWinners] = useState([]);
  const [busyQty, setBusyQty] = useState(1);
  const [doneCount, setDoneCount] = useState(0);
  const [errMsg, setErrMsg] = useState("");
  const [flashColor, setFlashColor] = useState(null);
  const [selling, setSelling] = useState(false);

  const Icon = iconFor(cs.id);

  const eligible = skins
    .filter((s) => {
      const sCaseId = typeof s.caseId === "object" ? s.caseId?._id : s.caseId;
      const currentCaseId = typeof cs.id === "object" ? cs.id?._id : cs.id;
      return sCaseId === currentCaseId && (cs.odds?.[s.rarity] || 0) > 0;
    })
    .sort(
      (a, b) =>
        RARITY_ORDER.indexOf(b.rarity) - RARITY_ORDER.indexOf(a.rarity) ||
        b.price - a.price,
    );

  const totalPrice = cs.price * qty;
  const canAfford = balance >= totalPrice;

  const handleExit = () => {
    refreshInventory();
    onBack();
  };

  useEffect(() => {
    if (phase === "spinning" && busyQty > 0 && doneCount >= busyQty) {
      setPhase("result");
      refreshInventory();
      const best = winners.reduce(
        (b, w) =>
          RARITY_ORDER.indexOf(w.skin.rarity) > RARITY_ORDER.indexOf(b)
            ? w.skin.rarity
            : b,
        "common",
      );
      if (best === "legend" || best === "myth") {
        setFlashColor(RARITY[best].color);
        setTimeout(() => setFlashColor(null), 600);
      }
    }
  }, [doneCount, phase]);

  const handleOpenClick = async () => {
    if (!canAfford || phase !== "idle") return;
    setErrMsg("");
    setPhase("fetching");
    setBusyQty(qty);
    try {
      const results = [];
      let lastBalance = balance;
      for (let i = 0; i < qty; i++) {
        const res = await client.post(`/cases/${cs.id}/open`);
        results.push({ skin: norm(res.data.skin), invId: res.data.inventoryItem._id });
        lastBalance = res.data.balance;
      }
      onBalanceChange(lastBalance);
      onAddTx(
        qty > 1 ? `Case ochish x${qty} (${cs.name})` : `Case ochish (${cs.name})`,
        -totalPrice,
      );
      setWinners(results);
      setDoneCount(0);
      setPhase("spinning");
    } catch (err) {
      setErrMsg(err.response?.data?.error || "Xatolik yuz berdi");
      setPhase("idle");
    }
  };

  const reset = () => {
    refreshInventory();
    setPhase("idle");
    setWinners([]);
    setDoneCount(0);
  };

  const handleKeepAll = () => {
    reset();
  };

  const handleSellAll = async () => {
    setSelling(true);
    let bal = balance;
    let total = 0;
    for (const w of winners) {
      try {
        const res = await client.post(`/inventory/${w.invId}/sell`);
        bal = res.data.balance;
        total += w.skin.price * 0.9;
      } catch (err) {}
    }
    onBalanceChange(bal);
    if (total > 0) {
      onAddTx(
        winners.length > 1
          ? `Sotildi (${winners.length} ta)`
          : `Sotildi: ${winners[0]?.skin.name}`,
        total,
      );
    }
    setSelling(false);
    reset();
  };

  const cols = busyQty === 1 ? 1 : busyQty <= 4 ? 2 : 3;
  const reelH = busyQty === 1 ? 130 : busyQty <= 4 ? 95 : 80;
  const reelW = busyQty === 1 ? 110 : busyQty <= 4 ? 85 : 70;

  return (
    <div className="pb-28">
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <button
          onClick={handleExit}
          className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#12161f] border border-white/10 hover:border-[#00ff66]/50 text-gray-300 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <span className="text-base font-extrabold text-white tracking-wide">
          {cs.name}
        </span>
        <div className="w-10" />
      </div>

      <div className="mx-4 rounded-2xl bg-[#12161f] border border-[#00ff66]/20 relative mb-6 p-5 overflow-hidden shadow-[0_0_30px_rgba(0,255,102,0.05)]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#00ff66]/10 via-transparent to-transparent pointer-events-none" />

        {flashColor && (
          <div
            className="absolute inset-0 pointer-events-none animate-ping opacity-60 z-40"
            style={{ background: flashColor }}
          />
        )}

        <div className="relative flex flex-col items-center">
          {phase === "idle" && (
            <>
              <div className="w-24 h-24 rounded-2xl flex items-center justify-center mb-3 bg-[#0a0d14] border border-[#00ff66]/40 shadow-[0_0_20px_rgba(0,255,102,0.2)]">
                <Thumb
                  image={cs.image}
                  color={cs.color || "#00ff66"}
                  glow={cs.color || "#00ff66"}
                  Icon={Icon}
                  size={46}
                />
              </div>
              <div className="text-xl font-black text-white mb-1 tracking-tight">
                {cs.name}
              </div>
              <div className="flex items-center gap-1.5 mb-5 font-mono text-lg font-black text-[#00ff66]">
                ${fmt(cs.price)}
              </div>
            </>
          )}

          {errMsg && (
            <div className="w-full mb-3 text-xs font-bold text-red-500 text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">
              {errMsg}
            </div>
          )}

          {phase === "idle" && (
            <>
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-black bg-[#0a0d14] border border-white/10 text-white hover:border-[#00ff66]/50"
                >
                  −
                </button>
                <span className="text-base font-black text-white w-6 text-center font-mono">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => Math.min(10, q + 1))}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-black bg-[#0a0d14] border border-white/10 text-white hover:border-[#00ff66]/50"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleOpenClick}
                disabled={!canAfford}
                className={`w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-wider transition-all duration-200 ${
                  canAfford
                    ? "bg-[#00ff66] text-black shadow-[0_0_20px_rgba(0,255,102,0.4)] hover:bg-[#00e65c] active:scale-[0.98]"
                    : "bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5"
                }`}
              >
                {canAfford ? `Ochish — $${fmt(totalPrice)}` : "Balans yetarli emas"}
              </button>
            </>
          )}

          {phase === "fetching" && (
            <div className="w-full py-8 text-center">
              <div className="text-xs font-black uppercase tracking-widest text-[#00ff66] animate-pulse">
                Case aylanmoqda...
              </div>
            </div>
          )}

          {phase === "spinning" && (
            <div
              className="w-full grid gap-2"
              style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}
            >
              {winners.map((w, i) => (
                <MiniReel
                  key={i}
                  skins={eligible}
                  winner={w.skin}
                  height={reelH}
                  itemWidth={reelW}
                  onDone={() => setDoneCount((c) => c + 1)}
                />
              ))}
            </div>
          )}

          {phase === "result" && (
            <div className="w-full">
              <div
                className="grid gap-2 mb-3"
                style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}
              >
                {winners.map((w, i) => {
                  const R = RARITY[w.skin.rarity] || RARITY.common;
                  const Ic = iconFor(w.skin.id);
                  return (
                    <div
                      key={i}
                      className="relative rounded-xl overflow-hidden animate-[dropIn_.4s_ease-out] border flex flex-col items-center justify-center p-2"
                      style={{
                        height: busyQty === 1 ? 140 : 105,
                        background: R.bg,
                        borderColor: R.color,
                        boxShadow: `0 0 25px ${R.glow}`,
                      }}
                    >
                      <Thumb
                        image={w.skin.image}
                        color={R.color}
                        glow={R.glow}
                        Icon={Ic}
                        size={busyQty === 1 ? 48 : 32}
                      />
                      <div className="mt-1 text-[10px] font-black text-center text-white truncate w-full bg-black/60 rounded py-0.5 px-1">
                        {w.skin.name}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="text-xs font-bold text-center mb-3 text-gray-400">
                Jami qiymat:{" "}
                <span className="text-[#00ff66] font-mono font-extrabold text-sm">
                  ${fmt(winners.reduce((a, w) => a + w.skin.price, 0))}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSellAll}
                  disabled={selling}
                  className="flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider bg-[#00ff66] text-black shadow-[0_0_15px_rgba(0,255,102,0.3)] hover:bg-[#00e65c] flex items-center justify-center gap-1.5"
                >
                  <Tag size={14} />
                  {selling
                    ? "Sotilmoqda..."
                    : busyQty === 1
                    ? `Sotish — $${fmt((winners[0]?.skin.price || 0) * 0.9)}`
                    : "Hammasini sotish"}
                </button>
                <button
                  onClick={handleKeepAll}
                  className="flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider bg-[#0a0d14] text-white border border-white/10 hover:border-white/30"
                >
                  Inventarga saqlash
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 flex items-center justify-between mb-3">
        <h2 className="text-sm font-black text-white uppercase tracking-wider">
          Mavjud Skinlar
        </h2>
        <span className="text-xs font-bold text-[#00ff66]">
          {eligible.length} ta
        </span>
      </div>
      <div className="px-4 grid grid-cols-2 gap-3">
        {eligible.map((s) => (
          <SkinCard key={s.id} skin={s} size="lg" />
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   SCREENS
----------------------------------------------------------------*/
function CaseTile({ cs, onClick }) {
  const Icon = iconFor(cs.id);
  return (
    <button
      onClick={onClick}
      className="rounded-2xl p-3.5 flex flex-col items-center gap-2 transition-all duration-200 hover:-translate-y-1 active:scale-95 bg-[#12161f] border border-white/5 hover:border-[#00ff66]/50 group shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
    >
      <div className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center bg-[#0a0d14] border border-white/5 group-hover:border-[#00ff66]/30">
        <Thumb
          image={cs.image}
          color={cs.color || "#00ff66"}
          glow={`${cs.color || "#00ff66"}44`}
          Icon={Icon}
          size={24}
        />
      </div>
      <div className="text-xs font-bold text-center text-white truncate w-full group-hover:text-[#00ff66] transition-colors">
        {cs.name}
      </div>
      <div className="text-xs font-black text-[#00ff66] font-mono">
        ${fmt(cs.price)}
      </div>
    </button>
  );
}

function HomeScreen({
  balance,
  user,
  cases,
  skins,
  onOpenCase,
  dailyAvailable,
  dailyClaimedAt,
  onDaily,
  nav,
  onAdmin,
}) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (dailyAvailable) {
      setTimeLeft("");
      return;
    }

    if (!dailyClaimedAt) {
      setTimeLeft("Ertaga");
      return;
    }

    const updateTimer = () => {
      const lastClaim = typeof dailyClaimedAt === 'number' ? dailyClaimedAt : new Date(dailyClaimedAt).getTime();
      const targetTime = lastClaim + 24 * 60 * 60 * 1000;
      const now = Date.now();
      const diff = targetTime - now;

      if (diff <= 0) {
        setTimeLeft("00:00:00");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [dailyAvailable, dailyClaimedAt]);

  const topCarouselSkins = useMemo(() => {
    const filtered = skins.filter(s => s.rarity === "legend" || s.rarity === "myth");
    return filtered.length > 0 ? filtered : skins.slice(0, 5);
  }, [skins]);

  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    if (topCarouselSkins.length <= 1) return;
    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % topCarouselSkins.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [topCarouselSkins.length]);

  return (
    <div className="pb-28">
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">
            Salom, <span className="text-[#00ff66]">{user.name}</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Bugun omadingizni sinab ko‘ring
          </p>
        </div>
        <button
          onClick={onAdmin}
          className="w-10 h-10 rounded-xl bg-[#12161f] border border-white/10 flex items-center justify-center text-gray-300 hover:text-[#00ff66] hover:border-[#00ff66]/50 transition-colors"
        >
          <Settings size={18} />
        </button>
      </div>

      <div className="mx-4 rounded-2xl p-5 relative overflow-hidden mb-5 bg-[#12161f] border border-[#00ff66]/30 shadow-[0_0_25px_rgba(0,255,102,0.1)]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ff66]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative flex justify-between items-end">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
              <Wallet size={12} className="text-[#00ff66]" /> Balans
            </div>
            <div className="text-3xl font-black text-white mt-1 font-mono tracking-tight">
              ${fmt(balance)}
            </div>
          </div>
          <button
            onClick={() => nav("balance")}
            className="px-4 py-2 rounded-xl text-xs font-black bg-[#00ff66] text-black shadow-[0_0_15px_rgba(0,255,102,0.3)] hover:bg-[#00e65c] transition-all flex items-center gap-1"
          >
            To‘ldirish <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* KUNLIK BONUS QISMI ($1.00 va Keyingi Bonus Ertaga) */}
      <div className="mx-4 mb-6 rounded-xl p-3.5 flex items-center justify-between bg-[#12161f] border border-white/5">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              dailyAvailable
                ? "bg-[#00ff66] text-black shadow-[0_0_12px_rgba(0,255,102,0.4)]"
                : "bg-gray-800 text-gray-500"
            }`}
          >
            <Gift size={20} />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Kunlik Bonus</div>
            <div className="text-[10px] text-gray-400 font-medium">
              {dailyAvailable ? "+$1.00 tayyor" : `Keyingi Bonus Ertaga (${timeLeft || "24:00:00"})`}
            </div>
          </div>
        </div>
        <button
          onClick={onDaily}
          disabled={!dailyAvailable}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
            dailyAvailable
              ? "bg-[#00ff66] text-black hover:bg-[#00e65c]"
              : "bg-gray-800 text-gray-400 cursor-not-allowed font-mono"
          }`}
        >
          {dailyAvailable ? "Olish" : "Ertaga"}
        </button>
      </div>

      <div className="px-4 flex items-center justify-between mb-3">
        <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
          <Package size={16} className="text-[#00ff66]" /> Case'lar
        </h2>
        <button
          onClick={() => nav("cases")}
          className="text-xs font-extrabold text-[#00ff66] hover:underline flex items-center gap-0.5"
        >
          Barchasi <ChevronRight size={13} />
        </button>
      </div>
      <div className="px-4 grid grid-cols-3 gap-3">
        {cases.map((cs) => (
          <CaseTile key={cs.id} cs={cs} onClick={() => onOpenCase(cs)} />
        ))}
      </div>

      {/* TOP SKINLAR */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={16} className="text-[#00ff66]" /> Top Skinlar
          </h2>
          <div className="flex gap-1">
            {topCarouselSkins.map((_, idx) => (
              <span
                key={idx}
                className={`h-1 rounded-full transition-all duration-300 ${
                  carouselIndex === idx ? "w-4 bg-[#00ff66]" : "w-1.5 bg-gray-700"
                }`}
              />
            ))}
          </div>
        </div>

        {topCarouselSkins.length > 0 ? (
          <div className="overflow-hidden relative rounded-xl">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
            >
              {topCarouselSkins.map((s) => (
                <div key={s.id} className="w-full flex-shrink-0">
                  <SkinCard skin={s} size="lg" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {skins.slice(0, 3).map((s) => (
              <SkinCard key={s.id} skin={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CasesScreen({ cases, onOpenCase }) {
  return (
    <div className="pb-28">
      <ScreenHeader title="Case'lar" sub="Ochib, noyob skinlarga ega bo‘ling" />
      <div className="px-4 flex flex-col gap-3">
        {cases.map((cs) => {
          const Icon = iconFor(cs.id);
          return (
            <button
              key={cs.id}
              onClick={() => onOpenCase(cs)}
              className="rounded-2xl p-4 flex items-center justify-between bg-[#12161f] border border-white/5 hover:border-[#00ff66]/40 transition-all duration-200 active:scale-[0.98] group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-xl bg-[#0a0d14] border border-white/5 flex items-center justify-center group-hover:border-[#00ff66]/30">
                  <Thumb
                    image={cs.image}
                    color={cs.color || "#00ff66"}
                    glow={`${cs.color || "#00ff66"}33`}
                    Icon={Icon}
                    size={28}
                  />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-white group-hover:text-[#00ff66] transition-colors">
                    {cs.name}
                  </div>
                  <div className="flex gap-1 mt-2">
                    {RARITY_ORDER.map((r) => (
                      <span
                        key={r}
                        className="w-2 h-2 rounded-full"
                        style={{
                          background: RARITY[r].color,
                          opacity: (cs.odds?.[r] || 0) / 60 + 0.3,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black text-[#00ff66] font-mono">
                  ${fmt(cs.price)}
                </div>
                <div className="text-[10px] font-bold text-gray-500 uppercase mt-0.5">
                  Ko'rish →
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, text, sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#12161f] border border-white/10 flex items-center justify-center mb-4 text-gray-500">
        <Icon size={28} />
      </div>
      <div className="text-sm font-bold text-white">{text}</div>
      <div className="text-xs text-gray-400 mt-1">{sub}</div>
    </div>
  );
}

function InventoryScreen({ inventory, onSell }) {
  return (
    <div className="pb-28">
      <ScreenHeader title="Inventar" sub={`${inventory.length} ta buyum`} />
      {inventory.length === 0 ? (
        <EmptyState
          icon={Package}
          text="Hali skiningiz yo‘q"
          sub="Case ochib birinchi skiningizni oling"
        />
      ) : (
        <div className="px-4 grid grid-cols-3 gap-3">
          {inventory.map((s, i) => (
            <SkinCard
              key={s._invId || i}
              skin={s}
              onClick={() => onSell(i)}
              badge={
                <span className="absolute top-1.5 right-1.5 text-[8px] px-1.5 py-0.5 rounded font-black bg-[#00ff66] text-black shadow">
                  Sotish
                </span>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MarketplaceScreen({ listings, balance, onBuy }) {
  return (
    <div className="pb-28">
      <ScreenHeader
        title="Marketplace"
        sub="Boshqa userlar sotuvidagi skinlar"
      />
      <div className="px-4 grid grid-cols-3 gap-3">
        {listings.map((l, i) => (
          <div key={l._id || i} className="relative">
            <SkinCard
              skin={l.skin}
              onClick={() => balance >= l.price && onBuy(l._id)}
            />
            <div className="absolute bottom-[38px] left-1.5 right-1.5 text-[8px] truncate font-bold text-gray-400">
              @{l.seller}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BalanceScreen({ balance, txs, onDeposit }) {
  const [amt, setAmt] = useState("10");
  return (
    <div className="pb-28">
      <ScreenHeader title="Balans" />
      <div className="mx-4 rounded-2xl p-5 mb-5 bg-[#12161f] border border-[#00ff66]/30 shadow-[0_0_20px_rgba(0,255,102,0.08)]">
        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          Joriy balans
        </div>
        <div className="text-3xl font-black text-white mt-1 font-mono">
          ${fmt(balance)}
        </div>
        <div className="flex gap-2 mt-4">
          <input
            value={amt}
            onChange={(e) => setAmt(e.target.value.replace(/[^0-9.]/g, ""))}
            className="flex-1 rounded-xl px-3 py-2.5 text-sm font-bold bg-[#0a0d14] border border-white/10 text-white outline-none focus:border-[#00ff66]"
          />
          <button
            onClick={() => onDeposit(parseFloat(amt) || 0)}
            className="px-4 rounded-xl text-xs font-black bg-[#00ff66] text-black shadow-[0_0_15px_rgba(0,255,102,0.3)] hover:bg-[#00e65c]"
          >
            + Deposit
          </button>
        </div>
        <p className="text-[10px] mt-2.5 text-gray-500 font-medium">
          Demo rejimi — virtual balans (real to‘lov ulanmagan)
        </p>
      </div>

      <div className="px-4 flex items-center gap-2 mb-3">
        <History size={16} className="text-[#00ff66]" />
        <h2 className="text-sm font-black text-white uppercase tracking-wider">
          Tranzaksiyalar
        </h2>
      </div>
      <div className="px-4 flex flex-col gap-2">
        {txs.length === 0 && (
          <div className="text-xs text-gray-500">Hozircha tranzaksiya yo‘q</div>
        )}
        {txs.map((t, i) => (
          <div
            key={i}
            className="rounded-xl px-3.5 py-3 flex items-center justify-between bg-[#12161f] border border-white/5"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  t.amt > 0 ? "bg-[#00ff66]/10 text-[#00ff66]" : "bg-red-500/10 text-red-500"
                }`}
              >
                {t.amt > 0 ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
              </div>
              <div>
                <div className="text-xs font-bold text-white">{t.label}</div>
                <div className="text-[10px] text-gray-500">{t.time}</div>
              </div>
            </div>
            <div
              className={`text-xs font-black font-mono ${
                t.amt > 0 ? "text-[#00ff66]" : "text-red-500"
              }`}
            >
              {t.amt > 0 ? "+" : ""}
              {fmt(t.amt)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileScreen({ user, balance, inventory, refCode, refStats }) {
  const [copied, setCopied] = useState(false);
  const link = `t.me/UzSkinBot?start=${refCode}`;
  return (
    <div className="pb-28">
      <ScreenHeader title="Profil" />
      <div className="mx-4 rounded-2xl p-4 flex items-center gap-3.5 mb-4 bg-[#12161f] border border-white/5">
        <div className="w-14 h-14 rounded-2xl bg-[#00ff66] text-black font-black text-xl flex items-center justify-center shadow-[0_0_15px_rgba(0,255,102,0.3)]">
          {(user.name || "U")[0]}
        </div>
        <div>
          <div className="text-base font-extrabold text-white">{user.name}</div>
          <div className="text-xs text-gray-400">@{user.username || "user"}</div>
        </div>
      </div>

      <div className="mx-4 grid grid-cols-3 gap-2 mb-5">
        {[
          ["Balans", `$${fmt(balance)}`],
          ["Skinlar", inventory.length],
          ["Jami Ochilgan Caselar", user.opened],
        ].map(([l, v]) => (
          <div key={l} className="rounded-xl p-3 text-center bg-[#12161f] border border-white/5">
            <div className="text-sm font-black text-white font-mono">{v}</div>
            <div className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
              {l}
            </div>
          </div>
        ))}
      </div>

      <div className="mx-4 rounded-2xl p-4 mb-5 bg-[#12161f] border border-[#00ff66]/20">
        <div className="flex items-center gap-2 mb-3">
          <Users size={16} className="text-[#00ff66]" />
          <span className="text-sm font-black text-white uppercase tracking-wider">
            Referral System
          </span>
        </div>
        <div className="flex gap-6 mb-3">
          <div>
            <div className="text-base font-black text-white font-mono">
              {refStats.count}
            </div>
            <div className="text-[10px] text-gray-400 uppercase font-bold">
              Takliflar
            </div>
          </div>
          <div>
            <div className="text-base font-black text-[#00ff66] font-mono">
              ${fmt(refStats.earned)}
            </div>
            <div className="text-[10px] text-gray-400 uppercase font-bold">
              Ishlangan Bonus
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 bg-[#0a0d14] border border-white/10">
          <span className="flex-1 text-xs truncate text-gray-400 font-mono">
            {link}
          </span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(link).catch(() => {});
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? (
              <Check size={16} className="text-[#00ff66]" />
            ) : (
              <Users size={16} className="text-gray-400 hover:text-[#00ff66]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   EXTENDED ADMIN PANEL & COMPACT ROW LAYOUTS
----------------------------------------------------------------*/
function NumField({ label, value, onChange, placeholder = "" }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-bold text-gray-400">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl px-3 py-2 text-xs font-medium bg-[#0a0d14] border border-white/10 text-white outline-none focus:border-[#00ff66]"
      />
    </label>
  );
}

/* SKIN MODAL */
function SkinModal({ isOpen, onClose, skin, onSave, cases }) {
  const [f, setF] = useState({
    name: "",
    type: "Miltiq",
    rarity: "common",
    price: "1",
    image: "",
    caseId: "",
  });

  useEffect(() => {
    if (skin) {
      setF({
        name: skin.name || "",
        type: skin.type || "Miltiq",
        rarity: skin.rarity || "common",
        price: skin.price?.toString() || "1",
        image: skin.image || "",
        caseId: skin.caseId?._id || skin.caseId || (cases[0]?.id || ""),
      });
    } else {
      setF({ 
        name: "", 
        type: "Miltiq", 
        rarity: "common", 
        price: "1", 
        image: "", 
        caseId: cases[0]?.id || "" 
      });
    }
  }, [skin, isOpen, cases]);

  if (!isOpen) return null;

  const set = (key) => (val) => setF((prev) => ({ ...prev, [key]: val }));

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-[340px] rounded-2xl p-5 bg-[#12161f] border border-[#00ff66]/30 shadow-2xl relative animate-[dropIn_.25s_ease-out]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={18} />
        </button>
        <div className="text-sm font-black uppercase text-white mb-4 flex items-center gap-1.5">
          <Sword size={16} className="text-[#00ff66]" />
          {skin ? "Skinni Tahrirlash" : "Yangi Skin Qo'shish"}
        </div>
        <div className="flex flex-col gap-2.5">
          <NumField label="Nomi" value={f.name} onChange={set("name")} placeholder="AK-47 | Redline" />
          <div className="grid grid-cols-2 gap-2">
            <NumField label="Turi" value={f.type} onChange={set("type")} />
            <NumField label="Narxi ($)" value={f.price} onChange={set("price")} />
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-gray-400">Case (Qaysi case'ga tegishli)</span>
            <select
              value={f.caseId}
              onChange={(e) => set("caseId")(e.target.value)}
              className="rounded-xl px-3 py-2 text-xs font-medium bg-[#0a0d14] border border-white/10 text-white outline-none"
            >
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (${fmt(c.price)})
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-gray-400">Rarity</span>
            <select
              value={f.rarity}
              onChange={(e) => set("rarity")(e.target.value)}
              className="rounded-xl px-3 py-2 text-xs font-medium bg-[#0a0d14] border border-white/10 text-white outline-none"
            >
              {RARITY_ORDER.map((r) => (
                <option key={r} value={r}>
                  {RARITY[r].label}
                </option>
              ))}
            </select>
          </label>
          <NumField label="Rasm URL" value={f.image} onChange={set("image")} placeholder="https://..." />
          <button
            onClick={() => {
              if (!f.name.trim()) return alert("Nomini kiriting!");
              if (!f.caseId) return alert("Case tanlanishi shart!");
              onSave({
                ...f,
                price: parseFloat(f.price) || 0,
              });
            }}
            className="mt-3 w-full py-3 rounded-xl text-xs font-black bg-[#00ff66] text-black shadow-[0_0_15px_rgba(0,255,102,0.3)] hover:bg-[#00e65c] transition-all"
          >
            {skin ? "Saqlash" : "Qo'shish"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* CASE MODAL */
function CaseModal({ isOpen, onClose, cs, onSave }) {
  const [f, setF] = useState({
    name: "",
    price: "5",
    color: "#00ff66",
    image: "",
    common: "50",
    rare: "30",
    epic: "14",
    legend: "5",
    myth: "1",
  });

  useEffect(() => {
    if (cs) {
      setF({
        name: cs.name || "",
        price: cs.price?.toString() || "5",
        color: cs.color || "#00ff66",
        image: cs.image || "",
        common: cs.odds?.common?.toString() || "50",
        rare: cs.odds?.rare?.toString() || "30",
        epic: cs.odds?.epic?.toString() || "14",
        legend: cs.odds?.legend?.toString() || "5",
        myth: cs.odds?.myth?.toString() || "1",
      });
    } else {
      setF({
        name: "",
        price: "5",
        color: "#00ff66",
        image: "",
        common: "50",
        rare: "30",
        epic: "14",
        legend: "5",
        myth: "1",
      });
    }
  }, [cs, isOpen]);

  if (!isOpen) return null;

  const set = (key) => (val) => setF((prev) => ({ ...prev, [key]: val }));
  const sum = ["common", "rare", "epic", "legend", "myth"].reduce(
    (a, r) => a + (parseFloat(f[r]) || 0),
    0,
  );

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-[340px] rounded-2xl p-5 bg-[#12161f] border border-[#00ff66]/30 shadow-2xl relative animate-[dropIn_.25s_ease-out]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={18} />
        </button>
        <div className="text-sm font-black uppercase text-white mb-4 flex items-center gap-1.5">
          <Package size={16} className="text-[#00ff66]" />
          {cs ? "Caseni Tahrirlash" : "Yangi Case Qo'shish"}
        </div>
        <div className="flex flex-col gap-2.5">
          <NumField label="Nomi" value={f.name} onChange={set("name")} placeholder="Weapon Case #1" />
          <NumField label="Narxi ($)" value={f.price} onChange={set("price")} />
          <NumField label="Rasm URL" value={f.image} onChange={set("image")} placeholder="https://..." />
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-gray-400">Ehtimollar (%)</span>
              <span className={`text-[10px] font-extrabold ${Math.round(sum) === 100 ? "text-[#00ff66]" : "text-red-500"}`}>
                Jami: {sum.toFixed(1)}%
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {RARITY_ORDER.map((r) => (
                <label key={r} className="flex flex-col gap-1 items-center">
                  <span className="text-[8px] font-bold uppercase" style={{ color: RARITY[r].color }}>
                    {RARITY[r].label}
                  </span>
                  <input
                    value={f[r]}
                    onChange={(e) => set(r)(e.target.value)}
                    className="w-full text-center rounded-lg py-1.5 text-[10px] font-bold bg-[#0a0d14] border border-white/10 text-white outline-none"
                  />
                </label>
              ))}
            </div>
          </div>
          <button
            onClick={() => {
              if (!f.name.trim()) return alert("Nomini kiriting!");
              onSave({
                name: f.name,
                price: parseFloat(f.price) || 0,
                color: f.color,
                image: f.image,
                odds: {
                  common: +f.common || 0,
                  rare: +f.rare || 0,
                  epic: +f.epic || 0,
                  legend: +f.legend || 0,
                  myth: +f.myth || 0,
                },
              });
            }}
            className="mt-3 w-full py-3 rounded-xl text-xs font-black bg-[#00ff66] text-black shadow-[0_0_15px_rgba(0,255,102,0.3)] hover:bg-[#00e65c] transition-all"
          >
            {cs ? "Saqlash" : "Qo'shish"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* REAL TELEGRAM USERS TAB */
function AdminUsersTab({ client: adminClient }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await adminClient.get("/admin/users");
      const list = Array.isArray(res.data) ? res.data : (res.data.users || res.data.data || []);
      setUsers(list);
    } catch (err) {
      setErrorMsg("Foydalanuvchilar ro'yxatini yuklashda xatolik yuz berdi");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateBalance = async (userId, currentBal) => {
    const val = prompt("Yangi balansni kiriting ($):", currentBal);
    if (val === null) return;
    const amount = parseFloat(val);
    if (isNaN(amount)) return alert("Noto'g'ri qiymat!");
    try {
      await adminClient.patch(`/admin/users/${userId}/balance`, { balance: amount });
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, balance: amount } : u))
      );
    } catch (err) {
      alert("Balansni o'zgartirib bo'lmadi");
    }
  };

  const handleToggleBan = async (userId, currentStatus) => {
    try {
      await adminClient.patch(`/admin/users/${userId}/ban`, { isBlocked: !currentStatus });
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isBlocked: !currentStatus } : u))
      );
    } catch (err) {
      alert("Foydalanuvchi holatini o'zgartirib bo'lmadi");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      (u.firstName || u.first_name || u.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.username || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.telegramId || "").toString().includes(search)
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-3 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="User / Telegram ID qidirish..."
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-[#12161f] border border-white/10 text-white outline-none focus:border-[#00ff66]"
          />
        </div>
        <button
          onClick={fetchUsers}
          className="p-2.5 rounded-xl bg-[#12161f] border border-white/10 text-gray-300 hover:text-[#00ff66]"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {errorMsg && (
        <div className="text-xs font-bold text-red-500 bg-red-500/10 p-2.5 rounded-xl border border-red-500/20 text-center">
          {errorMsg}
        </div>
      )}

      {filteredUsers.length === 0 && !loading && !errorMsg && (
        <div className="text-xs text-gray-500 text-center py-8">
          Foydalanuvchilar topilmadi
        </div>
      )}

      <div className="flex flex-col gap-2">
        {filteredUsers.map((u) => {
          const name = u.firstName || u.first_name || u.name || u.username || "Telegram User";
          return (
            <div
              key={u._id}
              className="rounded-xl p-3 bg-[#12161f] border border-white/5 flex items-center justify-between gap-2 hover:border-white/10 transition-colors"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-[#0a0d14] font-black text-xs text-[#00ff66] flex items-center justify-center shrink-0 border border-white/5">
                  {name[0]}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                    {name}
                    {u.isAdmin && (
                      <span className="text-[8px] bg-[#00ff66]/20 text-[#00ff66] font-black px-1 rounded">
                        ADMIN
                      </span>
                    )}
                    {u.isBlocked && (
                      <span className="text-[8px] bg-red-500/20 text-red-400 font-black px-1 rounded">
                        BLOKLANGAN
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono truncate">
                    @{u.username || "no_user"} ·{" "}
                    <span className="text-[#00ff66] font-bold">${fmt(u.balance || 0)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleUpdateBalance(u._id, u.balance || 0)}
                  className="p-1.5 rounded-lg bg-[#0a0d14] border border-white/10 text-gray-300 hover:text-[#00ff66]"
                  title="Balansni o'zgartirish"
                >
                  <Edit size={13} />
                </button>
                <button
                  onClick={() => handleToggleBan(u._id, u.isBlocked)}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    u.isBlocked
                      ? "bg-red-500/20 text-red-400 border-red-500/30"
                      : "bg-[#0a0d14] border-white/10 text-gray-400 hover:text-red-400"
                  }`}
                  title={u.isBlocked ? "Blokdan chiqarish" : "Bloklash"}
                >
                  <Ban size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdminStatsTab({ casesCount, skinsCount }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl p-3 bg-[#12161f] border border-white/5 flex flex-col gap-1">
          <div className="text-[10px] font-bold uppercase text-gray-400 flex items-center gap-1">
            <Package size={12} className="text-[#00ff66]" /> Case'lar
          </div>
          <div className="text-lg font-black text-white font-mono">{casesCount} ta</div>
        </div>
        <div className="rounded-xl p-3 bg-[#12161f] border border-white/5 flex flex-col gap-1">
          <div className="text-[10px] font-bold uppercase text-gray-400 flex items-center gap-1">
            <Sword size={12} className="text-[#00ff66]" /> Skinlar
          </div>
          <div className="text-lg font-black text-white font-mono">{skinsCount} ta</div>
        </div>
      </div>

      <div className="rounded-2xl p-4 bg-[#12161f] border border-[#00ff66]/20">
        <div className="text-xs font-black text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <BarChart3 size={14} className="text-[#00ff66]" /> Server Holati
        </div>
        <div className="flex flex-col gap-2 text-xs text-gray-400">
          <div className="flex justify-between border-b border-white/5 pb-1.5">
            <span>Server Status:</span>
            <span className="text-[#00ff66] font-extrabold">Online (Active)</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-1.5">
            <span>API Protokol:</span>
            <span className="text-white font-mono font-bold">HTTPS / WebSocket</span>
          </div>
          <div className="flex justify-between">
            <span>Versiya:</span>
            <span className="text-gray-300 font-mono">v2.4.0 Pro Admin</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* MAIN ADMIN SCREEN */
function AdminScreen({
  cases,
  skins,
  onAddCase,
  onUpdateCase,
  onAddSkin,
  onUpdateSkin,
  onDeleteCase,
  onDeleteSkin,
  onClose,
  token,
}) {
  const adminClient = useMemo(() => createAdminClient(token), [token]);
  const [tab, setTab] = useState("skins");
  const [mounted, setMounted] = useState(false);

  const [skinModalOpen, setSkinModalOpen] = useState(false);
  const [editingSkin, setEditingSkin] = useState(null);

  const [caseModalOpen, setCaseModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState(null);

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const handleSaveSkin = async (data) => {
    try {
      if (editingSkin) {
        const res = await adminClient.put(`/admin/skins/${editingSkin.id}`, data);
        onUpdateSkin(norm(res.data));
      } else {
        const res = await adminClient.post("/admin/skins", data);
        onAddSkin(norm(res.data));
      }
      setSkinModalOpen(false);
      setEditingSkin(null);
    } catch (err) {
      alert(err.response?.data?.error || "Xatolik yuz berdi");
    }
  };

  const handleSaveCase = async (data) => {
    try {
      if (editingCase) {
        const res = await adminClient.put(`/admin/cases/${editingCase.id}`, data);
        onUpdateCase(norm(res.data));
      } else {
        const res = await adminClient.post("/admin/cases", data);
        onAddCase(norm(res.data));
      }
      setCaseModalOpen(false);
      setEditingCase(null);
    } catch (err) {
      alert(err.response?.data?.error || "Xatolik yuz berdi");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      style={{
        opacity: mounted ? 1 : 0,
        transition: "opacity .25s ease",
      }}
    >
      <div
        className="w-full max-w-[380px] h-[700px] rounded-3xl overflow-hidden flex flex-col bg-[#0a0d14] border border-white/10 shadow-2xl"
        style={{
          transform: mounted
            ? "translateY(0) scale(1)"
            : "translateY(16px) scale(0.98)",
          transition: "transform .28s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <div className="flex items-center gap-2 px-4 pt-5 pb-3">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#12161f] border border-white/10 flex items-center justify-center text-gray-300 hover:text-white"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="text-sm font-black text-white flex items-center gap-1.5">
              Admin Panel <ShieldCheck size={14} className="text-[#00ff66]" />
            </div>
            <div className="text-[10px] text-gray-400">Boshqaruv markazi</div>
          </div>
        </div>

        <div className="flex gap-1.5 px-4 mb-3 overflow-x-auto custom-scrollbar pb-1">
          {[
            ["stats", "Stats"],
            ["users", "Users"],
            ["cases", "Case'lar"],
            ["skins", "Skinlar"],
          ].map(([id, l]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-3 py-1.5 rounded-full text-xs font-black shrink-0 transition-colors ${
                tab === id
                  ? "bg-[#00ff66] text-black shadow-[0_0_10px_rgba(0,255,102,0.3)]"
                  : "bg-[#12161f] text-gray-400 border border-white/5 hover:text-white"
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6 custom-scrollbar">
          {tab === "stats" && (
            <AdminStatsTab casesCount={cases.length} skinsCount={skins.length} />
          )}

          {tab === "users" && <AdminUsersTab client={adminClient} />}

          {tab === "cases" && (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setEditingCase(null);
                  setCaseModalOpen(true);
                }}
                className="w-full py-3 rounded-xl text-xs font-black bg-[#00ff66] text-black flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,255,102,0.3)] hover:bg-[#00e65c] transition-all"
              >
                <Plus size={16} /> Yangi Case Qo'shish
              </button>

              <div className="grid grid-cols-2 gap-2.5 mt-1">
                {cases.map((cs) => (
                  <div
                    key={cs.id}
                    className="rounded-xl p-3 bg-[#12161f] border border-white/5 flex flex-col justify-between gap-2 relative group hover:border-[#00ff66]/30 transition-all"
                  >
                    <div className="w-full h-20 rounded-lg bg-[#0a0d14] flex items-center justify-center p-2 relative overflow-hidden">
                      <Thumb
                        image={cs.image}
                        color={cs.color || "#00ff66"}
                        glow={`${cs.color || "#00ff66"}44`}
                        Icon={iconFor(cs.id)}
                        size={32}
                      />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white truncate">
                        {cs.name}
                      </div>
                      <div className="text-xs font-black font-mono text-[#00ff66] mt-0.5">
                        ${fmt(cs.price)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 pt-1 border-t border-white/5">
                      <button
                        onClick={() => {
                          setEditingCase(cs);
                          setCaseModalOpen(true);
                        }}
                        className="flex-1 py-1.5 rounded-lg bg-[#0a0d14] text-gray-300 hover:text-[#00ff66] flex items-center justify-center border border-white/5"
                      >
                        <Edit size={12} />
                      </button>
                      <button
                        onClick={() => onDeleteCase(cs.id)}
                        className="flex-1 py-1.5 rounded-lg bg-[#0a0d14] text-red-500 hover:text-red-400 flex items-center justify-center border border-white/5"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "skins" && (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setEditingSkin(null);
                  setSkinModalOpen(true);
                }}
                className="w-full py-2.5 rounded-xl text-xs font-black bg-[#00ff66] text-black flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,255,102,0.3)] hover:bg-[#00e65c] transition-all mb-1"
              >
                <Plus size={15} /> Yangi Skin Qo'shish
              </button>

              <div className="flex flex-col gap-1.5">
                {skins.map((s) => {
                  const R = RARITY[s.rarity] || RARITY.common;
                  return (
                    <div
                      key={s.id}
                      className="rounded-xl px-3 py-2 bg-[#12161f] border border-white/5 flex items-center justify-between gap-2 hover:border-[#00ff66]/30 transition-all"
                    >
                      <div className="flex items-center gap-2 truncate min-w-0">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: R.color, boxShadow: `0 0 6px ${R.glow}` }}
                        />
                        <div className="truncate text-xs font-bold text-white">
                          {s.name}
                        </div>
                        <span
                          className="text-[8px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-black/40 shrink-0"
                          style={{ color: R.color }}
                        >
                          {R.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-black font-mono text-[#00ff66]">
                          ${fmt(s.price)}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingSkin(s);
                              setSkinModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-[#0a0d14] text-gray-300 hover:text-[#00ff66] border border-white/5 transition-colors"
                            title="Tahrirlash"
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            onClick={() => onDeleteSkin(s.id)}
                            className="p-1.5 rounded-lg bg-[#0a0d14] text-red-500 hover:text-red-400 border border-white/5 transition-colors"
                            title="O'chirish"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <SkinModal
          isOpen={skinModalOpen}
          onClose={() => {
            setSkinModalOpen(false);
            setEditingSkin(null);
          }}
          skin={editingSkin}
          onSave={handleSaveSkin}
          cases={cases}
        />

        <CaseModal
          isOpen={caseModalOpen}
          onClose={() => {
            setCaseModalOpen(false);
            setEditingCase(null);
          }}
          cs={editingCase}
          onSave={handleSaveCase}
        />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   ROOT APP
----------------------------------------------------------------*/
const NAV = [
  { id: "home", label: "Bosh", icon: Home },
  { id: "cases", label: "Case'lar", icon: Package },
  { id: "inventory", label: "Inventar", icon: Sword },
  { id: "market", label: "Market", icon: ShoppingBag },
  { id: "profile", label: "Profil", icon: User },
];

export default function App() {
  const [tab, setTab] = useState("home");
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminToken, setAdminToken] = useState("");
  const [adminChecking, setAdminChecking] = useState(false);
  const [cases, setCases] = useState([]);
  const [skins, setSkins] = useState([]);
  const [balance, setBalance] = useState(0);
  const [inventory, setInventory] = useState([]);
  const [viewingCase, setViewingCase] = useState(null);
  const [dailyAvailable, setDailyAvailable] = useState(false);
  const [dailyClaimedAt, setDailyClaimedAt] = useState(null);
  const [txs, setTxs] = useState([]);
  const [user, setUser] = useState({
    name: "...",
    username: "",
    opened: 0,
    referralCode: "",
  });
  const [refStats, setRefStats] = useState({ count: 0, earned: 0 });
  const [listings, setListings] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const fetchInventory = async () => {
    try {
      const invRes = await client.get("/inventory");
      setInventory(
        invRes.data.map((i) => ({ ...norm(i.skin), _invId: i._id })),
      );
    } catch (err) {
      console.error("INVENTORY FETCH XATOSI:", err);
    }
  };

  const fetchDailyStatus = async () => {
    try {
      const dailyRes = await client.get("/daily/status");
      setDailyAvailable(dailyRes.data.available);
      if (dailyRes.data.claimedAt) {
        setDailyClaimedAt(dailyRes.data.claimedAt);
      }
    } catch (err) {
      console.error("DAILY XATOSI:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const meRes = await client.get("/auth/me");
        const u = meRes.data.user || meRes.data;
        setUser({
          name: u.firstName || u.first_name || u.name || u.username || "Foydalanuvchi",
          username: u.username || "",
          opened: u.casesOpened || u.opened || 0,
          referralCode: u.referralCode || "",
        });

        setDailyClaimedAt(u.dailyClaimedAt || u.claimedAt);
        setBalance(u.balance || 0);
      } catch (err) {
        console.error("AUTH XATOSI:", err.response?.data || err.message);
      }

      try {
        const casesRes = await client.get("/cases");
        setCases(casesRes.data.map(norm));
      } catch (err) {
        console.error("CASES XATOSI:", err.response?.data || err.message);
      }

      try {
        const skinsRes = await client.get("/skins");
        setSkins(skinsRes.data.map(norm));
      } catch (err) {
        console.error("SKINS XATOSI:", err.response?.data || err.message);
      }

      await fetchDailyStatus();
      await fetchInventory();

      try {
        const refRes = await client.get("/referral/stats");
        setRefStats(refRes.data);
      } catch (err) {
        console.error("REFERRAL XATOSI:", err.response?.data || err.message);
      }

      try {
        const listRes = await client.get("/marketplace");
        setListings(
          listRes.data.map((l) => ({
            ...l,
            skin: norm(l.skin),
            seller: l.seller?.username || l.seller?.firstName || l.seller?.first_name || "user",
          })),
        );
      } catch (err) {
        console.error("MARKET XATOSI:", err.response?.data || err.message);
      }

      try {
        const params = new URLSearchParams(window.location.search);
        const refCode = params.get("ref");
        if (refCode) {
          await client.post("/referral/bind", { refCode });
        }
      } catch (err) {
        console.log("Referral bind o'tkazib yuborildi:", err.response?.data?.error || err.message);
      }

      setLoaded(true);
    })();
  }, []);

  const addTx = (label, amt) =>
    setTxs((t) => [{ label, amt, time: "hozir" }, ...t].slice(0, 20));

  const handleDaily = async () => {
    if (!dailyAvailable) return;
    try {
      const res = await client.post("/daily/claim");
      setBalance(res.data.balance);
      setDailyAvailable(false);
      setDailyClaimedAt(new Date().toISOString());
      addTx("Kunlik bonus", 1.0);
      await fetchDailyStatus();
    } catch (err) {
      alert(err.response?.data?.error || "Xatolik");
    }
  };

  const handleSell = async (idx) => {
    const skin = inventory[idx];
    try {
      const res = await client.post(`/inventory/${skin._invId}/sell`);
      setBalance(res.data.balance);
      setInventory((inv) => inv.filter((_, i) => i !== idx));
      addTx(`Sotildi: ${skin.name}`, skin.price * 0.9);
    } catch (err) {
      alert(err.response?.data?.error || "Xatolik");
    }
  };

  const handleBuy = async (listingId) => {
    try {
      const res = await client.post(`/marketplace/${listingId}/buy`);
      setBalance(res.data.balance);
      setListings((ls) => ls.filter((l) => l._id !== listingId));
      await fetchInventory();
      addTx("Sotib olindi", -res.data.price || 0);
    } catch (err) {
      alert(err.response?.data?.error || "Xatolik");
    }
  };

  const handleDeposit = async (amount) => {
    if (!amount) return;
    try {
      const res = await client.post("/balance/deposit", { amount });
      setBalance(res.data.balance);
      addTx("Deposit", amount);
    } catch (err) {
      alert(err.response?.data?.error || "Xatolik");
    }
  };

  const handleAdminClick = async () => {
    const token = window.prompt("Admin parolini kiriting:");
    if (!token) return;
    setAdminChecking(true);
    try {
      await createAdminClient(token).get("/admin/verify");
      setAdminToken(token);
      setShowAdmin(true);
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 401) {
        alert("Parol xato! Qayta urinib ko'ring.");
      } else {
        alert("Tekshirishda xatolik: server bilan bog'lanib bo'lmadi.");
      }
    } finally {
      setAdminChecking(false);
    }
  };

  const goTab = (id) => {
    if (tab === "cases" || id === "inventory") {
      fetchInventory();
    }
    setViewingCase(null);
    setTab(id);
  };

  if (!loaded) {
    return (
      <div className="w-full min-h-screen bg-[#07090e] flex items-center justify-center">
        <div className="text-sm font-black text-[#00ff66] animate-pulse uppercase tracking-widest">
          Yuklanmoqda...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#07090e] flex items-center justify-center p-0 md:p-4">
      <style>{`
        @keyframes dropIn { 0% { opacity:0; transform:scale(.6) translateY(10px);} 60% { opacity:1; transform:scale(1.06) translateY(0);} 100% { transform:scale(1); opacity:1; } }
      `}</style>

      <div className="w-full max-w-[400px] h-[100vh] md:h-[750px] relative overflow-hidden bg-[#0a0d14] md:rounded-[32px] border-0 md:border md:border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col font-sans">
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {viewingCase ? (
            <CaseDetailScreen
              cs={viewingCase}
              skins={skins}
              balance={balance}
              onBack={() => {
                fetchInventory();
                setViewingCase(null);
              }}
              onBalanceChange={setBalance}
              onAddTx={addTx}
              refreshInventory={fetchInventory}
            />
          ) : (
            <>
              {tab === "home" && (
                <HomeScreen
                  balance={balance}
                  user={user}
                  cases={cases}
                  skins={skins}
                  onOpenCase={setViewingCase}
                  dailyAvailable={dailyAvailable}
                  dailyClaimedAt={dailyClaimedAt}
                  onDaily={handleDaily}
                  nav={goTab}
                  onAdmin={handleAdminClick}
                />
              )}
              {tab === "cases" && (
                <CasesScreen cases={cases} onOpenCase={setViewingCase} />
              )}
              {tab === "inventory" && (
                <InventoryScreen inventory={inventory} onSell={handleSell} />
              )}
              {tab === "market" && (
                <MarketplaceScreen
                  listings={listings}
                  balance={balance}
                  onBuy={handleBuy}
                />
              )}
              {tab === "balance" && (
                <BalanceScreen
                  balance={balance}
                  txs={txs}
                  onDeposit={handleDeposit}
                />
              )}
              {tab === "profile" && (
                <ProfileScreen
                  user={user}
                  balance={balance}
                  inventory={inventory}
                  refCode={user.referralCode}
                  refStats={refStats}
                />
              )}
            </>
          )}
        </div>

        <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-[#0a0d14] via-[#0a0d14]/90 to-transparent pointer-events-none">
          <div className="rounded-2xl bg-[#12161f]/95 border border-white/10 backdrop-blur-md flex items-center justify-around py-2.5 shadow-[0_0_20px_rgba(0,0,0,0.5)] pointer-events-auto">
            {NAV.map((n) => {
              const Icon = n.icon;
              const active = tab === n.id && !viewingCase;
              return (
                <button
                  key={n.id}
                  onClick={() => goTab(n.id)}
                  className="flex flex-col items-center gap-1 px-3 py-1 relative group"
                >
                  {active && (
                    <div className="absolute -top-2 w-2 h-1 bg-[#00ff66] rounded-full shadow-[0_0_8px_#00ff66]" />
                  )}
                  <Icon
                    size={20}
                    className={`transition-colors ${
                      active
                        ? "text-[#00ff66]"
                        : "text-gray-500 group-hover:text-gray-300"
                    }`}
                  />
                  <span
                    className={`text-[9px] font-extrabold uppercase tracking-wider ${
                      active ? "text-white" : "text-gray-500"
                    }`}
                  >
                    {n.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {adminChecking && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="px-5 py-3 rounded-xl text-xs font-black text-[#00ff66] bg-[#12161f] border border-[#00ff66]/30 shadow-2xl animate-pulse">
              Tekshirilmoqda...
            </div>
          </div>
        )}

        {showAdmin && (
          <AdminScreen
            cases={cases}
            skins={skins}
            token={adminToken}
            onAddCase={(c) => setCases((cs) => [...cs, c])}
            onUpdateCase={(updatedCase) =>
              setCases((cs) =>
                cs.map((c) => (c.id === updatedCase.id ? updatedCase : c))
              )
            }
            onAddSkin={(s) => setSkins((ss) => [...ss, s])}
            onUpdateSkin={(updatedSkin) =>
              setSkins((ss) =>
                ss.map((s) => (s.id === updatedSkin.id ? updatedSkin : s))
              )
            }
            onDeleteCase={async (id) => {
              if (!window.confirm("Rostdan ham ushbu caseni o'chirmoqchimisiz?")) return;
              await createAdminClient(adminToken).delete(`/admin/cases/${id}`);
              setCases((cs) => cs.filter((c) => c.id !== id));
            }}
            onDeleteSkin={async (id) => {
              if (!window.confirm("Rostdan ham ushbu skinni o'chirmoqchimisiz?")) return;
              await createAdminClient(adminToken).delete(`/admin/skins/${id}`);
              setSkins((ss) => ss.filter((s) => s.id !== id));
            }}
            onClose={() => setShowAdmin(false)}
          />
        )}
      </div>
    </div>
  );
}