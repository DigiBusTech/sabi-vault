import fs from 'fs';

let page = fs.readFileSync('src/app/(marketing)/page.tsx', 'utf8');

// 1. Add import
if (!page.includes('NativeAppHomeScreen')) {
  page = 'import { NativeAppHomeScreen } from "@/components/pwa/NativeAppHomeScreen";\r\n' + page;
}

// 2. Wrap in responsive split (Mobile native app screen vs Desktop enterprise suite)
page = page.replace(
  'export default function HomePage() {\r\n  return (\r\n    <main className="bg-white text-[#0f172a] font-sans selection:bg-[#059669]/20 selection:text-[#0f172a]">',
  'export default function HomePage() {\r\n  return (\r\n    <>\r\n      {/* 1. NATIVE MOBILE APP ONBOARDING VIEW (< 768px - matching Image 3 Paga & Image 4 SabiRight) */}\r\n      <div className="block md:hidden">\r\n        <NativeAppHomeScreen />\r\n      </div>\r\n\r\n      {/* 2. FULL DESKTOP ENTERPRISE SUITE (>= 768px) */}\r\n      <main className="hidden md:block bg-white text-[#0f172a] font-sans selection:bg-[#059669]/20 selection:text-[#0f172a]">'
);

if (!page.includes('matching Image 3 Paga')) {
  page = page.replace(
    'export default function HomePage() {\n  return (\n    <main className="bg-white text-[#0f172a] font-sans selection:bg-[#059669]/20 selection:text-[#0f172a]">',
    'export default function HomePage() {\n  return (\n    <>\n      {/* 1. NATIVE MOBILE APP ONBOARDING VIEW (< 768px - matching Image 3 Paga & Image 4 SabiRight) */}\n      <div className="block md:hidden">\n        <NativeAppHomeScreen />\n      </div>\n\n      {/* 2. FULL DESKTOP ENTERPRISE SUITE (>= 768px) */}\n      <main className="hidden md:block bg-white text-[#0f172a] font-sans selection:bg-[#059669]/20 selection:text-[#0f172a]">'
  );
}

// 3. Close the fragment
page = page.replace(
  '    </main>\r\n  );\r\n}',
  '    </main>\r\n    </>\r\n  );\r\n}'
);
if (!page.includes('</main>\r\n    </>')) {
  page = page.replace(
    '    </main>\n  );\n}',
    '    </main>\n    </>\n  );\n}'
  );
}

// 4. Update Hero Grid to strictly enforce min-w-0 and prevent overflow
page = page.replace(
  '<section className="relative mx-auto max-w-7xl px-5 pt-16 pb-20 lg:px-8 lg:pt-24 overflow-hidden">',
  '<section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-24 lg:pb-20 overflow-hidden w-full max-w-full">'
);
page = page.replace(
  '<div className="grid items-center gap-12 lg:grid-cols-12">',
  '<div className="grid items-center gap-8 lg:gap-12 lg:grid-cols-12 w-full max-w-full min-w-0">'
);
page = page.replace(
  '<div className="lg:col-span-7">',
  '<div className="lg:col-span-7 min-w-0 w-full max-w-full">'
);
page = page.replace(
  '<div className="lg:col-span-5">',
  '<div className="lg:col-span-5 min-w-0 w-full max-w-full overflow-hidden">'
);

page = page.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n');
fs.writeFileSync('src/app/(marketing)/page.tsx', page, 'utf8');
console.log('src/app/(marketing)/page.tsx updated successfully');

