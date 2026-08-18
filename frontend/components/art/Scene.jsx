const PALETTES = {
  savanna: {
    sky: ["#FBF3DF", "#FBE7C4", "#F5CE92"],
    sun: "#F3B04C",
    far: "#C9A96E",
    mid: "#7FA05E",
    near: "#3E7A4E",
    ground: "#E4D2A4",
    dark: "#16493B",
  },
  coast: {
    sky: ["#FEF6E0", "#FCE5C0", "#F7CA9B"],
    sun: "#F5A94E",
    far: "#F2D9A8",
    mid: "#3E8F85",
    sea: "#1F7A75",
    near: "#0F5C55",
    dark: "#0B4038",
  },
  city: {
    sky: ["#FDF4E4", "#F8D9B8", "#F0BC93"],
    sun: "#F5A94E",
    far: "#D9A87C",
    mid: "#7C6A55",
    near: "#2E5550",
    ground: "#CBB489",
    dark: "#123B38",
  },
  highlands: {
    sky: ["#F4F7F1", "#EAF2E6", "#DCEBDB"],
    sun: "#F2C879",
    far: "#A8BFA4",
    mid: "#6E9C71",
    near: "#3E7A4E",
    ground: "#C9D9B4",
    dark: "#1F4D3E",
  },
  coffee: {
    sky: ["#FDF1E2", "#F7DCC0", "#ECC39A"],
    sun: "#F0A84C",
    far: "#D9B087",
    mid: "#A9805C",
    near: "#5C4433",
    ground: "#E8D2AC",
    dark: "#43301F",
  },
};

function Birds({ dark, className }) {
  return (
    <g fill="none" stroke={dark} strokeWidth="2" strokeLinecap="round" className={className}>
      <path d="M120 34 q6 -6 12 0 q6 -6 12 0" />
      <path d="M160 22 q5 -5 10 0 q5 -5 10 0" />
      <path d="M216 40 q6 -6 12 0 q6 -6 12 0" />
    </g>
  );
}

function Friends({ dark }) {
  return (
    <g fill={dark}>
      <circle cx="212" cy="118" r="6" />
      <path d="M212 126 c-2 0 -3 8 -3 12 h6 c0 -4 -1 -12 -3 -12z" />
      <circle cx="232" cy="121" r="6" />
      <path d="M232 129 c-2 0 -3 7 -3 11 h6 c0 -4 -1 -11 -3 -11z" />
      <path d="M218 131 q14 -8 28 0 q14 8 28 0" stroke={dark} strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </g>
  );
}

function Acacia({ dark }) {
  return (
    <g fill={dark}>
      <path d="M70 112 q-2 -30 0 -42" stroke={dark} strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M44 76 q26 -16 52 0 q-6 -10 -18 -14 q-8 -10 -22 -10 q-14 0 -22 10 q-12 4 -18 14z" />
      <path d="M60 80 q-16 -4 -22 -14 q20 4 30 6" />
      <path d="M80 76 q18 -8 26 -12 q-6 6 -14 12" />
    </g>
  );
}

function PalmTree({ dark }) {
  return (
    <g fill={dark}>
      <path d="M52 132 q2 -26 0 -38" stroke={dark} strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M52 95 q-18 -8 -22 -22 q24 6 32 12" />
      <path d="M52 95 q18 -8 26 -18 q-18 10 -30 12" />
      <path d="M52 92 q-4 -18 4 -26 q10 12 10 24" />
      <path d="M52 92 q10 -14 22 -16 q-10 12 -16 20" />
    </g>
  );
}

function Dhow({ dark, mid }) {
  return (
    <g>
      <path d="M150 128 q18 0 34 -14 l-14 2 q-12 10 -22 12 -6 1 -12 -2 l-8 2 q-6 -1 -12 1z" fill={dark} />
      <path d="M184 118 l-14 -26 l4 26z" fill="#FBF3DF" />
      <path d="M104 132 q40 6 80 0 q40 -6 96 0" stroke={dark} strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
  );
}

function Skyline({ dark }) {
  return (
    <g fill={dark}>
      <rect x="40" y="86" width="16" height="30" />
      <rect x="62" y="72" width="14" height="44" />
      <rect x="82" y="90" width="12" height="26" />
      <rect x="100" y="64" width="18" height="52" />
      <rect x="124" y="80" width="14" height="36" />
      <path d="M144 116 v-18 q8 -10 16 0 v18z" />
      <rect x="168" y="76" width="16" height="40" />
      <rect x="190" y="96" width="10" height="20" />
      <rect x="206" y="68" width="16" height="48" />
      <g fill="#F6C453">
        <rect x="46" y="90" width="3" height="3" />
        <rect x="54" y="98" width="3" height="3" />
        <rect x="67" y="78" width="3" height="3" />
        <rect x="75" y="92" width="3" height="3" />
        <rect x="106" y="70" width="3" height="3" />
        <rect x="114" y="96" width="3" height="3" />
        <rect x="173" y="82" width="3" height="3" />
        <rect x="181" y="100" width="3" height="3" />
        <rect x="212" y="74" width="3" height="3" />
        <rect x="219" y="90" width="3" height="3" />
      </g>
    </g>
  );
}

