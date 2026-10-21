import fs from 'fs';

// 1. Update VerificationSim.tsx
let sim = fs.readFileSync('src/components/marketing/VerificationSim.tsx', 'utf8');
sim = sim.replace(
  'className="relative mx-auto w-full max-w-lg overflow-hidden rounded-3xl liquid-glass-card shadow-[0_20px_50px_-20px_rgba(15,23,42,0.15)]"',
  'className="relative mx-auto w-full max-w-full sm:max-w-lg overflow-hidden rounded-2xl sm:rounded-3xl liquid-glass-card shadow-[0_20px_50px_-20px_rgba(15,23,42,0.15)] min-w-0"'
);
sim = sim.replace(
  'className="flex items-center justify-between px-7 py-4"',
  'className="flex items-center justify-between px-2 sm:px-7 py-3 sm:py-4 overflow-hidden min-w-0"'
);
sim = sim.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n');
fs.writeFileSync('src/components/marketing/VerificationSim.tsx', sim, 'utf8');
console.log('VerificationSim.tsx updated successfully.');

