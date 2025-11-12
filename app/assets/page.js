// "use client";

// import React, { useState } from 'react';
// import { Download, Check, FileText, Image } from 'lucide-react';

// export default function ManifestoAssetsGenerator() {
//   const [downloaded, setDownloaded] = useState({});

//   const generateIcon = (size, isApple = false) => {
//     const canvas = document.createElement('canvas');
//     canvas.width = size;
//     canvas.height = size;
//     const ctx = canvas.getContext('2d');

//     // Background - clean white
//     ctx.fillStyle = '#ffffff';
//     ctx.fillRect(0, 0, size, size);

//     // Calculate responsive sizing
//     const padding = size * 0.15;
//     const contentSize = size - (padding * 2);

//     // Draw stylized "DM" letters in serif style
//     ctx.fillStyle = '#18181b'; // zinc-900
//     ctx.font = `bold ${contentSize * 0.5}px Georgia, serif`;
//     ctx.textAlign = 'center';
//     ctx.textBaseline = 'middle';
//     ctx.fillText('DM', size / 2, size / 2);

//     // Add subtle underline accent
//     const lineWidth = contentSize * 0.6;
//     const lineHeight = size * 0.02;
//     const lineY = size / 2 + contentSize * 0.22;
//     ctx.fillStyle = '#18181b';
//     ctx.fillRect((size - lineWidth) / 2, lineY, lineWidth, lineHeight);

//     return canvas;
//   };

//   const generateOGImage = () => {
//     const canvas = document.createElement('canvas');
//     canvas.width = 1200;
//     canvas.height = 630;
//     const ctx = canvas.getContext('2d');

//     // Clean white background
//     ctx.fillStyle = '#ffffff';
//     ctx.fillRect(0, 0, 1200, 630);

//     // Subtle grid pattern
//     ctx.strokeStyle = '#f4f4f5';
//     ctx.lineWidth = 1;
//     for (let i = 0; i < 1200; i += 40) {
//       ctx.beginPath();
//       ctx.moveTo(i, 0);
//       ctx.lineTo(i, 630);
//       ctx.stroke();
//     }
//     for (let i = 0; i < 630; i += 40) {
//       ctx.beginPath();
//       ctx.moveTo(0, i);
//       ctx.lineTo(1200, i);
//       ctx.stroke();
//     }

//     // Main title
//     ctx.fillStyle = '#18181b';
//     ctx.font = 'bold 72px Georgia, serif';
//     ctx.textAlign = 'center';
//     ctx.fillText('Daily Manifesto', 600, 240);

//     // Subtitle
//     ctx.font = '32px system-ui, -apple-system, sans-serif';
//     ctx.fillStyle = '#71717a';
//     ctx.fillText('Share your truth, inspire the world', 600, 310);

//     // Decorative line
//     ctx.fillStyle = '#18181b';
//     ctx.fillRect(400, 360, 400, 3);

//     // Sample manifesto text (styled)
//     ctx.font = 'italic 24px Georgia, serif';
//     ctx.fillStyle = '#52525b';
//     const sampleText = '"Today, I choose to be intentional with my time,';
//     ctx.fillText(sampleText, 600, 440);
//     const sampleText2 = 'compassionate with myself, and bold in my actions."';
//     ctx.fillText(sampleText2, 600, 480);

//     // Footer
//     ctx.font = '18px system-ui, -apple-system, sans-serif';
//     ctx.fillStyle = '#a1a1aa';
//     ctx.fillText('Write • Archive • Share', 600, 560);

//     return canvas;
//   };

//   const generateFavicon = () => {
//     const canvas = document.createElement('canvas');
//     canvas.width = 32;
//     canvas.height = 32;
//     const ctx = canvas.getContext('2d');

//     // Background
//     ctx.fillStyle = '#ffffff';
//     ctx.fillRect(0, 0, 32, 32);

