import fs from 'fs';

// 1. Update MarketingNav.tsx
let nav = fs.readFileSync('src/components/marketing/MarketingNav.tsx', 'utf8');
nav = nav.replace(
  'export function MarketingNav() {\r\n  const [open, setOpen] = useState(false);\r\n  const pathname = usePathname();\r\n\r\n  return (\r\n    <header className="sticky top-0 z-50',
  'export function MarketingNav() {\r\n  const [open, setOpen] = useState(false);\r\n  const pathname = usePathname();\r\n  const isHome = pathname === "/";\r\n\r\n  return (\r\n    <header className={`${isHome ? "hidden md:block" : ""} sticky top-0 z-50'
);
if (!nav.includes('const isHome = pathname === "/";')) {
  // Try LF variant if CRLF didn't match directly
  nav = nav.replace(
    'export function MarketingNav() {\n  const [open, setOpen] = useState(false);\n  const pathname = usePathname();\n\n  return (\n    <header className="sticky top-0 z-50',
    'export function MarketingNav() {\n  const [open, setOpen] = useState(false);\n  const pathname = usePathname();\n  const isHome = pathname === "/";\n\n  return (\n    <header className={`${isHome ? "hidden md:block" : ""} sticky top-0 z-50'
  );
}
nav = nav.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n');
fs.writeFileSync('src/components/marketing/MarketingNav.tsx', nav, 'utf8');
console.log('MarketingNav.tsx updated');

// 2. Update MarketingFooter.tsx
let footer = fs.readFileSync('src/components/marketing/MarketingFooter.tsx', 'utf8');
if (!footer.includes('"use client";')) {
  footer = '"use client";\r\n\r\nimport { usePathname } from "next/navigation";\r\n' + footer;
}
footer = footer.replace(
  'export function MarketingFooter() {\r\n  const year = new Date().getFullYear();\r\n\r\n  return (\r\n    <footer className="border-t border-slate-200 bg-white">',
  'export function MarketingFooter() {\r\n  const pathname = usePathname();\r\n  const isHome = pathname === "/";\r\n  const year = new Date().getFullYear();\r\n\r\n  return (\r\n    <footer className={`${isHome ? "hidden md:block" : ""} border-t border-slate-200 bg-white`}>'
);
if (!footer.includes('const isHome = pathname === "/";')) {
  footer = footer.replace(
    'export function MarketingFooter() {\n  const year = new Date().getFullYear();\n\n  return (\n    <footer className="border-t border-slate-200 bg-white">',
    'export function MarketingFooter() {\n  const pathname = usePathname();\n  const isHome = pathname === "/";\n  const year = new Date().getFullYear();\n\n  return (\n    <footer className={`${isHome ? "hidden md:block" : ""} border-t border-slate-200 bg-white`}>'
  );
}
footer = footer.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n');
fs.writeFileSync('src/components/marketing/MarketingFooter.tsx', footer, 'utf8');
console.log('MarketingFooter.tsx updated');

// 3. Update PwaInstallBanner.tsx
let banner = fs.readFileSync('src/components/pwa/PwaInstallBanner.tsx', 'utf8');
banner = banner.replace(
  '    const isPwa = window.location.pathname.startsWith("/pwa");\r\n\r\n    if (standalone || isPwa) {',
  '    const isPwa = window.location.pathname.startsWith("/pwa");\r\n    const isHomeMobile = window.location.pathname === "/" && window.innerWidth < 768;\r\n\r\n    if (standalone || isPwa || isHomeMobile) {'
);
if (!banner.includes('isHomeMobile')) {
  banner = banner.replace(
    '    const isPwa = window.location.pathname.startsWith("/pwa");\n\n    if (standalone || isPwa) {',
    '    const isPwa = window.location.pathname.startsWith("/pwa");\n    const isHomeMobile = window.location.pathname === "/" && window.innerWidth < 768;\n\n    if (standalone || isPwa || isHomeMobile) {'
  );
}
banner = banner.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n');
fs.writeFileSync('src/components/pwa/PwaInstallBanner.tsx', banner, 'utf8');
console.log('PwaInstallBanner.tsx updated');

