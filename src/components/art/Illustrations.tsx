export function WalletArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 340 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="A 3D wallet with a rising bar chart"
    >
      <defs>
        <linearGradient id="wa-body" x1="70" y1="100" x2="270" y2="250" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7DD3FC" />
          <stop offset=".45" stopColor="#0EA5E9" />
          <stop offset="1" stopColor="#0369A1" />
        </linearGradient>
        <linearGradient id="wa-flap" x1="80" y1="180" x2="270" y2="260" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38BDF8" />
          <stop offset="1" stopColor="#0284C7" />
        </linearGradient>
        <linearGradient id="wa-card" x1="120" y1="60" x2="220" y2="190" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#E0F2FE" />
        </linearGradient>
        <linearGradient id="wa-coin" x1="250" y1="50" x2="300" y2="110" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDE68A" />
          <stop offset=".55" stopColor="#F59E0B" />
          <stop offset="1" stopColor="#B45309" />
        </linearGradient>
        <filter id="wa-shadow" x="30" y="30" width="290" height="240" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="18" stdDeviation="16" floodColor="#0369A1" floodOpacity=".22" />
        </filter>
        <filter id="wa-blur" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
      </defs>

      <ellipse cx="170" cy="247" rx="104" ry="18" fill="#BAE6FD" opacity=".55" />
      <circle cx="169" cy="132" r="106" fill="#F0F9FF" />
      <circle cx="278" cy="66" r="44" fill="#E0F2FE" opacity=".85" />

      <g filter="url(#wa-shadow)">
        <g transform="rotate(-5 170 160)">
          <rect x="66" y="105" width="196" height="128" rx="34" fill="url(#wa-body)" />
          <rect x="80" y="118" width="168" height="100" rx="26" fill="#0C4A6E" opacity=".16" />
          <path
            d="M66 148c0-23.2 18.8-42 42-42h112c23.2 0 42 18.8 42 42v16H66v-16Z"
            fill="#0284C7"
            opacity=".55"
          />
          <rect x="96" y="76" width="104" height="72" rx="18" fill="url(#wa-card)" />
          <rect x="96" y="76" width="104" height="72" rx="18" stroke="#BAE6FD" />
          <rect x="110" y="118" width="11" height="18" rx="4" fill="#0EA5E9" />
          <rect x="128" y="106" width="11" height="30" rx="4" fill="#38BDF8" />
          <rect x="146" y="94" width="11" height="42" rx="4" fill="#0369A1" />
          <circle cx="176" cy="99" r="8" fill="#BAE6FD" />
          <circle cx="176" cy="99" r="3.5" fill="#0284C7" />

          <rect x="66" y="178" width="196" height="55" rx="27" fill="url(#wa-flap)" />
          <rect x="66" y="178" width="196" height="55" rx="27" stroke="#7DD3FC" strokeOpacity=".5" />
          <rect x="206" y="192" width="44" height="27" rx="13" fill="#0C4A6E" opacity=".3" />
          <circle cx="228" cy="205.5" r="7" fill="#E0F2FE" />
          <circle cx="228" cy="205.5" r="3" fill="#0EA5E9" />
        </g>

        <g transform="rotate(8 277 87)">
          <ellipse cx="277" cy="94" rx="26" ry="9" fill="#B45309" opacity=".35" filter="url(#wa-blur)" />
          <circle cx="277" cy="78" r="25" fill="url(#wa-coin)" />
          <circle cx="277" cy="78" r="18" fill="#FBBF24" opacity=".55" />
          <path
            d="M269 70.5h16M269 78h16M282 70.5 271 86M272 70.5 283 86"
            stroke="#92400E"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <path d="M262 65a25 25 0 0 1 19-11" stroke="#FEF3C7" strokeWidth="3" strokeLinecap="round" opacity=".8" />
        </g>

        <g transform="rotate(-12 63 214)">
          <ellipse cx="63" cy="226" rx="22" ry="7" fill="#0369A1" opacity=".25" filter="url(#wa-blur)" />
          <circle cx="63" cy="214" r="20" fill="url(#wa-coin)" />
          <circle cx="63" cy="214" r="13.5" fill="#FBBF24" opacity=".5" />
          <path d="M57 207.5h12M57 214h12M57 220.5h12" stroke="#92400E" strokeWidth="2.2" strokeLinecap="round" />
        </g>
      </g>

      <path d="M44 104c6-13 17-22 30-26" stroke="#7DD3FC" strokeWidth="4" strokeLinecap="round" opacity=".7" />
      <path d="M300 158c7 3 12 9 14 17" stroke="#7DD3FC" strokeWidth="4" strokeLinecap="round" opacity=".7" />
      <circle cx="42" cy="151" r="4" fill="#38BDF8" opacity=".8" />
      <circle cx="304" cy="127" r="3" fill="#0EA5E9" opacity=".7" />
      <circle cx="58" cy="75" r="2.5" fill="#7DD3FC" />
      <path d="m282 28 2.5 6.5L291 37l-6.5 2.5L282 46l-2.5-6.5L273 37l6.5-2.5L282 28Z" fill="#BAE6FD" />
    </svg>
  )
}

