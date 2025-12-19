import { createAuthClient } from "better-auth/react"

const API_URL = import.meta.env.VITE_API_URL;

export const authClient = createAuthClient({
    /** The base URL of the server (optional if you're using the same domain) */
    baseURL: API_URL,
    fetchOptions: { credentials: "include" }
})

export const { signIn, signUp, useSession } = createAuthClient()