//     // Simple "DM" for favicon
//     ctx.fillStyle = '#18181b';
//     ctx.font = 'bold 16px Georgia, serif';
//     ctx.textAlign = 'center';
//     ctx.textBaseline = 'middle';
//     ctx.fillText('DM', 16, 16);

//     return canvas;
//   };

//   const downloadCanvas = (canvas, filename) => {
//     canvas.toBlob((blob) => {
//       const url = URL.createObjectURL(blob);
//       const link = document.createElement('a');
//       link.href = url;
//       link.download = filename;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       URL.revokeObjectURL(url);
      
//       setDownloaded(prev => ({ ...prev, [filename]: true }));
//       setTimeout(() => {
//         setDownloaded(prev => ({ ...prev, [filename]: false }));
//       }, 2000);
//     }, 'image/png');
//   };

//   const downloadManifest = () => {
//     const manifest = {
//       name: "Daily Manifesto",
//       short_name: "Manifesto",
//       description: "Write and share your daily intentions with the world. Express your truth, track your journey, and inspire others.",
//       start_url: "/",
//       display: "standalone",
//       background_color: "#ffffff",
//       theme_color: "#18181b",
//       orientation: "portrait-primary",
//       categories: ["productivity", "lifestyle", "writing"],
//       icons: [
//         {
//           src: "/icon-192.png",
//           sizes: "192x192",
//           type: "image/png",
//           purpose: "any maskable"
//         },
//         {
//           src: "/icon-512.png",
//           sizes: "512x512",
//           type: "image/png",
//           purpose: "any maskable"
//         }
//       ],
//       screenshots: [
//         {
//           src: "/screenshots/desktop-1.png",
//           sizes: "1280x720",
//           type: "image/png",
//           form_factor: "wide"
//         },
//         {
//           src: "/screenshots/mobile-1.png",
//           sizes: "750x1334",
//           type: "image/png",
//           form_factor: "narrow"
//         }
//       ]
//     };

//     const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = 'manifest.json';
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(url);

//     setDownloaded(prev => ({ ...prev, 'manifest': true }));
//     setTimeout(() => {
//       setDownloaded(prev => ({ ...prev, 'manifest': false }));
//     }, 2000);
//   };

//   const iconSizes = [192, 512]; // Most important PWA sizes
//   const appleSizes = [180]; // Most common Apple size

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 p-4 sm:p-8">
//       <div className="max-w-6xl mx-auto">
//         <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-10 mb-8">
//           <div className="flex items-start gap-4 mb-6">
//             <div className="w-16 h-16 bg-zinc-900 rounded-xl flex items-center justify-center flex-shrink-0">
//               <span className="text-white text-2xl font-serif font-bold">DM</span>
//             </div>
//             <div>
//               <h1 className="text-3xl sm:text-4xl font-serif font-bold text-zinc-900 mb-2">
//                 Daily Manifesto PWA Assets
//               </h1>
//               <p className="text-zinc-600">
//                 Download all necessary icons, manifest, and assets for your Progressive Web App
//               </p>
//             </div>
//           </div>

//           {/* Manifest File */}
//           <div className="mb-8">
//             <h2 className="text-xl font-semibold text-zinc-900 mb-4 flex items-center gap-2">
//               <FileText size={20} />
//               Manifest File
//             </h2>
//             <div className="bg-zinc-50 rounded-xl p-6 border border-zinc-200">
//               <p className="text-sm text-zinc-600 mb-4">
//                 The manifest.json file contains all PWA metadata and icon references
//               </p>
//               <button
//                 onClick={downloadManifest}
//                 className="px-6 py-3 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors font-medium flex items-center gap-2"
//               >
//                 {downloaded.manifest ? (
//                   <>
//                     <Check size={18} />
//                     Downloaded!
//                   </>
//                 ) : (
//                   <>
//                     <Download size={18} />
//                     Download manifest.json
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>