export function ReceiptArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="A receipt with coins and a paid check badge"
    >
      <defs>
        <linearGradient id="ra-paper" x1="100" y1="30" x2="210" y2="235" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#E0F2FE" />
        </linearGradient>
        <linearGradient id="ra-coin" x1="212" y1="172" x2="282" y2="242" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDE68A" />
          <stop offset=".6" stopColor="#F59E0B" />
          <stop offset="1" stopColor="#B45309" />
        </linearGradient>
        <linearGradient id="ra-badge" x1="196" y1="172" x2="262" y2="238" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34D399" />
          <stop offset="1" stopColor="#047857" />
        </linearGradient>
        <filter id="ra-shadow" x="30" y="20" width="260" height="250" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="16" stdDeviation="14" floodColor="#0369A1" floodOpacity=".2" />
        </filter>
        <filter id="ra-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>

      <ellipse cx="160" cy="250" rx="100" ry="17" fill="#BAE6FD" opacity=".55" />
      <circle cx="160" cy="135" r="106" fill="#F0F9FF" />
      <circle cx="68" cy="78" r="36" fill="#E0F2FE" opacity=".8" />

      <g filter="url(#ra-shadow)">
        <g transform="rotate(-6 150 135)">
          <path
            d="M96 44c0-8.8 7.2-16 16-16h76c8.8 0 16 7.2 16 16v178l-14-10-14 10-14-10-14 10-14-10-14 10-14-10-14 10V44Z"
            fill="url(#ra-paper)"
          />
          <path d="M120 62h60" stroke="#94A3B8" strokeWidth="5" strokeLinecap="round" />
          <path d="M120 80h40" stroke="#CBD5E1" strokeWidth="4" strokeLinecap="round" />
          <path d="M120 108h56" stroke="#E2E8F0" strokeWidth="4" strokeLinecap="round" />
          <path d="M120 124h48" stroke="#E2E8F0" strokeWidth="4" strokeLinecap="round" />
          <path d="M120 140h56" stroke="#E2E8F0" strokeWidth="4" strokeLinecap="round" />
          <rect x="120" y="164" width="56" height="24" rx="8" fill="#E0F2FE" />
          <path d="M130 176h36" stroke="#0EA5E9" strokeWidth="4" strokeLinecap="round" />
          <rect x="120" y="198" width="56" height="8" rx="4" fill="#E2E8F0" />
        </g>

        <g>
          <ellipse cx="248" cy="222" rx="34" ry="10" fill="#B45309" opacity=".28" filter="url(#ra-blur)" />
          <circle cx="248" cy="204" r="29" fill="url(#ra-coin)" />
          <circle cx="248" cy="204" r="20" fill="#FBBF24" opacity=".5" />
          <path
            d="M238 196h20M238 204h20M238 212h20M253 196l-14 16M241 196l14 16"
            stroke="#92400E"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <path d="M232 188a29 29 0 0 1 20-11" stroke="#FEF3C7" strokeWidth="3" strokeLinecap="round" opacity=".8" />
        </g>

        <g>
          <circle cx="226" cy="202" r="30" fill="url(#ra-badge)" />
          <circle cx="226" cy="202" r="22" fill="#10B981" opacity=".55" />
          <path d="m215 202 8 8 15-17" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M207 187a30 30 0 0 1 19-13" stroke="#A7F3D0" strokeWidth="3" strokeLinecap="round" opacity=".8" />
        </g>
      </g>

      <path d="M60 146c-6 5-10 11-11 18" stroke="#7DD3FC" strokeWidth="4" strokeLinecap="round" opacity=".7" />
      <circle cx="274" cy="74" r="4" fill="#38BDF8" />
      <circle cx="52" cy="197" r="3" fill="#0EA5E9" opacity=".7" />
      <path d="m64 32 2.5 6.5L73 41l-6.5 2.5L64 50l-2.5-6.5L55 41l6.5-2.5L64 32Z" fill="#BAE6FD" />
    </svg>
  )
}

