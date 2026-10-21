import fs from 'fs';

let code = fs.readFileSync('src/components/marketing/MarketingNav.tsx', 'utf8');
code = code.replace(
  '<header className="`${isHome ? "hidden md:block" : ""} sticky top-0 z-50 border-b border-white/80 bg-white/70 backdrop-blur-2xl shadow-[0_4px_20px_-2px_rgba(15,23,42,0.05),inset_0_1px_1px_0_rgba(255,255,255,0.9)]">',
  '<header className={`${isHome ? "hidden md:block" : ""} sticky top-0 z-50 border-b border-white/80 bg-white/70 backdrop-blur-2xl shadow-[0_4px_20px_-2px_rgba(15,23,42,0.05),inset_0_1px_1px_0_rgba(255,255,255,0.9)]`}>'
);
code = code.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n');
fs.writeFileSync('src/components/marketing/MarketingNav.tsx', code, 'utf8');
console.log('Fixed MarketingNav.tsx line 26');