//           {/* Standard Icons */}
//           <div className="mb-8">
//             <h2 className="text-xl font-semibold text-zinc-900 mb-4 flex items-center gap-2">
//               <Image size={20} />
//               PWA Icons (Essential)
//             </h2>
//             <p className="text-sm text-zinc-600 mb-4">
//               These two sizes cover all PWA requirements
//             </p>
//             <div className="grid grid-cols-2 gap-4 max-w-md">
//               {iconSizes.map(size => (
//                 <div key={size} className="bg-zinc-50 rounded-xl p-4 border border-zinc-200 hover:shadow-md transition-shadow">
//                   <div className="aspect-square bg-white rounded-lg mb-3 flex items-center justify-center border border-zinc-200">
//                     <span className="text-xl font-serif font-bold text-zinc-900">DM</span>
//                   </div>
//                   <p className="text-sm font-medium text-zinc-900 mb-2">{size}×{size}</p>
//                   <button
//                     onClick={() => downloadCanvas(generateIcon(size), `icon-${size}x${size}.png`)}
//                     className="w-full px-3 py-2 bg-zinc-900 text-white text-sm rounded-lg hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
//                   >
//                     {downloaded[`icon-${size}x${size}.png`] ? (
//                       <>
//                         <Check size={14} />
//                         Done
//                       </>
//                     ) : (
//                       <>
//                         <Download size={14} />
//                         Download
//                       </>
//                     )}
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Apple Touch Icons */}
//           <div className="mb-8">
//             <h2 className="text-xl font-semibold text-zinc-900 mb-4">
//               Apple Touch Icon
//             </h2>
//             <p className="text-sm text-zinc-600 mb-4">
//               Standard icon for iOS devices
//             </p>
//             <div className="grid grid-cols-1 gap-4 max-w-xs">
//               {appleSizes.map(size => (
//                 <div key={size} className="bg-zinc-50 rounded-xl p-4 border border-zinc-200 hover:shadow-md transition-shadow">
//                   <div className="aspect-square bg-white rounded-lg mb-3 flex items-center justify-center border border-zinc-200">
//                     <span className="text-xl font-serif font-bold text-zinc-900">DM</span>
//                   </div>
//                   <p className="text-sm font-medium text-zinc-900 mb-2">{size}×{size}</p>
//                   <button
//                     onClick={() => downloadCanvas(generateIcon(size, true), `apple-touch-icon-${size}x${size}.png`)}
//                     className="w-full px-3 py-2 bg-zinc-900 text-white text-sm rounded-lg hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
//                   >
//                     {downloaded[`apple-touch-icon-${size}x${size}.png`] ? (
//                       <>
//                         <Check size={14} />
//                         Done
//                       </>
//                     ) : (
//                       <>
//                         <Download size={14} />
//                         Download
//                       </>
//                     )}
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Favicon */}
//           <div className="mb-8">
//             <h2 className="text-xl font-semibold text-zinc-900 mb-4">
//               Favicon
//             </h2>
//             <div className="bg-zinc-50 rounded-xl p-6 border border-zinc-200 max-w-xs">
//               <div className="w-16 h-16 bg-white rounded-lg mb-4 flex items-center justify-center border border-zinc-200 mx-auto">
//                 <span className="text-base font-serif font-bold text-zinc-900">DM</span>
//               </div>
//               <p className="text-sm font-medium text-zinc-900 mb-2 text-center">32×32</p>
//               <button
//                 onClick={() => downloadCanvas(generateFavicon(), 'favicon.png')}
//                 className="w-full px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
//               >
//                 {downloaded['favicon.png'] ? (
//                   <>
//                     <Check size={16} />
//                     Downloaded!
//                   </>
//                 ) : (
//                   <>
//                     <Download size={16} />
//                     Download Favicon
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>