export function CoinsArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="A stack of currency coins"
    >
      <defs>
        <linearGradient id="ca-gold" x1="90" y1="80" x2="230" y2="230" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FEF3C7" />
          <stop offset=".35" stopColor="#FBBF24" />
          <stop offset="1" stopColor="#B45309" />
        </linearGradient>
        <linearGradient id="ca-sky" x1="120" y1="60" x2="230" y2="210" gradientUnits="userSpaceOnUse">
          <stop stopColor="#BAE6FD" />
          <stop offset=".45" stopColor="#0EA5E9" />
          <stop offset="1" stopColor="#0369A1" />
        </linearGradient>
        <filter id="ca-shadow" x="20" y="20" width="280" height="250" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="16" stdDeviation="14" floodColor="#0369A1" floodOpacity=".2" />
        </filter>
        <filter id="ca-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>

      <ellipse cx="160" cy="246" rx="96" ry="17" fill="#BAE6FD" opacity=".6" />
      <circle cx="160" cy="134" r="106" fill="#F0F9FF" />

      <g filter="url(#ca-shadow)">
        <g>
          <ellipse cx="160" cy="218" rx="62" ry="19" fill="#B45309" opacity=".3" filter="url(#ca-blur)" />
          <ellipse cx="160" cy="202" rx="60" ry="20" fill="#B45309" />
          <ellipse cx="160" cy="193" rx="60" ry="20" fill="url(#ca-gold)" />
          <ellipse cx="160" cy="193" rx="45" ry="13" fill="#FCD34D" opacity=".55" />
          <path d="M143 184h34M143 193h34M143 202h34" stroke="#92400E" strokeWidth="3" strokeLinecap="round" />
        </g>

        <g transform="rotate(-8 160 148)">
          <ellipse cx="160" cy="168" rx="60" ry="20" fill="#075985" />
          <ellipse cx="160" cy="158" rx="60" ry="20" fill="url(#ca-sky)" />
          <ellipse cx="160" cy="158" rx="45" ry="13" fill="#38BDF8" opacity=".45" />
          <path
            d="M148 146h24M148 155h24M148 164h24M164 146l-18 20M156 146l18 20"
            stroke="#E0F2FE"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path d="M118 145a60 20 0 0 1 24-13" stroke="#E0F2FE" strokeWidth="3.5" strokeLinecap="round" opacity=".7" />
        </g>

        <g transform="rotate(14 226 82)">
          <circle cx="226" cy="82" r="32" fill="#B45309" opacity=".3" filter="url(#ca-blur)" />
          <circle cx="226" cy="82" r="32" fill="url(#ca-gold)" />
          <circle cx="226" cy="82" r="22" fill="#FBBF24" opacity=".5" />
          <path d="M214 72h24M214 82h24M214 92h24" stroke="#92400E" strokeWidth="3" strokeLinecap="round" />
          <path d="M207 63a32 32 0 0 1 22-12" stroke="#FEF3C7" strokeWidth="3.5" strokeLinecap="round" opacity=".8" />
        </g>
      </g>

      <path d="m76 84 3.5 9 9 3.5-9 3.5-3.5 9-3.5-9-9-3.5 9-3.5L76 84Z" fill="#BAE6FD" />
      <circle cx="262" cy="178" r="4" fill="#38BDF8" />
      <circle cx="70" cy="190" r="3" fill="#0EA5E9" opacity=".7" />
      <path d="M264 36v14M257 43h14" stroke="#7DD3FC" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function TargetArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="A target with an arrow hitting the bullseye"
    >
      <defs>
        <linearGradient id="ta-ring" x1="80" y1="60" x2="240" y2="230" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7DD3FC" />
          <stop offset=".55" stopColor="#0EA5E9" />
          <stop offset="1" stopColor="#0369A1" />
        </linearGradient>
        <linearGradient id="ta-arrow" x1="160" y1="40" x2="230" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0F172A" />
          <stop offset="1" stopColor="#334155" />
        </linearGradient>
        <filter id="ta-shadow" x="20" y="20" width="290" height="260" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="18" stdDeviation="15" floodColor="#0369A1" floodOpacity=".22" />
        </filter>
        <filter id="ta-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>

      <ellipse cx="158" cy="248" rx="98" ry="17" fill="#BAE6FD" opacity=".55" />
      <circle cx="158" cy="138" r="106" fill="#F0F9FF" />
      <circle cx="258" cy="76" r="38" fill="#E0F2FE" opacity=".8" />

      <g filter="url(#ta-shadow)">
        <g transform="rotate(-4 156 152)">
          <circle cx="156" cy="152" r="88" fill="#E0F2FE" />
          <circle cx="156" cy="152" r="88" stroke="#BAE6FD" strokeWidth="2" />
          <circle cx="156" cy="152" r="66" fill="white" />
          <circle cx="156" cy="152" r="46" fill="url(#ta-ring)" />
          <circle cx="156" cy="152" r="26" fill="white" />
          <circle cx="156" cy="152" r="12" fill="#F43F5E" />
          <path d="M156 96v-9M156 217v9M100 152h-9M221 152h9" stroke="#7DD3FC" strokeWidth="4" strokeLinecap="round" />
        </g>

        <g transform="rotate(38 210 92)">
          <ellipse cx="210" cy="106" rx="52" ry="9" fill="#0F172A" opacity=".18" filter="url(#ta-blur)" />
          <rect x="204" y="36" width="11" height="82" rx="5.5" fill="url(#ta-arrow)" />
          <path d="M199 40h22l-11-16-11 16Z" fill="#0F172A" />
          <path d="M209.5 40v76" stroke="#64748B" strokeWidth="2" strokeLinecap="round" opacity=".55" />
          <path d="M210 118c-9-2-17 2-22 9 8 3 17 1 22-5" fill="#F43F5E" />
          <path d="M210 118c9-2 17 2 22 9-8 3-17 1-22-5" fill="#FB7185" />
        </g>
      </g>

      <path d="m66 94 3 8 8 3-8 3-3 8-3-8-8-3 8-3 3-8Z" fill="#BAE6FD" />
      <circle cx="270" cy="190" r="4" fill="#38BDF8" />
      <circle cx="56" cy="180" r="3" fill="#0EA5E9" opacity=".7" />
      <path d="M252 36c8 4 14 11 17 19" stroke="#7DD3FC" strokeWidth="4" strokeLinecap="round" opacity=".7" />
    </svg>
  )
}

