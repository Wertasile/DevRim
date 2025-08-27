import { useEffect, useState } from "react";

import {useUser} from "../context/userContext.js"

import type { Route } from "./+types/home.js";
import type {  User } from "~/types/types.js";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

const Home = () => {

    const [user, setUser] = useState< User | null >(null)

    useEffect(() => {

    }, [])

  return(
    <>
        <section id="hero">
            <h1>Task Manager, Documentation tool and Blogs.</h1>
            <h2>All here at one place, powered by AI.</h2>
            <p>Create and develop guidance for your Products along with managing those products and blogging them.</p>
            <a className="primary-btn" href="signup.html" target="_self">Sign Up for Free</a>
            {/* <img src="/images/placeholder_img.png"/> */}
        </section>

        <section id="features">

            <div className="features_x" id="features_1">
                <div>
                    <h2>Simple, Efficient and Free Docs</h2>
                    <p>Make use of the documentation platform for yourself or your team. Lightweight, Easy to Use and nothing complex.</p>
                </div>
                <div>
                    {/* <img src="/images/placeholder_img.png" width="100px"/> */}
                </div>
            </div>
            <div className="features_x" id="features_2">
                <div>
                    <h2>Blogging, for all to see</h2>
                    <p>Got something interesting or knowledgable to share? Use our blogging platform to share, interact and brainstorm ideas with the wider community</p>
                </div>
                <div>
                    {/* <img src="/images/placeholder_img.png" width="200px"/> */}
                </div>
            </div>
            <div className="features_x"  id="features_3">
                <div>
                    <h2>Manage all your tasks right here</h2>
                    <p>Manage tasks related to your project. Along with the documentation, the One stop shop for ideas, blogging, and management. For yourself, and your team.</p>
                </div>
                <div>
                    {/* <img src="/images/placeholder_img.png" width="200px"/> */}
                </div>
            </div>

        </section>
    </>
    
  )
}

export default Home