//           {/* OG Image */}
//           <div>
//             <h2 className="text-xl font-semibold text-zinc-900 mb-4">
//               Open Graph Image
//             </h2>
//             <div className="bg-zinc-50 rounded-xl p-6 border border-zinc-200">
//               <div className="bg-white rounded-lg mb-4 border border-zinc-200 aspect-[1200/630] flex items-center justify-center overflow-hidden">
//                 <div className="text-center px-4">
//                   <h3 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-900 mb-2">Daily Manifesto</h3>
//                   <p className="text-sm sm:text-base text-zinc-600">Share your truth, inspire the world</p>
//                 </div>
//               </div>
//               <p className="text-sm text-zinc-600 mb-4">
//                 1200×630 - Perfect for social media sharing (Facebook, Twitter, LinkedIn)
//               </p>
//               <button
//                 onClick={() => downloadCanvas(generateOGImage(), 'og-image.png')}
//                 className="px-6 py-3 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors font-medium flex items-center gap-2"
//               >
//                 {downloaded['og-image.png'] ? (
//                   <>
//                     <Check size={18} />
//                     Downloaded!
//                   </>
//                 ) : (
//                   <>
//                     <Download size={18} />
//                     Download OG Image
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Implementation Instructions */}
//         <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-10">
//           <h2 className="text-2xl font-serif font-bold text-zinc-900 mb-6">
//             Next.js Implementation Guide
//           </h2>
          
//           <div className="space-y-6">
//             <div>
//               <h3 className="font-semibold text-zinc-900 mb-2">1. File Structure</h3>
//               <pre className="bg-zinc-50 p-4 rounded-lg text-sm border border-zinc-200">
// {`app/
// ├── favicon.ico (rename favicon.png to favicon.ico)
// ├── icon-192.png
// ├── icon-512.png
// ├── apple-icon.png
// ├── manifest.json (or manifest.ts/manifest.js)
// └── opengraph-image.png (rename og-image.png)`}
//               </pre>
//               <p className="text-sm text-zinc-600 mt-2">
//                 Place all files directly in your <code className="bg-zinc-100 px-1 py-0.5 rounded">app/</code> directory. Next.js will automatically handle them.
//               </p>
//             </div>

//             <div>
//               <h3 className="font-semibold text-zinc-900 mb-2">2. manifest.json Setup</h3>
//               <p className="text-sm text-zinc-600 mb-2">
//                 Place the downloaded manifest.json in your <code className="bg-zinc-100 px-1 py-0.5 rounded">app/</code> directory, or create <code className="bg-zinc-100 px-1 py-0.5 rounded">app/manifest.ts</code>:
//               </p>
//               <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg overflow-x-auto text-sm">
// {`import { MetadataRoute } from 'next'
 
// export default function manifest(): MetadataRoute.Manifest {
//   return {
//     name: 'Daily Manifesto',
//     short_name: 'Manifesto',
//     description: 'Write and share your daily intentions with the world',
//     start_url: '/',
//     display: 'standalone',
//     background_color: '#ffffff',
//     theme_color: '#18181b',
//     icons: [
//       {
//         src: '/icon-192.png',
//         sizes: '192x192',
//         type: 'image/png',
//       },
//       {
//         src: '/icon-512.png',
//         sizes: '512x512',
//         type: 'image/png',
//       },
//     ],
//   }
// }`}
//               </pre>
//             </div>

//             <div>
//               <h3 className="font-semibold text-zinc-900 mb-2">3. Metadata Configuration (Optional)</h3>
//               <p className="text-sm text-zinc-600 mb-2">
//                 Add to your <code className="bg-zinc-100 px-1 py-0.5 rounded">app/layout.tsx</code> for additional SEO:
//               </p>
//               <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg overflow-x-auto text-sm">
// {`export const metadata = {
//   metadataBase: new URL('https://yourdomain.com'),
//   title: 'Daily Manifesto',
//   description: 'Share your truth, inspire the world',
//   appleWebApp: {
//     capable: true,
//     statusBarStyle: 'default',
//     title: 'Daily Manifesto',
//   },
// }`}
//               </pre>
//             </div>

//             <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//               <h4 className="font-semibold text-blue-900 mb-2">✨ That's it!</h4>
//               <p className="text-sm text-blue-800">
//                 Next.js automatically generates all necessary meta tags from these files. No manual HTML head tags needed!
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }