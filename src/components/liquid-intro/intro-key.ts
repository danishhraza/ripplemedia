// Single source of truth for the once-per-session flag, shared by the client
// component that sets it and the inline pre-paint script in the root layout
// that reads it. Kept in its own module so the server layout can import the key
// without pulling the client component into the server bundle.
export const INTRO_SESSION_KEY = "rm:liquid-intro-played";