function Peaks() {
  return (
    <g>
      <path d="M80 88 l30 -34 l22 22 l18 -14 l22 26z" fill="#8FA69A" />
      <path d="M110 54 l-6 2 l14 12 12 -10z" fill="#E8F0E4" />
      <path d="M214 92 l26 -30 l18 16 l16 -12 l20 26z" fill="#8FA69A" />
    </g>
  );
}

function TeaRows({ mid, near }) {
  const rows = [];
  for (let i = 0; i < 5; i++) {
    rows.push(
      <path
        key={i}
        d={`M0 ${104 + i * 8} q80 -7 160 0 q80 7 160 0`}
        stroke={i % 2 ? near : mid}
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
    );
  }
  return <g>{rows}</g>;
}

function Cup({ dark }) {
  return (
    <g>
      <rect x="136" y="66" width="48" height="34" rx="8" fill="#FEF6E0" stroke={dark} strokeWidth="3" />
      <path d="M172 78 q14 0 14 10 q0 10 -14 10" stroke={dark} strokeWidth="3" fill="none" />
      <path d="M160 56 q-6 -8 0 -16 q6 -8 0 -16" stroke={dark} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M178 60 q-5 -7 0 -14" stroke={dark} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M148 62 q6 4 0 8" stroke={dark} strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </g>
  );
}

function Table({ dark }) {
  return (
    <g stroke={dark} strokeWidth="4" strokeLinecap="round" fill={dark}>
      <path d="M100 116 h120" />
      <path d="M110 116 v22" fill="none" />
      <path d="M210 116 v22" fill="none" />
      <circle cx="160" cy="126" r="4" fill="none" />
      <circle cx="160" cy="136" r="4" fill="none" />
    </g>
  );
}

const VANITY = (n) => `scene${n}`;

export default function Scene({ variant = "savanna", className, uid }) {
  const p = PALETTES[variant] || PALETTES.savanna;
  const id = (suffix) => `${uid || "sc"}-${suffix}`;
  return (
    <svg viewBox="0 0 320 160" className={className} role="img" aria-label={variant} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={id("sky")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.sky[0]} />
          <stop offset="55%" stopColor={p.sky[1]} />
          <stop offset="100%" stopColor={p.sky[2]} />
        </linearGradient>
      </defs>
      <rect width="320" height="160" fill={`url(#${id("sky")})`} />
      <circle cx="252" cy="36" r="16" fill={p.sun} opacity="0.9" />

      {variant === "savanna" && (
        <>
          <path d="M0 108 q80 -22 160 -12 q80 10 160 -2 v66 h-320z" fill={p.far} />
          <path d="M0 124 q80 -18 160 -10 q80 8 160 -4 v50 h-320z" fill={p.mid} />
          <path d="M0 138 q80 -12 160 -6 q80 6 160 -2 v30 h-320z" fill={p.near} />
          <path d="M0 152 q80 -14 160 -8 q80 6 160 -2 v18 h-320z" fill={p.ground} />
          <Acacia dark={p.dark} />
          <Friends dark={p.dark} />
          <Birds dark={p.dark} />
        </>
      )}

      {variant === "coast" && (
        <>
          <path d="M0 62 q160 -30 320 -6 v34 h-320z" fill={p.far} />
          <path d="M0 84 q160 -22 320 0 v20 h-320z" fill={p.mid} />
          <path d="M0 104 q200 26 320 6 v50 h-320z" fill={p.sea} />
          <Dhow dark={p.dark} />
          <PalmTree dark={p.dark} />
          <PalmTree dark={p.dark} />
          <path d="M318 148 q-40 8 -80 0" stroke={p.dark} strokeWidth="3" fill="none" opacity="0.6" />
          <Birds dark={p.dark} />
        </>
      )}

      {variant === "city" && (
        <>
          <path d="M0 116 q160 -24 320 -6 v50 h-320z" fill={p.mid} />
          <Skyline dark={p.near} />
          <path d="M0 148 q80 -8 160 -4 q80 4 160 -2 v18 h-320z" fill={p.ground} />
          <path d="M252 70 l12 -22 4 12 10 -10 2 20z" fill={p.near} />
        </>
      )}

      {variant === "highlands" && (
        <>
          <Peaks />
          <path d="M0 100 q80 -16 160 -8 q80 8 160 -4 v20 h-320z" fill={p.mid} />
          <TeaRows mid={p.mid} near={p.near} />
          <path d="M0 148 q80 -10 160 -6 q80 4 160 -2 v20 h-320z" fill={p.ground} />
          <Friends dark={p.dark} />
          <g fill="#FDFDF8" opacity="0.85">
            <ellipse cx="92" cy="40" rx="22" ry="8" />
            <ellipse cx="230" cy="30" rx="28" ry="9" />
            <ellipse cx="140" cy="22" rx="16" ry="6" />
          </g>
        </>
      )}

      {variant === "coffee" && (
        <>
          <path d="M0 108 q80 -20 160 -10 q80 10 160 -4 v66 h-320z" fill={p.far} />
          <path d="M0 128 q80 -14 160 -8 q80 6 160 -2 v42 h-320z" fill={p.mid} />
          <path d="M0 152 q80 -10 160 -5 q80 5 160 -1 v14 h-320z" fill={p.ground} />
          <Table dark={p.dark} />
          <Cup dark={p.dark} />
          <Birds dark={p.dark} />
        </>
      )}
    </svg>
  );
}

export const SCENE_VARIANTS = Object.keys(PALETTES);