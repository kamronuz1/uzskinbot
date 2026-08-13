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
  X,
  Copy,
  ArrowUpRight,
  ArrowDownRight,
  History,
  Settings,
  Plus,
  Trash2,
  ArrowLeft,
  Tag,
} from "lucide-react";

/* ---------------------------------------------------------------
   TOKENS
----------------------------------------------------------------*/
const RARITY = {
  common: { label: "Oddiy", color: "#8A93A6", glow: "rgba(138,147,166,.32)" },
  rare: { label: "Noyob", color: "#4EA1FF", glow: "rgba(78,161,255,.48)" },
  epic: { label: "Epik", color: "#B24BFF", glow: "rgba(178,75,255,.56)" },
  legend: {
    label: "Afsonaviy",
    color: "#FFB020",
    glow: "rgba(255,176,32,.62)",
  },
  myth: { label: "Mif", color: "#FF3B6E", glow: "rgba(255,59,110,.68)" },
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
const uid = () => Math.random().toString(36).slice(2, 9);
// MongoDB obyektlarida _id bo'ladi, id emas — shu yerda normalizatsiya qilamiz
const norm = (o) => (o ? { ...o, id: o._id || o.id } : o);

/* Thumb: rasm bo'lsa ko'rsatadi, bo'lmasa rarity rangiga mos, KUCHLI
   tiniqlikdagi radial fon + porlab turgan ikonka chizadi. */
function Thumb({ image, color, glow, Icon, size = 32 }) {
  const style = image
    ? {
        backgroundImage: `url(${image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {
        background: `radial-gradient(circle at 50% 32%, ${glow} 0%, ${glow} 38%, transparent 82%)`,
      };
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={style}
    >
      {!image && (
        <Icon
          size={size}
          color={color}
          strokeWidth={1.5}
          style={{ filter: `drop-shadow(0 0 10px ${glow})` }}
        />
      )}
    </div>
  );
}
function Pill({ children, color = "#7C5CFC" }) {
  return (
    <span
      className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
      style={{ background: `${color}22`, color }}
    >
      {children}
    </span>
  );
}
function ScreenHeader({ title, sub, right }) {
  return (
    <div className="flex items-center justify-between px-4 pt-5 pb-3">
      <div>
        <h1
          className="text-lg font-bold tracking-tight"
          style={{ color: "#EDEFF6" }}
        >
          {title}
        </h1>
        {sub && (
          <p className="text-xs mt-0.5" style={{ color: "#7C8399" }}>
            {sub}
          </p>
        )}
      </div>
      {right}
    </div>
  );
}

/* SkinCard — rarity darajasiga qarab fon/border/glow KUCHAYADI.
   legend/myth uchun qalinroq porlab turgan chegara, epik uchun
   o'rtacha, oddiy/noyob uchun yengil. */
function SkinCard({ skin, onClick, badge, size = "md" }) {
  const R = RARITY[skin.rarity];
  const Icon = iconFor(skin.id);
  const h = size === "lg" ? "h-36" : size === "sm" ? "h-24" : "h-28";
  const strong = skin.rarity === "legend" || skin.rarity === "myth";
  const mid = skin.rarity === "epic";
  return (
    <button
      onClick={onClick}
      className="relative rounded-2xl overflow-hidden text-left w-full transition-transform active:scale-[0.97]"
      style={{
        background: "linear-gradient(160deg,#171B27,#12151F)",
        border: `${strong ? 2 : 1}px solid ${R.color}${strong ? "99" : mid ? "55" : "33"}`,
        boxShadow: strong
          ? `0 0 22px ${R.glow}`
          : mid
          ? `0 0 10px ${R.glow}`
          : "none",
      }}
    >
      <div className={`relative ${h}`}>
        <Thumb image={skin.image} color={R.color} glow={R.glow} Icon={Icon} />
        {badge}
      </div>
      <div
        className="px-2.5 pb-2.5 pt-1.5"
        style={{ background: strong ? `${R.color}14` : "transparent" }}
      >
        <div
          className="text-[11px] font-medium truncate"
          style={{ color: "#EDEFF6" }}
        >
          {skin.name}
        </div>
        <div className="flex items-center justify-between mt-1">
          <span
            className="text-[9px] uppercase tracking-wide font-bold"
            style={{ color: R.color }}
          >
            {R.label}
          </span>
          <span
            className="text-[10px] font-semibold"
            style={{ color: "#7C8399" }}
          >
            ${fmt(skin.price)}
          </span>
        </div>
      </div>
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: R.color }}
      />
    </button>
  );
}

/* ---------------------------------------------------------------
   CASE OPENING — haqiqiy natijani backenddan oladi
----------------------------------------------------------------*/
const ITEM_W = 108;

function RarityBurst({ color, big }) {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      <div
        className="rounded-full animate-[ring1_.9s_ease-out_forwards]"
        style={{ width: 40, height: 40, border: `2px solid ${color}` }}
      />
      {big && (
        <div
          className="rounded-full animate-[ring2_1.1s_ease-out_forwards] absolute"
          style={{ width: 40, height: 40, border: `2px solid ${color}` }}
        />
      )}
    </div>
  );
}

function CaseOpenModal({ cs, skins, balance, onClose, onOpened, onResolve }) {
  const [phase, setPhase] = useState("idle"); // idle | loading | spinning | result
  const [reel, setReel] = useState([]);
  const [offset, setOffset] = useState(0);
  const [won, setWon] = useState(null); // { ...skin, invId }
  const [flash, setFlash] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const containerRef = useRef(null);
  const resolvedRef = useRef(true); // true = joriy natija bo'yicha tanlov qilingan (yoki hali ochilmagan)
  const canAfford = balance >= cs.price;
  const CaseIcon = iconFor(cs.id);

  const start = async () => {
    if (!canAfford || phase !== "idle") return;
    setErrMsg("");
    setPhase("loading");
    resolvedRef.current = false;
    try {
      const res = await client.post(`/cases/${cs.id}/open`);
      const winner = norm(res.data.skin);
      const invId = res.data.inventoryItem._id;
      onOpened(res.data.balance, cs.price, cs.name);

      const reelArr = Array.from(
        { length: 44 },
        () => norm(skins[Math.floor(Math.random() * skins.length)]) || winner,
      );
      const winIndex = 38;
      reelArr[winIndex] = winner;
      setReel(reelArr);
      setWon({ ...winner, invId });
      setOffset(0);
      setPhase("spinning");
      requestAnimationFrame(() => {
        const w =
          (containerRef.current && containerRef.current.offsetWidth) || 320;
        const jitter = Math.random() * ITEM_W * 0.55 - ITEM_W * 0.27;
        const target = -(winIndex * ITEM_W + ITEM_W / 2 - w / 2) + jitter;
        requestAnimationFrame(() => setOffset(target));
      });
      setTimeout(() => {
        setPhase("result");
        setFlash(true);
        setTimeout(() => setFlash(false), 450);
      }, 5000);
    } catch (err) {
      setErrMsg(err.response?.data?.error || "Xatolik yuz berdi");
      setPhase("idle");
      resolvedRef.current = true;
    }
  };

  const R = won ? RARITY[won.rarity] : null;
  const isBig = won && (won.rarity === "legend" || won.rarity === "myth");

  // Sotish/Inventarga tanlanganda MODAL YOPILMAYDI — case o'zida
  // ochiq qoladi, darhol qayta ochish mumkin.
  const finish = async (action) => {
    if (action === "sell") {
      try {
        const res = await client.post(`/inventory/${won.invId}/sell`);
        onResolve(won, "sell", res.data.balance);
      } catch (err) {
        setErrMsg(err.response?.data?.error || "Xatolik");
        return;
      }
    } else {
      onResolve(won, "keep", balance);
    }
    resolvedRef.current = true;
    setWon(null);
    setPhase("idle");
    setReel([]);
    setOffset(0);
  };

  // X bosilganda: natija chiqqan-u hali tanlov qilinmagan bo'lsa —
  // avtomatik ravishda Inventarga qo'shib yuboriladi.
  const handleClose = () => {
    if (won && !resolvedRef.current) {
      resolvedRef.current = true;
      onResolve(won, "keep", balance);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: "rgba(5,6,10,.78)", backdropFilter: "blur(6px)" }}
    >
      {flash && R && (
        <div
          className="fixed inset-0 pointer-events-none animate-[flashOut_.45s_ease-out_forwards]"
          style={{ background: R.color }}
        />
      )}
      <div
        className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl overflow-hidden"
        style={{ background: "#12151F", border: "1px solid #232838" }}
      >
        <div
          className="flex items-center justify-between px-4 py-3.5"
          style={{ borderBottom: "1px solid #1B2030" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg overflow-hidden"
              style={{ background: `${cs.color}22` }}
            >
              <Thumb
                image={cs.image}
                color={cs.color}
                glow={`${cs.color}55`}
                Icon={CaseIcon}
                size={14}
              />
            </div>
            <span
              className="text-sm font-semibold"
              style={{ color: "#EDEFF6" }}
            >
              {cs.name}
            </span>
          </div>
          <button
            onClick={phase === "loading" ? undefined : handleClose}
            disabled={phase === "loading"}
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{
              background: "#1B2030",
              opacity: phase === "loading" ? 0.4 : 1,
            }}
          >
            <X size={14} color="#7C8399" />
          </button>
        </div>

        <div className="p-4">
          {errMsg && (
            <div
              className="mb-3 text-xs font-semibold text-center"
              style={{ color: "#FF3B6E" }}
            >
              {errMsg}
            </div>
          )}

          {(phase === "loading" ||
            phase === "spinning" ||
            phase === "idle") && (
            <div
              ref={containerRef}
              className="relative rounded-2xl overflow-hidden"
              style={{
                height: 108,
                background: "#0A0D14",
                border: "1px solid #1B2030",
              }}
            >
              <div
                className="absolute left-1/2 top-0 bottom-0 w-[2px] z-10"
                style={{ background: "#7C5CFC", boxShadow: "0 0 14px #7C5CFC" }}
              />
              <div
                className="absolute inset-0 z-[5]"
                style={{
                  background:
                    "linear-gradient(90deg,#0A0D14 0%, transparent 16%, transparent 84%, #0A0D14 100%)",
                }}
              />
              <div
                className="flex h-full items-center absolute left-0 top-0"
                style={{
                  transform: `translateX(${offset}px)`,
                  transition:
                    phase === "spinning"
                      ? "transform 4.9s cubic-bezier(0.09,0.82,0.12,1)"
                      : "none",
                }}
              >
                {reel.map((s, i) => {
                  const Rr = RARITY[s.rarity];
                  const Icon = iconFor(s.id + i);
                  return (
                    <div
                      key={i}
                      className="flex-shrink-0 flex items-center justify-center"
                      style={{ width: ITEM_W, height: 96 }}
                    >
                      <div
                        className="w-[92px] h-[88px] rounded-xl overflow-hidden"
                        style={{
                          background: "#171B27",
                          border: `1px solid ${Rr.color}44`,
                        }}
                      >
                        <Thumb
                          image={s.image}
                          color={Rr.color}
                          glow={Rr.glow}
                          Icon={Icon}
                          size={26}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {phase === "result" && won && (
            <div className="flex flex-col items-center py-2">
              <div
                className="relative w-32 h-32 rounded-2xl overflow-hidden flex items-center justify-center mb-3 animate-[dropIn_.5s_ease-out]"
                style={{ border: `2px solid ${R.color}88`, boxShadow: `0 0 24px ${R.glow}` }}
              >
                <Thumb
                  image={won.image}
                  color={R.color}
                  glow={R.glow}
                  Icon={iconFor(won.id)}
                  size={54}
                />
                {isBig && (
                  <RarityBurst color={R.color} big={won.rarity === "myth"} />
                )}
              </div>
              <div className="text-base font-bold" style={{ color: "#EDEFF6" }}>
                {won.name}
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <Pill color={R.color}>{R.label}</Pill>
                <span
                  className="text-xs font-semibold"
                  style={{ color: "#7C8399" }}
                >
                  ${fmt(won.price)}
                </span>
              </div>
            </div>
          )}

          <div className="mt-4">
            {phase === "idle" && (
              <button
                onClick={start}
                disabled={!canAfford}
                className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                style={{
                  background: canAfford
                    ? "linear-gradient(90deg,#7C5CFC,#22E5C8)"
                    : "#1B2030",
                  color: canAfford ? "#0A0D14" : "#7C8399",
                }}
              >
                {canAfford
                  ? `Ochish — $${fmt(cs.price)}`
                  : "Balans yetarli emas"}
              </button>
            )}
            {(phase === "loading" || phase === "spinning") && (
              <div
                className="w-full py-3.5 rounded-2xl text-center text-sm font-semibold"
                style={{ background: "#171B27", color: "#7C8399" }}
              >
                {phase === "loading" ? "Yuklanmoqda..." : "Ochilmoqda..."}
              </div>
            )}
            {phase === "result" && (
              <div className="flex gap-2">
                <button
                  onClick={() => finish("sell")}
                  className="flex-1 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-1.5"
                  style={{
                    background: "linear-gradient(90deg,#22E5C8,#4EA1FF)",
                    color: "#0A0D14",
                  }}
                >
                  <Tag size={14} /> Sotish — ${fmt(won.price * 0.9)}
                </button>
                <button
                  onClick={() => finish("keep")}
                  className="flex-1 py-3 rounded-2xl text-sm font-semibold"
                  style={{ background: "#1B2030", color: "#EDEFF6" }}
                >
                  Inventarga
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   KO'P DONA OCHISH NATIJASI
----------------------------------------------------------------*/
function BulkResultModal({ results, onClose, onSellAll, selling }) {
  const total = results.reduce((a, r) => a + r.skin.price, 0);
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: "rgba(5,6,10,.78)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col"
        style={{ background: "#12151F", border: "1px solid #232838", maxHeight: "85vh" }}
      >
        <div
          className="flex items-center justify-between px-4 py-3.5"
          style={{ borderBottom: "1px solid #1B2030" }}
        >
          <span className="text-sm font-semibold" style={{ color: "#EDEFF6" }}>
            Natijalar ({results.length})
          </span>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: "#1B2030" }}
          >
            <X size={14} color="#7C8399" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-3 gap-2">
            {results.map((r, i) => (
              <SkinCard key={i} skin={r.skin} size="sm" />
            ))}
          </div>
        </div>
        <div
          className="px-4 pt-1 pb-2 text-xs font-semibold text-center"
          style={{ color: "#7C8399" }}
        >
          Jami qiymat: <span style={{ color: "#22E5C8" }}>${fmt(total)}</span>
        </div>
        <div className="p-4 pt-1 flex gap-2">
          <button
            onClick={onSellAll}
            disabled={selling}
            className="flex-1 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-1.5"
            style={{
              background: "linear-gradient(90deg,#22E5C8,#4EA1FF)",
              color: "#0A0D14",
              opacity: selling ? 0.6 : 1,
            }}
          >
            <Tag size={14} /> {selling ? "Sotilmoqda..." : "Hammasini sotish"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl text-sm font-semibold"
            style={{ background: "#1B2030", color: "#EDEFF6" }}
          >
            Inventarga qoldirish
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   CASE DETAIL SCREEN — case bosilganda ochiladigan to'liq sahifa:
   katta banner, narx, miqdor tanlash, "Ochish" tugmasi, pastda
   shu case'dagi barcha skinlar (rarity bo'yicha kamayish tartibida)
----------------------------------------------------------------*/
function CaseDetailScreen({ cs, skins, balance, onBack, onOpenSingle, onOpenBulk }) {
  const [qty, setQty] = useState(1);
  const Icon = iconFor(cs.id);
  const eligible = skins
    .filter((s) => (cs.odds?.[s.rarity] || 0) > 0)
    .sort(
      (a, b) =>
        RARITY_ORDER.indexOf(b.rarity) - RARITY_ORDER.indexOf(a.rarity) ||
        b.price - a.price,
    );
  const totalPrice = cs.price * qty;
  const canAfford = balance >= totalPrice;

  return (
    <div className="pb-24">
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "#12151F", border: "1px solid #232838" }}
        >
          <ArrowLeft size={16} color="#7C8399" />
        </button>
        <span className="text-sm font-bold" style={{ color: "#EDEFF6" }}>
          {cs.name}
        </span>
        <div className="w-9" />
      </div>

      <div
        className="mx-4 rounded-3xl overflow-hidden relative mb-5"
        style={{ minHeight: 250 }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(120% 90% at 50% 0%, ${cs.color}55 0%, transparent 55%), linear-gradient(180deg, #171B27 0%, #0A0D14 55%, #05060A 100%)`,
          }}
        />
        <div className="relative flex flex-col items-center pt-8 pb-6 px-4">
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center mb-4"
            style={{
              background: `radial-gradient(circle, ${cs.color}40, transparent 72%)`,
              border: `1px solid ${cs.color}66`,
            }}
          >
            <Icon
              size={44}
              color={cs.color}
              strokeWidth={1.3}
              style={{ filter: `drop-shadow(0 0 14px ${cs.color}88)` }}
            />
          </div>
          <div
            className="text-lg font-extrabold mb-1"
            style={{ color: "#EDEFF6" }}
          >
            {cs.name}
          </div>
          <div className="flex items-center gap-1.5 mb-5">
            <Gift size={14} color={cs.color} />
            <span className="text-base font-bold" style={{ color: cs.color }}>
              ${fmt(cs.price)}
            </span>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-full flex items-center justify-center text-base font-bold"
              style={{
                background: "#171B27",
                color: "#EDEFF6",
                border: "1px solid #232838",
              }}
            >
              −
            </button>
            <span
              className="text-sm font-bold w-6 text-center"
              style={{ color: "#EDEFF6" }}
            >
              {qty}
            </span>
            <button
              onClick={() => setQty((q) => Math.min(10, q + 1))}
              className="w-8 h-8 rounded-full flex items-center justify-center text-base font-bold"
              style={{
                background: "#171B27",
                color: "#EDEFF6",
                border: "1px solid #232838",
              }}
            >
              +
            </button>
          </div>

          <button
            onClick={() =>
              qty === 1 ? onOpenSingle(cs) : onOpenBulk(cs, qty)
            }
            disabled={!canAfford}
            className="w-full py-3.5 rounded-2xl font-bold text-sm"
            style={{
              background: canAfford
                ? "linear-gradient(90deg,#7C5CFC,#22E5C8)"
                : "#1B2030",
              color: canAfford ? "#0A0D14" : "#7C8399",
            }}
          >
            {canAfford ? `Ochish — $${fmt(totalPrice)}` : "Balans yetarli emas"}
          </button>
        </div>
      </div>

      <div className="px-4 flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold" style={{ color: "#EDEFF6" }}>
          Ushbu case'dagi skinlar
        </h2>
        <span className="text-[11px]" style={{ color: "#7C8399" }}>
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
      className="rounded-2xl p-3 flex flex-col items-center gap-2 active:scale-95 transition-transform"
      style={{
        background: "linear-gradient(160deg,#171B27,#12151F)",
        border: `1px solid ${cs.color}33`,
      }}
    >
      <div className="w-12 h-12 rounded-xl overflow-hidden">
        <Thumb
          image={cs.image}
          color={cs.color}
          glow={`${cs.color}44`}
          Icon={Icon}
          size={22}
        />
      </div>
      <div
        className="text-[11px] font-semibold text-center leading-tight"
        style={{ color: "#EDEFF6" }}
      >
        {cs.name}
      </div>
      <div className="text-[10px] font-bold" style={{ color: cs.color }}>
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
  onDaily,
  nav,
  onAdmin,
}) {
  return (
    <div className="pb-24">
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <div>
          <h1
            className="text-lg font-bold tracking-tight"
            style={{ color: "#EDEFF6" }}
          >
            Salom, {user.name}
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "#7C8399" }}>
            Bugun omadingizni sinab ko‘ring
          </p>
        </div>
        <button
          onClick={onAdmin}
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "#12151F", border: "1px solid #232838" }}
        >
          <Settings size={16} color="#7C8399" />
        </button>
      </div>

      <div
        className="mx-4 rounded-3xl p-5 relative overflow-hidden mb-5"
        style={{
          background:
            "linear-gradient(135deg,#7C5CFC 0%,#4A3FCF 55%,#22E5C8 130%)",
        }}
      >
        <div
          className="absolute -right-6 -top-6 w-32 h-32 rounded-full"
          style={{ background: "rgba(255,255,255,.12)" }}
        />
        <div className="relative">
          <div
            className="text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: "rgba(255,255,255,.75)" }}
          >
            Balans
          </div>
          <div
            className="text-3xl font-extrabold mt-1"
            style={{ color: "#fff" }}
          >
            ${fmt(balance)}
          </div>
          <button
            onClick={() => nav("balance")}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1"
            style={{ background: "rgba(10,13,20,.35)", color: "#fff" }}
          >
            To‘ldirish <ChevronRight size={13} />
          </button>
        </div>
      </div>

      <div
        className="mx-4 mb-5 rounded-2xl p-4 flex items-center justify-between"
        style={{ background: "#12151F", border: "1px solid #232838" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{
              background: dailyAvailable
                ? "linear-gradient(135deg,#FFB020,#FF3B6E)"
                : "#1B2030",
            }}
          >
            <Gift size={20} color={dailyAvailable ? "#0A0D14" : "#7C8399"} />
          </div>
          <div>
            <div className="text-sm font-semibold" style={{ color: "#EDEFF6" }}>
              Kunlik bonus
            </div>
            <div className="text-[11px]" style={{ color: "#7C8399" }}>
              {dailyAvailable ? "+$0.10 tayyor" : "Ertaga qayting"}
            </div>
          </div>
        </div>
        <button
          onClick={onDaily}
          disabled={!dailyAvailable}
          className="px-4 py-2 rounded-xl text-xs font-bold"
          style={{
            background: dailyAvailable ? "#22E5C8" : "#1B2030",
            color: dailyAvailable ? "#0A0D14" : "#4B5266",
          }}
        >
          {dailyAvailable ? "Olish" : "Olindi"}
        </button>
      </div>

      <div className="px-4 flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold" style={{ color: "#EDEFF6" }}>
          Case'lar
        </h2>
        <button
          onClick={() => nav("cases")}
          className="text-xs font-semibold flex items-center gap-0.5"
          style={{ color: "#7C5CFC" }}
        >
          Barchasi <ChevronRight size={13} />
        </button>
      </div>
      <div className="px-4 grid grid-cols-3 gap-3">
        {cases.map((cs) => (
          <CaseTile key={cs.id} cs={cs} onClick={() => onOpenCase(cs)} />
        ))}
      </div>

      <div className="px-4 mt-6">
        <h2 className="text-sm font-bold mb-3" style={{ color: "#EDEFF6" }}>
          Top skinlar
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {skins.slice(0, 3).map((s) => (
            <SkinCard key={s.id} skin={s} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CasesScreen({ cases, onOpenCase }) {
  return (
    <div className="pb-24">
      <ScreenHeader title="Case'lar" sub="Ochib, noyob skinlarga ega bo‘ling" />
      <div className="px-4 flex flex-col gap-3">
        {cases.map((cs) => {
          const Icon = iconFor(cs.id);
          return (
            <button
              key={cs.id}
              onClick={() => onOpenCase(cs)}
              className="rounded-2xl p-4 flex items-center justify-between active:scale-[0.98] transition-transform"
              style={{
                background: "linear-gradient(120deg,#171B27,#12151F)",
                border: `1px solid ${cs.color}33`,
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl overflow-hidden">
                  <Thumb
                    image={cs.image}
                    color={cs.color}
                    glow={`${cs.color}33`}
                    Icon={Icon}
                    size={26}
                  />
                </div>
                <div className="text-left">
                  <div
                    className="text-sm font-bold"
                    style={{ color: "#EDEFF6" }}
                  >
                    {cs.name}
                  </div>
                  <div className="flex gap-1 mt-1.5">
                    {RARITY_ORDER.map((r) => (
                      <span
                        key={r}
                        className="w-2 h-2 rounded-full"
                        style={{
                          background: RARITY[r].color,
                          opacity: (cs.odds?.[r] || 0) / 60 + 0.3,
                        }}
                        title={`${r}: ${cs.odds?.[r] || 0}%`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div
                  className="text-sm font-extrabold"
                  style={{ color: cs.color }}
                >
                  ${fmt(cs.price)}
                </div>
                <div
                  className="text-[10px] mt-0.5"
                  style={{ color: "#7C8399" }}
                >
                  ko‘rish →
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
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: "#12151F", border: "1px solid #232838" }}
      >
        <Icon size={26} color="#4B5266" />
      </div>
      <div className="text-sm font-semibold" style={{ color: "#EDEFF6" }}>
        {text}
      </div>
      <div className="text-xs mt-1" style={{ color: "#7C8399" }}>
        {sub}
      </div>
    </div>
  );
}

function InventoryScreen({ inventory, onSell }) {
  return (
    <div className="pb-24">
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
                <span
                  className="absolute top-1.5 right-1.5 text-[8px] px-1.5 py-0.5 rounded-full font-bold"
                  style={{ background: "#0A0D1499", color: "#22E5C8" }}
                >
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
    <div className="pb-24">
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
            <div
              className="absolute bottom-[38px] left-1.5 right-1.5 text-[8px] truncate"
              style={{ color: "#4B5266" }}
            >
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
    <div className="pb-24">
      <ScreenHeader title="Balans" />
      <div
        className="mx-4 rounded-3xl p-5 mb-5"
        style={{
          background: "linear-gradient(135deg,#171B27,#12151F)",
          border: "1px solid #232838",
        }}
      >
        <div
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: "#7C8399" }}
        >
          Joriy balans
        </div>
        <div
          className="text-3xl font-extrabold mt-1"
          style={{ color: "#EDEFF6" }}
        >
          ${fmt(balance)}
        </div>
        <div className="flex gap-2 mt-4">
          <input
            value={amt}
            onChange={(e) => setAmt(e.target.value.replace(/[^0-9.]/g, ""))}
            className="flex-1 rounded-xl px-3 py-2.5 text-sm font-semibold outline-none"
            style={{
              background: "#0A0D14",
              border: "1px solid #232838",
              color: "#EDEFF6",
            }}
          />
          <button
            onClick={() => onDeposit(parseFloat(amt) || 0)}
            className="px-4 rounded-xl text-xs font-bold"
            style={{
              background: "linear-gradient(90deg,#7C5CFC,#22E5C8)",
              color: "#0A0D14",
            }}
          >
            + Deposit
          </button>
        </div>
        <p className="text-[10px] mt-2" style={{ color: "#4B5266" }}>
          Demo rejimi — virtual balans (real to‘lov ulanmagan)
        </p>
      </div>
      <div className="px-4 flex items-center gap-2 mb-3">
        <History size={14} color="#7C8399" />
        <h2 className="text-sm font-bold" style={{ color: "#EDEFF6" }}>
          Tranzaksiyalar
        </h2>
      </div>
      <div className="px-4 flex flex-col gap-2">
        {txs.length === 0 && (
          <div className="text-xs" style={{ color: "#4B5266" }}>
            Hozircha tranzaksiya yo‘q
          </div>
        )}
        {txs.map((t, i) => (
          <div
            key={i}
            className="rounded-xl px-3.5 py-3 flex items-center justify-between"
            style={{ background: "#12151F", border: "1px solid #1B2030" }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: t.amt > 0 ? "#22E5C822" : "#FF3B6E22" }}
              >
                {t.amt > 0 ? (
                  <ArrowDownRight size={14} color="#22E5C8" />
                ) : (
                  <ArrowUpRight size={14} color="#FF3B6E" />
                )}
              </div>
              <div>
                <div
                  className="text-xs font-semibold"
                  style={{ color: "#EDEFF6" }}
                >
                  {t.label}
                </div>
                <div className="text-[10px]" style={{ color: "#4B5266" }}>
                  {t.time}
                </div>
              </div>
            </div>
            <div
              className="text-xs font-bold"
              style={{ color: t.amt > 0 ? "#22E5C8" : "#FF3B6E" }}
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
  const link = `t.me/SkinBot?start=${refCode}`;
  return (
    <div className="pb-24">
      <ScreenHeader title="Profil" />
      <div
        className="mx-4 rounded-2xl p-4 flex items-center gap-3 mb-4"
        style={{ background: "#12151F", border: "1px solid #232838" }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg"
          style={{
            background: "linear-gradient(135deg,#7C5CFC,#22E5C8)",
            color: "#0A0D14",
          }}
        >
          {user.name[0]}
        </div>
        <div>
          <div className="text-sm font-bold" style={{ color: "#EDEFF6" }}>
            {user.name}
          </div>
          <div className="text-xs" style={{ color: "#7C8399" }}>
            @{user.username}
          </div>
        </div>
      </div>
      <div className="mx-4 grid grid-cols-3 gap-2 mb-5">
        {[
          ["Balans", `$${fmt(balance)}`],
          ["Skinlar", inventory.length],
          ["Case", user.opened],
        ].map(([l, v]) => (
          <div
            key={l}
            className="rounded-xl p-3 text-center"
            style={{ background: "#12151F", border: "1px solid #232838" }}
          >
            <div
              className="text-sm font-extrabold"
              style={{ color: "#EDEFF6" }}
            >
              {v}
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: "#7C8399" }}>
              {l}
            </div>
          </div>
        ))}
      </div>
      <div
        className="mx-4 rounded-2xl p-4 mb-5"
        style={{
          background: "linear-gradient(135deg,#171B27,#12151F)",
          border: "1px solid #232838",
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Users size={15} color="#7C5CFC" />
          <span className="text-sm font-bold" style={{ color: "#EDEFF6" }}>
            Referral
          </span>
        </div>
        <div className="flex gap-4 mb-3">
          <div>
            <div
              className="text-base font-extrabold"
              style={{ color: "#EDEFF6" }}
            >
              {refStats.count}
            </div>
            <div className="text-[10px]" style={{ color: "#7C8399" }}>
              Taklif
            </div>
          </div>
          <div>
            <div
              className="text-base font-extrabold"
              style={{ color: "#22E5C8" }}
            >
              ${fmt(refStats.earned)}
            </div>
            <div className="text-[10px]" style={{ color: "#7C8399" }}>
              Bonus
            </div>
          </div>
        </div>
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2.5"
          style={{ background: "#0A0D14", border: "1px solid #232838" }}
        >
          <span
            className="flex-1 text-xs truncate"
            style={{ color: "#7C8399" }}
          >
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
              <Check size={15} color="#22E5C8" />
            ) : (
              <Copy size={15} color="#7C5CFC" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   ADMIN PANEL — bevosita backendga yozadi
----------------------------------------------------------------*/
function NumField({ label, value, onChange }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold" style={{ color: "#7C8399" }}>
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg px-2.5 py-2 text-xs font-medium outline-none"
        style={{
          background: "#0A0D14",
          border: "1px solid #232838",
          color: "#EDEFF6",
        }}
      />
    </label>
  );
}

function AdminSkinForm({ onAdd, client: adminClient }) {
  const [f, setF] = useState({
    name: "",
    type: "Miltiq",
    rarity: "common",
    price: "1",
    image: "",
  });
  const set = (key) => (val) => setF((prev) => ({ ...prev, [key]: val }));

  return (
    <div
      className="rounded-2xl p-3.5 mb-3"
      style={{ background: "#12151F", border: "1px solid #232838" }}
    >
      <div className="text-xs font-bold mb-2.5" style={{ color: "#EDEFF6" }}>
        Yangi skin qo‘shish
      </div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <NumField label="Nomi" value={f.name} onChange={set("name")} />
        <NumField label="Turi" value={f.type} onChange={set("type")} />
      </div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold" style={{ color: "#7C8399" }}>
            Rarity
          </span>
          <select
            value={f.rarity}
            onChange={(e) => set("rarity")(e.target.value)}
            className="rounded-lg px-2.5 py-2 text-xs font-medium outline-none"
            style={{ background: "#0A0D14", border: "1px solid #232838", color: "#EDEFF6" }}
          >
            {RARITY_ORDER.map((r) => (
              <option key={r} value={r}>{RARITY[r].label}</option>
            ))}
          </select>
        </label>
        <NumField label="Narxi ($)" value={f.price} onChange={set("price")} />
      </div>
      <NumField label="Rasm URL (ixtiyoriy)" value={f.image} onChange={set("image")} />
      <button
        onClick={async () => {
          if (!f.name.trim()) return;
          try {
            const res = await adminClient.post("/admin/skins", {
              name: f.name,
              type: f.type,
              rarity: f.rarity,
              price: parseFloat(f.price) || 0,
              image: f.image,
            });
            onAdd(norm(res.data));
            setF({ name: "", type: "Miltiq", rarity: "common", price: "1", image: "" });
          } catch (err) {
            alert(err.response?.data?.error || "Xatolik yuz berdi");
          }
        }}
        className="mt-3 w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
        style={{ background: "linear-gradient(90deg,#7C5CFC,#22E5C8)", color: "#0A0D14" }}
      >
        <Plus size={14} /> Skin qo‘shish
      </button>
    </div>
  );
}

function AdminCaseForm({ onAdd, client: adminClient }) {
  const [f, setF] = useState({
    name: "",
    price: "5",
    color: "#7C5CFC",
    image: "",
    common: "50",
    rare: "30",
    epic: "14",
    legend: "5",
    myth: "1",
  });
  const set = (key) => (val) => setF((prev) => ({ ...prev, [key]: val }));
  const sum = ["common", "rare", "epic", "legend", "myth"].reduce(
    (a, r) => a + (parseFloat(f[r]) || 0), 0
  );

  return (
    <div
      className="rounded-2xl p-3.5 mb-3"
      style={{ background: "#12151F", border: "1px solid #232838" }}
    >
      <div className="text-xs font-bold mb-2.5" style={{ color: "#EDEFF6" }}>
        Yangi case qo‘shish
      </div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <NumField label="Nomi" value={f.name} onChange={set("name")} />
        <NumField label="Narxi ($)" value={f.price} onChange={set("price")} />
      </div>
      <NumField label="Rasm URL (ixtiyoriy)" value={f.image} onChange={set("image")} />
      <div className="mt-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-semibold" style={{ color: "#7C8399" }}>
            Ehtimollar (%)
          </span>
          <span
            className="text-[10px] font-bold"
            style={{ color: Math.round(sum) === 100 ? "#22E5C8" : "#FF3B6E" }}
          >
            Jami: {sum.toFixed(1)}%
          </span>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {RARITY_ORDER.map((r) => (
            <label key={r} className="flex flex-col gap-1 items-center">
              <span className="text-[8px] font-semibold" style={{ color: RARITY[r].color }}>
                {RARITY[r].label}
              </span>
              <input
                value={f[r]}
                onChange={(e) => set(r)(e.target.value)}
                className="w-full text-center rounded-lg px-1 py-1.5 text-[10px] font-bold outline-none"
                style={{ background: "#0A0D14", border: `1px solid ${RARITY[r].color}44`, color: "#EDEFF6" }}
              />
            </label>
          ))}
        </div>
      </div>
      <button
        onClick={async () => {
          if (!f.name.trim()) return;
          try {
            const res = await adminClient.post("/admin/cases", {
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
            onAdd(norm(res.data));
            setF({
              name: "", price: "5", color: "#7C5CFC", image: "",
              common: "50", rare: "30", epic: "14", legend: "5", myth: "1",
            });
          } catch (err) {
            alert(err.response?.data?.error || "Xatolik yuz berdi");
          }
        }}
        className="mt-3 w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
        style={{ background: "linear-gradient(90deg,#7C5CFC,#22E5C8)", color: "#0A0D14" }}
      >
        <Plus size={14} /> Case qo‘shish
      </button>
    </div>
  );
}

function AdminScreen({ cases, skins, onAddCase, onAddSkin, onDeleteCase, onDeleteSkin, onClose, token }) {
  const adminClient = useMemo(() => createAdminClient(token), [token]);
  const [tab, setTab] = useState("cases");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: "rgba(5,6,10,.85)",
        opacity: mounted ? 1 : 0,
        transition: "opacity .25s ease",
      }}
    >
      <div
        className="w-full max-w-[380px] h-[720px] rounded-[28px] overflow-hidden flex flex-col"
        style={{
          background: "#05060A",
          border: "1px solid #1B2030",
          transform: mounted ? "translateY(0) scale(1)" : "translateY(16px) scale(0.98)",
          transition: "transform .28s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <div className="flex items-center gap-2 px-4 pt-5 pb-3">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "#12151F", border: "1px solid #232838" }}
          >
            <ArrowLeft size={15} color="#7C8399" />
          </button>
          <div>
            <div className="text-sm font-bold" style={{ color: "#EDEFF6" }}>
              Admin panel
            </div>
            <div className="text-[10px]" style={{ color: "#7C8399" }}>
              Case va skinlarni boshqarish
            </div>
          </div>
        </div>

        <div className="flex gap-2 px-4 mb-3">
          {[
            ["cases", "Case'lar"],
            ["skins", "Skinlar"],
          ].map(([id, l]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="px-3.5 py-1.5 rounded-full text-[11px] font-bold"
              style={{
                background:
                  tab === id
                    ? "linear-gradient(90deg,#7C5CFC,#22E5C8)"
                    : "#12151F",
                color: tab === id ? "#0A0D14" : "#7C8399",
                border: tab === id ? "none" : "1px solid #232838",
              }}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {tab === "cases" && (
            <>
              <AdminCaseForm onAdd={onAddCase} client={adminClient} />
              <div className="flex flex-col gap-2">
                {cases.map((cs) => (
                  <div
                    key={cs.id}
                    className="rounded-xl px-3 py-2.5 flex items-center justify-between"
                    style={{
                      background: "#12151F",
                      border: "1px solid #1B2030",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg overflow-hidden">
                        <Thumb
                          image={cs.image}
                          color={cs.color}
                          glow={`${cs.color}44`}
                          Icon={iconFor(cs.id)}
                          size={16}
                        />
                      </div>
                      <div>
                        <div
                          className="text-xs font-semibold"
                          style={{ color: "#EDEFF6" }}
                        >
                          {cs.name}
                        </div>
                        <div
                          className="text-[10px]"
                          style={{ color: "#7C8399" }}
                        >
                          ${fmt(cs.price)}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => onDeleteCase(cs.id)}>
                      <Trash2 size={14} color="#FF3B6E" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === "skins" && (
            <>
              <AdminSkinForm onAdd={onAddSkin} client={adminClient} />
              <div className="flex flex-col gap-2">
                {skins.map((s) => {
                  const R = RARITY[s.rarity];
                  return (
                    <div
                      key={s.id}
                      className="rounded-xl px-3 py-2.5 flex items-center justify-between"
                      style={{
                        background: "#12151F",
                        border: "1px solid #1B2030",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg overflow-hidden">
                          <Thumb
                            image={s.image}
                            color={R.color}
                            glow={R.glow}
                            Icon={iconFor(s.id)}
                            size={16}
                          />
                        </div>
                        <div>
                          <div
                            className="text-xs font-semibold"
                            style={{ color: "#EDEFF6" }}
                          >
                            {s.name}
                          </div>
                          <div
                            className="text-[10px]"
                            style={{ color: R.color }}
                          >
                            {R.label} · ${fmt(s.price)}
                          </div>
                        </div>
                      </div>
                      <button onClick={() => onDeleteSkin(s.id)}>
                        <Trash2 size={14} color="#FF3B6E" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
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
  const [openCase, setOpenCase] = useState(null);
  const [viewingCase, setViewingCase] = useState(null); // Case detail sahifasi
  const [bulkResults, setBulkResults] = useState(null);
  const [bulkSelling, setBulkSelling] = useState(false);
  const [dailyAvailable, setDailyAvailable] = useState(false);
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

  // Har bir so'rov ALOHIDA try/catch bilan — bittasi xato bersa ham
  // qolganlari ishlashda davom etadi.
  useEffect(() => {
    (async () => {
      try {
        const meRes = await client.get("/auth/me");
        const u = meRes.data.user;
        setUser({
          name: u.firstName || u.username || "Foydalanuvchi",
          username: u.username || "",
          opened: u.casesOpened,
          referralCode: u.referralCode,
        });
        setBalance(u.balance);
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

      try {
        const dailyRes = await client.get("/daily/status");
        setDailyAvailable(dailyRes.data.available);
      } catch (err) {
        console.error("DAILY XATOSI:", err.response?.data || err.message);
      }

      try {
        const invRes = await client.get("/inventory");
        setInventory(
          invRes.data.map((i) => ({ ...norm(i.skin), _invId: i._id })),
        );
      } catch (err) {
        console.error("INVENTORY XATOSI:", err.response?.data || err.message);
      }

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
            seller: l.seller?.username || l.seller?.firstName || "user",
          })),
        );
      } catch (err) {
        console.error("MARKET XATOSI:", err.response?.data || err.message);
      }

      // Referral link orqali kirgan bo'lsa (?ref=CODE) — avtomatik bog'lash
      try {
        const params = new URLSearchParams(window.location.search);
        const refCode = params.get("ref");
        if (refCode) {
          await client.post("/referral/bind", { refCode });
        }
      } catch (err) {
        console.log(
          "Referral bind o'tkazib yuborildi:",
          err.response?.data?.error || err.message,
        );
      }

      setLoaded(true);
    })();
  }, []);

  const addTx = (label, amt) =>
    setTxs((t) => [{ label, amt, time: "hozir" }, ...t].slice(0, 20));

  const handleOpened = (newBalance, price, caseName) => {
    setBalance(newBalance);
    addTx(`Case ochish (${caseName})`, -price);
  };

  const handleResolve = (won, action, newBalance) => {
    if (action === "sell") {
      setBalance(newBalance);
      addTx(`Sotildi: ${won.name}`, won.price * 0.9);
    } else {
      setInventory((inv) => [{ ...won, _invId: won.invId }, ...inv]);
    }
  };

  // Ko'p dona bir yo'la ochish
  const handleBulkOpen = async (cs, qty) => {
    try {
      const results = [];
      let lastBalance = balance;
      for (let i = 0; i < qty; i++) {
        const res = await client.post(`/cases/${cs.id}/open`);
        const skin = norm(res.data.skin);
        const invId = res.data.inventoryItem._id;
        results.push({ skin, invId });
        lastBalance = res.data.balance;
      }
      setBalance(lastBalance);
      addTx(`Case ochish x${qty} (${cs.name})`, -(cs.price * qty));
      setInventory((inv) => [
        ...results.map((r) => ({ ...r.skin, _invId: r.invId })),
        ...inv,
      ]);
      setBulkResults(results);
    } catch (err) {
      alert(err.response?.data?.error || "Xatolik");
    }
  };

  const handleSellAllBulk = async () => {
    if (!bulkResults) return;
    setBulkSelling(true);
    let newBalance = balance;
    const soldIds = [];
    for (const r of bulkResults) {
      try {
        const res = await client.post(`/inventory/${r.invId}/sell`);
        newBalance = res.data.balance;
        soldIds.push(r.invId);
      } catch (err) {
        // ayrim item sotib bo'lmasa ham davom etamiz
      }
    }
    setBalance(newBalance);
    setInventory((inv) => inv.filter((item) => !soldIds.includes(item._invId)));
    const totalSold = bulkResults
      .filter((r) => soldIds.includes(r.invId))
      .reduce((a, r) => a + r.skin.price * 0.9, 0);
    if (totalSold > 0) addTx(`Ko'p sotish (${soldIds.length} ta)`, totalSold);
    setBulkSelling(false);
    setBulkResults(null);
  };

  const handleDaily = async () => {
    if (!dailyAvailable) return;
    try {
      const res = await client.post("/daily/claim");
      setBalance(res.data.balance);
      setDailyAvailable(false);
      addTx("Kunlik bonus", 0.1);
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
      const bought = listings.find((l) => l._id === listingId);
      if (bought) {
        setInventory((inv) => [{ ...bought.skin }, ...inv]);
        addTx(`Sotib olindi: ${bought.skin.name}`, -bought.price);
      }
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
    setViewingCase(null);
    setTab(id);
  };

  if (!loaded) {
    return (
      <div
        className="w-full min-h-[680px] flex items-center justify-center"
        style={{ background: "#05060A" }}
      >
        <div className="text-sm font-semibold" style={{ color: "#7C8399" }}>
          Yuklanmoqda...
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full min-h-[680px] flex items-center justify-center"
      style={{ background: "#05060A" }}
    >
      <style>{`
        @keyframes dropIn { 0% { opacity:0; transform:scale(.6) translateY(10px);} 60% { opacity:1; transform:scale(1.06) translateY(0);} 100% { transform:scale(1); opacity:1; } }
        @keyframes flashOut { 0% { opacity:.28; } 100% { opacity:0; } }
        @keyframes ring1 { 0% { transform:scale(1); opacity:.9; } 100% { transform:scale(2.6); opacity:0; } }
        @keyframes ring2 { 0% { transform:scale(1); opacity:.7; } 100% { transform:scale(3.6); opacity:0; } }
      `}</style>
      <div
        className="w-full max-w-[380px] h-[720px] relative overflow-hidden"
        style={{
          background: "#05060A",
          borderRadius: 28,
          border: "1px solid #1B2030",
          fontFamily: "-apple-system, 'Segoe UI', Inter, Roboto, sans-serif",
        }}
      >
        <div className="h-full overflow-y-auto">
          {viewingCase ? (
            <CaseDetailScreen
              cs={viewingCase}
              skins={skins}
              balance={balance}
              onBack={() => setViewingCase(null)}
              onOpenSingle={(cs) => setOpenCase(cs)}
              onOpenBulk={handleBulkOpen}
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

        <div
          className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-2"
          style={{
            background: "linear-gradient(180deg, transparent, #05060A 30%)",
          }}
        >
          <div
            className="rounded-2xl flex items-center justify-around py-2"
            style={{ background: "#12151Fee", border: "1px solid #232838" }}
          >
            {NAV.map((n) => {
              const Icon = n.icon;
              const active = tab === n.id && !viewingCase;
              return (
                <button
                  key={n.id}
                  onClick={() => goTab(n.id)}
                  className="flex flex-col items-center gap-0.5 px-2 py-1 relative"
                >
                  {active && (
                    <div
                      className="absolute -top-2 w-1 h-1 rounded-full"
                      style={{ background: "#7C5CFC" }}
                    />
                  )}
                  <Icon
                    size={19}
                    color={active ? "#7C5CFC" : "#4B5266"}
                    strokeWidth={active ? 2.4 : 1.8}
                  />
                  <span
                    className="text-[9px] font-semibold"
                    style={{ color: active ? "#EDEFF6" : "#4B5266" }}
                  >
                    {n.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {adminChecking && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center"
            style={{ background: "rgba(5,6,10,.6)" }}
          >
            <div
              className="px-4 py-3 rounded-xl text-xs font-semibold"
              style={{ background: "#12151F", color: "#7C8399", border: "1px solid #232838" }}
            >
              Tekshirilmoqda...
            </div>
          </div>
        )}

        {openCase && (
          <CaseOpenModal
            cs={openCase}
            skins={skins}
            balance={balance}
            onClose={() => setOpenCase(null)}
            onOpened={handleOpened}
            onResolve={handleResolve}
          />
        )}

        {bulkResults && (
          <BulkResultModal
            results={bulkResults}
            onClose={() => setBulkResults(null)}
            onSellAll={handleSellAllBulk}
            selling={bulkSelling}
          />
        )}

        {showAdmin && (
          <AdminScreen
            cases={cases}
            skins={skins}
            token={adminToken}
            onAddCase={(c) => setCases((cs) => [...cs, c])}
            onAddSkin={(s) => setSkins((ss) => [...ss, s])}
            onDeleteCase={async (id) => {
              await createAdminClient(adminToken).delete(`/admin/cases/${id}`);
              setCases((cs) => cs.filter((c) => c.id !== id));
            }}
            onDeleteSkin={async (id) => {
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