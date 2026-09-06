# Icon only emblem for favicons and avatars
icon_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    <radialGradient id="iconPortalGlow" cx="250" cy="250" r="240" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#84cc16" stop-opacity="0.45"/>
      <stop offset="35%" stop-color="#16a34a" stop-opacity="0.25"/>
      <stop offset="70%" stop-color="#064e3b" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>

    <radialGradient id="iconDoorLightGlow" cx="300" cy="265" r="140" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="1"/>
      <stop offset="20%" stop-color="#fef08a" stop-opacity="0.95"/>
      <stop offset="50%" stop-color="#eab308" stop-opacity="0.6"/>
      <stop offset="80%" stop-color="#84cc16" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>

    <linearGradient id="iconArchGrad" x1="100" y1="400" x2="380" y2="80" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#047857"/>
      <stop offset="25%" stop-color="#10b981"/>
      <stop offset="55%" stop-color="#22c55e"/>
      <stop offset="80%" stop-color="#84cc16"/>
      <stop offset="100%" stop-color="#facc15"/>
    </linearGradient>

    <linearGradient id="iconDoorFace" x1="220" y1="140" x2="300" y2="380" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#84cc16"/>
      <stop offset="40%" stop-color="#22c55e"/>
      <stop offset="100%" stop-color="#0f766e"/>
    </linearGradient>

    <linearGradient id="iconFloorBeam" x1="300" y1="280" x2="250" y2="440" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
      <stop offset="25%" stop-color="#fde047" stop-opacity="0.75"/>
      <stop offset="60%" stop-color="#84cc16" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </linearGradient>

    <filter id="iconSoftGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <circle cx="250" cy="250" r="230" fill="url(#iconPortalGlow)"/>

  <!-- Floor Beam -->
  <polygon points="300,280 320,280 380,420 160,420" fill="url(#iconFloorBeam)" opacity="0.85"/>

  <!-- Door Light Burst -->
  <ellipse cx="295" cy="265" rx="75" ry="110" fill="url(#iconDoorLightGlow)"/>
  <polygon points="230,140 295,160 300,360 235,375" fill="#ffffff" opacity="0.95" filter="url(#iconSoftGlow)"/>

  <!-- Door Leaf -->
  <polygon points="230,135 290,155 295,355 235,375" fill="url(#iconDoorFace)" stroke="#065f46" stroke-width="2"/>
  <ellipse cx="282" cy="255" rx="5.5" ry="5" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5"/>

  <!-- Arch Ring -->
  <path d="M 150 370 A 145 145 0 1 1 340 370 L 300 370 A 105 105 0 1 0 190 370 Z" fill="url(#iconArchGrad)" stroke="#15803d" stroke-width="2.5" filter="url(#iconSoftGlow)"/>
</svg>
"""

with open("public/ofis-icon-3d.svg", "w") as f:
    f.write(icon_svg)

print("Created public/ofis-icon-3d.svg")