export function EmptyArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="An empty wallet illustration"
    >
      <defs>
        <linearGradient id="ea-body" x1="55" y1="80" x2="190" y2="180" gradientUnits="userSpaceOnUse">
          <stop stopColor="#BAE6FD" />
          <stop offset=".5" stopColor="#38BDF8" />
          <stop offset="1" stopColor="#0284C7" />
        </linearGradient>
        <filter id="ea-shadow" x="20" y="40" width="200" height="150" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#0369A1" floodOpacity=".2" />
        </filter>
      </defs>
      <ellipse cx="120" cy="174" rx="74" ry="12" fill="#BAE6FD" opacity=".6" />
      <circle cx="120" cy="100" r="76" fill="#F0F9FF" />
      <g filter="url(#ea-shadow)">
        <rect x="48" y="78" width="144" height="90" rx="26" fill="url(#ea-body)" />
        <rect x="62" y="92" width="116" height="62" rx="18" fill="#0369A1" opacity=".18" />
        <rect x="48" y="126" width="144" height="42" rx="21" fill="#0EA5E9" />
        <rect x="148" y="137" width="30" height="20" rx="10" fill="#0C4A6E" opacity=".3" />
        <circle cx="163" cy="147" r="5" fill="#E0F2FE" />
        <rect x="74" y="62" width="60" height="44" rx="13" fill="white" opacity=".85" />
        <rect x="84" y="82" width="8" height="12" rx="3" fill="#38BDF8" />
        <rect x="97" y="74" width="8" height="20" rx="3" fill="#0EA5E9" />
        <rect x="110" y="68" width="8" height="26" rx="3" fill="#0369A1" />
      </g>
      <path d="M42 60c8-5 17-7 26-7" stroke="#7DD3FC" strokeWidth="3.5" strokeLinecap="round" opacity=".8" />
      <path d="M192 70c6 3 11 8 14 14" stroke="#7DD3FC" strokeWidth="3.5" strokeLinecap="round" opacity=".8" />
      <circle cx="204" cy="48" r="3" fill="#38BDF8" />
      <path d="m38 116 2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z" fill="#BAE6FD" />
    </svg>
  )
}

export function SecureArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 280 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="A shield with a check mark"
    >
      <defs>
        <linearGradient id="sa-shield" x1="80" y1="30" x2="210" y2="210" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7DD3FC" />
          <stop offset=".5" stopColor="#0EA5E9" />
          <stop offset="1" stopColor="#0369A1" />
        </linearGradient>
        <filter id="sa-shadow" x="20" y="10" width="240" height="230" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="16" stdDeviation="14" floodColor="#0369A1" floodOpacity=".25" />
        </filter>
      </defs>
      <circle cx="140" cy="118" r="92" fill="#F0F9FF" />
      <ellipse cx="140" cy="216" rx="70" ry="12" fill="#BAE6FD" opacity=".6" />
      <g filter="url(#sa-shadow)">
        <path
          d="M140 32c22 14 45 20 62 22v54c0 43-25 72-62 90-37-18-62-47-62-90V54c17-2 40-8 62-22Z"
          fill="url(#sa-shield)"
        />
        <path
          d="M140 47c17 10 35 16 49 18v43c0 34-19 58-49 74-30-16-49-40-49-74V65c14-2 32-8 49-18Z"
          fill="#0284C7"
          opacity=".4"
        />
        <path d="m114 116 19 19 35-40" stroke="white" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M96 58c12-5 24-9 33-13" stroke="#E0F2FE" strokeWidth="4" strokeLinecap="round" opacity=".7" />
      </g>
      <circle cx="228" cy="58" r="18" fill="#E0F2FE" />
      <path d="M228 49v10l6 4" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" />
      <path d="m48 74 3 8 8 3-8 3-3 8-3-8-8-3 8-3 3-8Z" fill="#BAE6FD" />
      <circle cx="230" cy="178" r="4" fill="#38BDF8" />
    </svg>
  )
}
