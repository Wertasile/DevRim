import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    layout("./layouts/base.tsx", [
        index("routes/home.tsx"),
        route("about", "routes/about.tsx"),
        route("profile/:id", "routes/profile.tsx"),
        
        route("/.well-known/appspecific/com.chrome.devtools.json","routes/debug-null.tsx"),
        
    ]),
    
    layout("./layouts/blog.tsx", [
        route("blog", "routes/blogHome.tsx"),
        route("blog/new", "routes/blogAdd.tsx"),
        route("blog/:id", "routes/blogPost.tsx"),
    ]),

    route("chats", "routes/ChatPage.tsx"),
    route("login", "routes/login.tsx"),
    route("register", "routes/register.tsx"),
    
] satisfies RouteConfig;
