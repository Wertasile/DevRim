import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    layout("./layouts/base.tsx", [
        index("routes/home.tsx"),
        route("about", "routes/about.tsx"),
        route("profile/:id", "routes/profile.tsx"),
        route("dashboard", "routes/blogHome.tsx"),
        route("blog/new", "routes/blogAdd.tsx"),
        route("edit/:postId", "routes/blogEdit.tsx"),
        route("blog/:id", "routes/blogPost.tsx"),
        route("chats", "routes/ChatPage.tsx"),
        route("connections", "routes/connections.tsx"),
        route("/.well-known/appspecific/com.chrome.devtools.json","routes/debug-null.tsx"),
        route("community","routes/CommunityHub.tsx"),
        route("community/:id", "routes/Community.tsx"),
        route("settings", "routes/settings.tsx")
    ]),
    
    route("login", "routes/login.tsx"),
    
    
] satisfies RouteConfig;
