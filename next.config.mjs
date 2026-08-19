/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fully static export — there is no server and no database.
  // Everything ships as static HTML/CSS/JS and runs entirely in the browser.
  output: 'export',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
