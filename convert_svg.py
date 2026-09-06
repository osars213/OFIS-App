import re

# High precision SVG reproduction of the exact 3D render:
# - Glowing neon green circular portal arch with bright lime/yellow highlight
# - Open 3D perspective door with green face, interior paneling, brass handle, warm golden light radiating outward
# - 3D chrome metallic OFIS wordmark with specular highlights, emerald ambient bottom reflection, inner bevels
# - Vivid neon lime teardrop map pin directly above the 'i'
# - Tagline: "FIND THE RIGHT SPACE." "BOOK IT WHEN YOU NEED IT."

svg_content = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 650" width="100%" height="100%">
  <defs>
    <!-- Background glow & ambient -->
    <radialGradient id="portalGlow" cx="280" cy="300" r="320" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#84cc16" stop-opacity="0.45"/>
      <stop offset="35%" stop-color="#16a34a" stop-opacity="0.25"/>
      <stop offset="70%" stop-color="#064e3b" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>

    <!-- Warm interior door light burst -->
    <radialGradient id="doorLightGlow" cx="370" cy="330" r="160" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="1"/>
      <stop offset="20%" stop-color="#fef08a" stop-opacity="0.95"/>
      <stop offset="50%" stop-color="#eab308" stop-opacity="0.6"/>
      <stop offset="80%" stop-color="#84cc16" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>

    <!-- Outer Arch Ring Gradient (Lime Yellow to Forest Emerald) -->
    <linearGradient id="archMainGrad" x1="120" y1="460" x2="450" y2="80" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#047857"/>
      <stop offset="25%" stop-color="#10b981"/>
      <stop offset="55%" stop-color="#22c55e"/>
      <stop offset="80%" stop-color="#84cc16"/>
      <stop offset="100%" stop-color="#facc15"/>
    </linearGradient>

    <!-- Arch Inner Bevel Gradient -->
    <linearGradient id="archInnerBevel" x1="200" y1="120" x2="360" y2="460" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.8"/>
      <stop offset="30%" stop-color="#ffffff" stop-opacity="0.1"/>
      <stop offset="70%" stop-color="#000000" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.8"/>
    </linearGradient>

    <!-- Arch Side 3D Extrusion -->
    <linearGradient id="archSideExtrude" x1="100" y1="300" x2="460" y2="300" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#064e3b"/>
      <stop offset="50%" stop-color="#047857"/>
      <stop offset="100%" stop-color="#022c22"/>
    </linearGradient>

    <!-- Door Face Gradient -->
    <linearGradient id="doorFaceGrad" x1="270" y1="170" x2="360" y2="450" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#84cc16"/>
      <stop offset="40%" stop-color="#22c55e"/>
      <stop offset="100%" stop-color="#0f766e"/>
    </linearGradient>

    <!-- Door Edge (Side Bevel) -->
    <linearGradient id="doorEdgeHighlight" x1="355" y1="190" x2="365" y2="450" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="30%" stop-color="#fef08a"/>
      <stop offset="100%" stop-color="#ca8a04"/>
    </linearGradient>

    <!-- Floor Light Beam Projection -->
    <linearGradient id="floorBeam" x1="340" y1="360" x2="300" y2="520" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
      <stop offset="25%" stop-color="#fde047" stop-opacity="0.75"/>
      <stop offset="60%" stop-color="#84cc16" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </linearGradient>

    <!-- Chrome Metallic 3D Letter Body Gradient -->
    <linearGradient id="chromeBody" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="15%" stop-color="#f1f5f9"/>
      <stop offset="45%" stop-color="#cbd5e1"/>
      <stop offset="55%" stop-color="#94a3b8"/>
      <stop offset="85%" stop-color="#e2e8f0"/>
      <stop offset="100%" stop-color="#f8fafc"/>
    </linearGradient>

    <!-- Chrome Bottom Ambient Emerald Reflection -->
    <linearGradient id="chromeGreenReflection" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="65%" stop-color="#22c55e" stop-opacity="0"/>
      <stop offset="88%" stop-color="#4ade80" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#86efac" stop-opacity="0.9"/>
    </linearGradient>

    <!-- 3D Letter Extrusion / Drop Sides -->
    <linearGradient id="chromeExtrusion" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#64748b"/>
      <stop offset="50%" stop-color="#334155"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>

    <!-- Chrome Top Bevel Specular -->
    <linearGradient id="specularBevel" x1="0%" y1="0%" x2="100%" y2="50%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
      <stop offset="35%" stop-color="#ffffff" stop-opacity="0.4"/>
      <stop offset="70%" stop-color="#64748b" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#1e293b" stop-opacity="0.8"/>
    </linearGradient>

    <!-- 3D Map Pin Gradient -->
    <linearGradient id="pinGrad" x1="1040" y1="80" x2="1140" y2="240" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#facc15"/>
      <stop offset="30%" stop-color="#84cc16"/>
      <stop offset="70%" stop-color="#22c55e"/>
      <stop offset="100%" stop-color="#15803d"/>
    </linearGradient>

    <radialGradient id="pinInnerHole" cx="1090" cy="140" r="28" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#022c22"/>
      <stop offset="70%" stop-color="#064e3b"/>
      <stop offset="100%" stop-color="#15803d"/>
    </radialGradient>

    <!-- Glow & Shadow Filters -->
    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="12" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>

    <filter id="lightSpread" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="18" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>

    <filter id="letterShadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="16" stdDeviation="14" flood-color="#000000" flood-opacity="0.8"/>
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#22c55e" flood-opacity="0.25"/>
    </filter>
  </defs>

  <!-- ==================== BACKGROUND AMBIENT GLOW ==================== -->
  <circle cx="280" cy="300" r="280" fill="url(#portalGlow)"/>

  <!-- ==================== EMBLEM: THE 3D GREEN PORTAL & DOOR ==================== -->
  <g id="portal-emblem">
    <!-- Floor Light Projection -->
    <polygon points="340,360 365,360 440,510 180,510" fill="url(#floorBeam)" opacity="0.85" filter="url(#lightSpread)"/>

    <!-- Arch Back 3D Base Plate (Dark Graphite Outer Rim) -->
    <path d="M 170 450 A 175 175 0 1 1 390 450 L 345 450 A 130 130 0 1 0 215 450 Z" fill="url(#archSideExtrude)" transform="translate(4, 10)"/>

    <!-- Radiant Warm Light Behind Door Aperture -->
    <ellipse cx="345" cy="330" rx="90" ry="130" fill="url(#doorLightGlow)" filter="url(#lightSpread)"/>

    <!-- Light Burst Opening -->
    <polygon points="268,180 348,205 352,435 272,450" fill="#ffffff" opacity="0.95" filter="url(#softGlow)"/>

    <!-- 3D Open Door Leaf -->
    <!-- Door Beveled Right Edge (Reflecting golden door light) -->
    <polygon points="342,198 348,200 352,432 346,430" fill="url(#doorEdgeHighlight)"/>

    <!-- Door Front Face (Perspective Angled) -->
    <polygon points="268,175 342,198 346,430 272,452" fill="url(#doorFaceGrad)" stroke="#065f46" stroke-width="2"/>

    <!-- Door Inset Panels (3D Depth) -->
    <polygon points="280,195 330,210 330,290 280,278" fill="#15803d" stroke="#166534" stroke-width="1.5" opacity="0.85"/>
    <polygon points="280,310 330,320 330,410 280,425" fill="#15803d" stroke="#166534" stroke-width="1.5" opacity="0.85"/>

    <!-- Door Brass Handle / Knob with Specular Sparkle -->
    <ellipse cx="332" cy="318" rx="7" ry="6" fill="#fef08a" stroke="#ca8a04" stroke-width="2" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.5))"/>
    <circle cx="330" cy="316" r="2" fill="#ffffff"/>

    <!-- Glowing Portal Arch Main 3D Torus Ring -->
    <path d="M 170 440 
             A 165 165 0 1 1 390 440 
             L 340 440 
             A 120 120 0 1 0 220 440 
             Z" 
          fill="url(#archMainGrad)" 
          stroke="#15803d" 
          stroke-width="3"
          filter="url(#softGlow)"
    />

    <!-- Portal Specular Gloss Highlight -->
    <path d="M 170 440 
             A 165 165 0 1 1 390 440 
             L 340 440 
             A 120 120 0 1 0 220 440 
             Z" 
          fill="url(#archInnerBevel)" 
          opacity="0.55"
    />

    <!-- Ambient Floating Green Micro-Orbs -->
    <circle cx="120" cy="220" r="4.5" fill="#84cc16" filter="url(#softGlow)"/>
    <circle cx="120" cy="220" r="1.5" fill="#ffffff"/>
  </g>

  <!-- ==================== 3D CHROME WORDMARK: OFIS ==================== -->
  <g id="chrome-ofis-wordmark" filter="url(#letterShadow)" transform="translate(480, 0)">
    
    <!-- 1. LETTER 'O' -->
    <g id="letter-O" transform="translate(20, 160)">
      <!-- 3D Extrusion (Side/Bottom Depth) -->
      <rect x="0" y="16" width="180" height="235" rx="55" fill="url(#chromeExtrusion)"/>
      <rect x="42" y="58" width="96" height="150" rx="30" fill="#0b0f17"/>

      <!-- Main Face -->
      <rect x="0" y="0" width="180" height="235" rx="55" fill="url(#chromeBody)" stroke="url(#specularBevel)" stroke-width="4"/>
      <rect x="42" y="42" width="96" height="151" rx="30" fill="#0f172a" stroke="url(#specularBevel)" stroke-width="4"/>

      <!-- Ambient Green Glow Reflection on Bottom Lip -->
      <rect x="0" y="0" width="180" height="235" rx="55" fill="url(#chromeGreenReflection)"/>

      <!-- Specular Highlight Curve -->
      <path d="M 55 10 Q 90 4 125 10" stroke="#ffffff" stroke-width="6" stroke-linecap="round" opacity="0.9"/>
    </g>

    <!-- 2. LETTER 'F' -->
    <g id="letter-F" transform="translate(240, 160)">
      <!-- 3D Extrusion Base -->
      <path d="M 0 55 C 0 25 25 0 55 0 L 175 0 L 175 48 L 50 48 L 50 96 L 155 96 L 155 144 L 50 144 L 50 235 L 0 235 Z" fill="url(#chromeExtrusion)" transform="translate(0, 16)"/>

      <!-- Main Face -->
      <path d="M 0 55 C 0 25 25 0 55 0 L 175 0 L 175 48 L 50 48 L 50 96 L 155 96 L 155 144 L 50 144 L 50 235 L 0 235 Z" 
            fill="url(#chromeBody)" 
            stroke="url(#specularBevel)" 
            stroke-width="4"
      />
      <!-- Bottom Ambient Emerald Reflection -->
      <path d="M 0 55 C 0 25 25 0 55 0 L 175 0 L 175 48 L 50 48 L 50 96 L 155 96 L 155 144 L 50 144 L 50 235 L 0 235 Z" 
            fill="url(#chromeGreenReflection)"
      />
      <!-- Top Specular Highlight -->
      <path d="M 55 8 L 165 8" stroke="#ffffff" stroke-width="6" stroke-linecap="round" opacity="0.9"/>
    </g>

    <!-- 3. LETTER 'i' (Stem + 3D Map Pin on Top) -->
    <g id="letter-i" transform="translate(455, 160)">
      <!-- Stem 3D Extrusion -->
      <rect x="18" y="106" width="50" height="145" rx="25" fill="url(#chromeExtrusion)"/>
      <!-- Stem Face -->
      <rect x="18" y="90" width="50" height="145" rx="25" fill="url(#chromeBody)" stroke="url(#specularBevel)" stroke-width="4"/>
      <rect x="18" y="90" width="50" height="145" rx="25" fill="url(#chromeGreenReflection)"/>

      <!-- 3D VIBRANT LIME-GREEN MAP PIN -->
      <g id="location-pin" transform="translate(-8, -95)">
        <!-- Pin Shadow & Extrusion -->
        <path d="M 50 150 C 50 150 98 90 98 49 C 98 22 76 0 50 0 C 24 0 2 22 2 49 C 2 90 50 150 50 150 Z" fill="#064e3b" transform="translate(2, 10)"/>

        <!-- Pin Main 3D Body -->
        <path d="M 50 150 C 50 150 98 90 98 49 C 98 22 76 0 50 0 C 24 0 2 22 2 49 C 2 90 50 150 50 150 Z" 
              fill="url(#pinGrad)" 
              stroke="#84cc16" 
              stroke-width="3"
              filter="url(#softGlow)"
        />

        <!-- Pin Center Hole (Perspective Aperture) -->
        <circle cx="50" cy="49" r="18" fill="url(#pinInnerHole)" stroke="#22c55e" stroke-width="3"/>

        <!-- Pin Specular Gloss -->
        <path d="M 30 18 C 40 8 60 8 70 18" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.85"/>
      </g>
    </g>

    <!-- 4. LETTER 'S' -->
    <g id="letter-S" transform="translate(545, 160)">
      <!-- 3D Extrusion Depth -->
      <path d="M 140 50 C 140 20 115 0 75 0 L 55 0 C 22 0 0 22 0 55 C 0 88 25 105 60 112 L 95 118 C 115 122 125 130 125 145 C 125 162 110 175 80 175 L 45 175 C 22 175 5 158 5 135 L 5 125 L -45 125 L -45 140 C -45 185 -5 235 50 235 L 85 235 C 135 235 175 198 175 148 C 175 105 145 88 105 80 L 70 74 C 52 70 45 62 45 52 C 45 38 60 28 80 28 L 105 28 C 122 28 132 38 135 50 Z" 
            transform="translate(45, 16)" 
            fill="url(#chromeExtrusion)"
      />

      <!-- Main Face -->
      <path d="M 140 50 C 140 20 115 0 75 0 L 55 0 C 22 0 0 22 0 55 C 0 88 25 105 60 112 L 95 118 C 115 122 125 130 125 145 C 125 162 110 175 80 175 L 45 175 C 22 175 5 158 5 135 L 5 125 L -45 125 L -45 140 C -45 185 -5 235 50 235 L 85 235 C 135 235 175 198 175 148 C 175 105 145 88 105 80 L 70 74 C 52 70 45 62 45 52 C 45 38 60 28 80 28 L 105 28 C 122 28 132 38 135 50 Z" 
            transform="translate(45, 0)" 
            fill="url(#chromeBody)" 
            stroke="url(#specularBevel)" 
            stroke-width="4"
      />

      <!-- Bottom Ambient Green Glow -->
      <path d="M 140 50 C 140 20 115 0 75 0 L 55 0 C 22 0 0 22 0 55 C 0 88 25 105 60 112 L 95 118 C 115 122 125 130 125 145 C 125 162 110 175 80 175 L 45 175 C 22 175 5 158 5 135 L 5 125 L -45 125 L -45 140 C -45 185 -5 235 50 235 L 85 235 C 135 235 175 198 175 148 C 175 105 145 88 105 80 L 70 74 C 52 70 45 62 45 52 C 45 38 60 28 80 28 L 105 28 C 122 28 132 38 135 50 Z" 
            transform="translate(45, 0)" 
            fill="url(#chromeGreenReflection)"
      />

      <!-- Specular Highlight Top Arch -->
      <path d="M 100 8 C 135 8 165 20 175 45" stroke="#ffffff" stroke-width="6" stroke-linecap="round" opacity="0.9"/>
    </g>
  </g>

  <!-- ==================== BRAND TAGLINES ==================== -->
  <!-- Tagline 1: FIND THE RIGHT SPACE. -->
  <g id="brand-tagline-1" transform="translate(490, 480)">
    <text x="250" y="0" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="34" letter-spacing="14" fill="#ffffff" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.8))">
      FIND THE RIGHT SPACE.
    </text>
  </g>

  <!-- Divider Line with Center Glowing Bead -->
  <g id="tagline-divider" transform="translate(490, 515)">
    <line x1="20" y1="0" x2="330" y2="0" stroke="#06b6d4" stroke-width="2.5" stroke-linecap="round" opacity="0.8"/>
    <circle cx="350" cy="0" r="5" fill="#84cc16" filter="url(#softGlow)"/>
    <circle cx="350" cy="0" r="2" fill="#ffffff"/>
    <line x1="370" y1="0" x2="680" y2="0" stroke="#06b6d4" stroke-width="2.5" stroke-linecap="round" opacity="0.8"/>
  </g>

  <!-- Tagline 2: BOOK IT WHEN YOU NEED IT. -->
  <g id="brand-tagline-2" transform="translate(490, 565)">
    <text x="350" y="0" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="28" letter-spacing="12" fill="#84cc16" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.8))">
      BOOK IT WHEN YOU NEED IT.
    </text>
  </g>
</svg>
"""

with open("public/ofis-logo-3d.svg", "w") as f:
    f.write(svg_content)

print("Created public/ofis-logo-3d.svg successfully")
