import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AppProvider, UserProvider } from "./context/userContext";
import ScrollTrigger from "gsap/ScrollTrigger";
import gsap from "gsap";
import { useEffect } from "react";

export const links: Route.LinksFunction = () => [
  // Font preconnects for performance
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300..900;1,300..900&display=swap",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Manrope:wght@300..700&display=swap",
  },
  
  // DNS prefetch for external resources (add your API domains if needed)
  // { rel: "dns-prefetch", href: "https://your-api-domain.com" },
];

export const meta: Route.MetaFunction = ({ data, location }) => {
  // Get the base URL - you should replace this with your actual domain
  const baseUrl = "https://devrim-seven.vercel.app/"; // Update this with your actual domain
  const url = `${baseUrl}${location.pathname}${location.search}`;
  
  const defaultTitle = "DevRim - Where Ideas Meet Community";
  const defaultDescription = "A platform combining Medium's storytelling depth with Reddit's community engagement. Write long-form content, join communities, connect with authors, and build your network.";
  const defaultImage = `${baseUrl}/og-image.png`; // You should add this image to your public folder
  
  return [
    // Basic SEO
    { title: defaultTitle },
    { name: "description", content: defaultDescription },
    { name: "keywords", content: "writing platform, community, blog, articles, social network, content creation, long-form content, devrim" },
    { name: "author", content: "DevRim" },
    { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
    { name: "googlebot", content: "index, follow" },
    { name: "language", content: "English" },
    { name: "revisit-after", content: "7 days" },
    { name: "rating", content: "general" },
    
    // Canonical URL (using link tag format in meta)
    { tagName: "link", rel: "canonical", href: url },
    
    // Open Graph / Facebook
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    { property: "og:title", content: defaultTitle },
    { property: "og:description", content: defaultDescription },
    { property: "og:image", content: defaultImage },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: "DevRim - Where Ideas Meet Community" },
    { property: "og:site_name", content: "DevRim" },
    { property: "og:locale", content: "en_US" },
    
    // Twitter Card
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:url", content: url },
    { name: "twitter:title", content: defaultTitle },
    { name: "twitter:description", content: defaultDescription },
    { name: "twitter:image", content: defaultImage },
    { name: "twitter:image:alt", content: "DevRim - Where Ideas Meet Community" },
    
    // Mobile & PWA
    { name: "mobile-web-app-capable", content: "yes" },
    { name: "apple-mobile-web-app-capable", content: "yes" },
    { name: "apple-mobile-web-app-status-bar-style", content: "default" },
    { name: "apple-mobile-web-app-title", content: "DevRim" },
    { name: "application-name", content: "DevRim" },
    { name: "theme-color", content: "#ffffff" },
    { name: "msapplication-TileColor", content: "#ffffff" },
    { name: "msapplication-config", content: "/browserconfig.xml" },
    
    // Accessibility & Performance
    { name: "color-scheme", content: "light dark" },
    { name: "format-detection", content: "telephone=no" },
  ];
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        {/* Favicons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/>
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"/>
        <link rel="manifest" href="/site.webmanifest" />
        {/* Additional accessibility and SEO meta tags */}
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  useEffect(() => {
    if (typeof window === "undefined") return; // SSR guard

    (async () => {
      const gsap = (await import("gsap")).default;
      const ScrollTrigger = (await import("gsap/ScrollTrigger")).default;
      gsap.registerPlugin(ScrollTrigger);
    })();
  }, []);
  
  return(
    <>
    <GoogleOAuthProvider clientId="78002390529-9cuvrn1la1jh1p6rc0n8cksv4ahoii89.apps.googleusercontent.com">
      <AppProvider>
        <Outlet />
      </AppProvider>      
    </GoogleOAuthProvider>
    </>
  )   
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
