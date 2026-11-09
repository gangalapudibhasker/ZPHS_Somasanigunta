const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'public', 'images', 'placeholders');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function writeSvg(filename, svgContent) {
  fs.writeFileSync(path.join(targetDir, filename), svgContent.trim());
}

// 1. Male Student Profile
writeSvg('student_male.svg', `
<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" rx="16" fill="#f1f5f9"/>
  <circle cx="100" cy="80" r="36" fill="#cbd5e1"/>
  <path d="M50 160C50 130 72 120 100 120C128 120 150 130 150 160" stroke="#cbd5e1" stroke-width="16" stroke-linecap="round"/>
</svg>
`);

// 2. Female Student Profile
writeSvg('student_female.svg', `
<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" rx="16" fill="#f1f5f9"/>
  <circle cx="100" cy="80" r="34" fill="#cbd5e1"/>
  <path d="M100 46C86 46 76 56 76 70C76 80 84 86 100 90C116 86 124 80 124 70C124 56 114 46 100 46Z" fill="#94a3b8"/>
  <path d="M50 160C50 130 72 120 100 120C128 120 150 130 150 160" stroke="#cbd5e1" stroke-width="16" stroke-linecap="round"/>
</svg>
`);

// 3. Signature Sample
writeSvg('signature_sample.svg', `
<svg width="300" height="100" viewBox="0 0 300 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="300" height="100" rx="8" fill="#fcfcfc" stroke="#e2e8f0" stroke-width="2"/>
  <path d="M30 65 C 60 20, 90 80, 110 50 C 130 20, 150 70, 180 50 C 210 30, 240 70, 270 40" stroke="#1e3a8a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <line x1="20" y1="80" x2="280" y2="80" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4 4"/>
</svg>
`);

// 4. SASA Clean Before
writeSvg('sasa_clean_before.svg', `
<svg width="400" height="250" viewBox="0 0 400 250" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="250" rx="12" fill="#fee2e2"/>
  <text x="20" y="40" font-family="sans-serif" font-weight="bold" font-size="18" fill="#991b1b">BEFORE: Uncleaned Zone</text>
  <path d="M50 180 L80 150 L110 180 L140 160 L170 190" stroke="#b91c1c" stroke-width="4" stroke-linecap="round" fill="none"/>
  <circle cx="80" cy="180" r="10" fill="#78350f"/>
  <circle cx="150" cy="190" r="8" fill="#4b5563"/>
  <rect x="220" y="160" width="30" height="30" fill="#b45309" transform="rotate(15 220 160)"/>
  <text x="140" y="120" font-family="sans-serif" font-size="14" fill="#991b1b">Wild Grass &amp; Plastic Waste</text>
</svg>
`);

// 5. SASA Clean After
writeSvg('sasa_clean_after.svg', `
<svg width="400" height="250" viewBox="0 0 400 250" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="250" rx="12" fill="#dcfce7"/>
  <text x="20" y="40" font-family="sans-serif" font-weight="bold" font-size="18" fill="#166534">AFTER: Clean &amp; Neat Ground</text>
  <line x1="20" y1="200" x2="380" y2="200" stroke="#15803d" stroke-width="4" stroke-linecap="round"/>
  <circle cx="100" cy="195" r="5" fill="#22c55e"/>
  <circle cx="200" cy="195" r="5" fill="#22c55e"/>
  <circle cx="300" cy="195" r="5" fill="#22c55e"/>
  <text x="120" y="120" font-family="sans-serif" font-size="14" fill="#166534">Cleared Waste, Neat Ground</text>
</svg>
`);

// 6. SASA Plant Before
writeSvg('sasa_plant_before.svg', `
<svg width="400" height="250" viewBox="0 0 400 250" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="250" rx="12" fill="#fef3c7"/>
  <text x="20" y="40" font-family="sans-serif" font-weight="bold" font-size="18" fill="#92400e">BEFORE: Dry Ground Area</text>
  <line x1="20" y1="210" x2="380" y2="210" stroke="#78350f" stroke-width="5"/>
  <path d="M120 210 L150 170 M250 210 L270 180" stroke="#b45309" stroke-width="3"/>
  <text x="140" y="120" font-family="sans-serif" font-size="14" fill="#92400e">Barren land along wall</text>
</svg>
`);

// 7. SASA Plant After
writeSvg('sasa_plant_after.svg', `
<svg width="400" height="250" viewBox="0 0 400 250" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="250" rx="12" fill="#dcfce7"/>
  <text x="20" y="40" font-family="sans-serif" font-weight="bold" font-size="18" fill="#166534">AFTER: Saplings Planted</text>
  <line x1="20" y1="210" x2="380" y2="210" stroke="#78350f" stroke-width="5"/>
  <!-- Trees -->
  <path d="M100 210 L100 170" stroke="#78350f" stroke-width="4"/>
  <circle cx="100" cy="155" r="20" fill="#15803d"/>
  <path d="M200 210 L200 160" stroke="#78350f" stroke-width="4"/>
  <circle cx="200" cy="145" r="22" fill="#16a34a"/>
  <path d="M300 210 L300 170" stroke="#78350f" stroke-width="4"/>
  <circle cx="300" cy="155" r="18" fill="#15803d"/>
  <text x="130" y="100" font-family="sans-serif" font-size="14" fill="#166534">50+ Trees Planted &amp; Fenced</text>
</svg>
`);

// Gallery General Generator
const categories = ['campus', 'ifp', 'scilab', 'mathlab', 'library', 'sports'];
const colors = {
  campus: { bg: '#e0f2fe', fg: '#0369a1', title: 'School Campus' },
  ifp: { bg: '#fae8ff', fg: '#a21caf', title: 'Interactive Flat Panels' },
  scilab: { bg: '#dcfce7', fg: '#15803d', title: 'Science Laboratory' },
  mathlab: { bg: '#fef9c3', fg: '#a16207', title: 'Mathematics Laboratory' },
  library: { bg: '#ffe4e6', fg: '#be123c', title: 'School Library' },
  sports: { bg: '#ffedd5', fg: '#c2410c', title: 'Sports Facilities' },
};

categories.forEach(cat => {
  const item = colors[cat];
  writeSvg(`gal_${cat}.svg`, `
<svg width="600" height="400" viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="400" rx="16" fill="${item.bg}"/>
  <rect x="50" y="50" width="500" height="300" rx="8" fill="#ffffff" stroke="${item.fg}" stroke-width="3" stroke-dasharray="8 8"/>
  <text x="300" y="180" font-family="sans-serif" font-weight="bold" font-size="28" fill="${item.fg}" text-anchor="middle">ZPHS Somasanigunta</text>
  <text x="300" y="230" font-family="sans-serif" font-size="18" fill="${item.fg}" text-anchor="middle">${item.title}</text>
  <circle cx="300" cy="110" r="25" fill="${item.fg}" opacity="0.15"/>
</svg>
  `);
});

console.log("SVG Placeholders generated successfully.");
