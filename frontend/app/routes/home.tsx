import { useEffect, useState } from "react";
import { useGSAP } from "@gsap/react";
import { useUser } from "../context/userContext.js";
import CardSwap, { Card } from "~/components/CardSwap.js";
import type { Route } from "./+types/home.js";
import type { User } from "~/types/types.js";
import { Film, Handshake, NotebookPen } from "lucide-react";
import gsap from "gsap";
import Lenis from "lenis"




export function meta({}: Route.MetaArgs) {
  return [
    { title: "DevRim" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

const Home = () => {

    const [user, setUser] = useState< User | null >(null)

    useEffect(() => {
        if (typeof window === "undefined") return;
        const lenis = new Lenis();
        function raf(time: any) {
        lenis.raf(time);
        requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    }, []);

    useGSAP( () => {

        if (typeof window === "undefined") return;

        (async () => {
        const gsap = (await import("gsap")).default;
        const ScrollTrigger = (await import("gsap/ScrollTrigger")).default;
        gsap.registerPlugin(ScrollTrigger);

        gsap.from("#overview .overview-item", {
            opacity: 0,
            y: 40,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.3,
            scrollTrigger: {
                trigger: "#overview",
                start: "top 80%", // start animation when top of the trigger element hits center of scroller (viewport) 
                                  // 1st element - position within item , 2nd element, where the element should be within viewport to start animation
                                  // % always relative to top, here trigger when 80% under the top
                toggleActions: "play pause complete pause",  // what to do when item on viewpoer - what to do when item exits viewport
                                                    //  what to do when items reenter viewport after exit (scroll up after scroll down)
                                                    //what to do when we scroll back up beyond the start
            },
        });

        gsap.from("#pricing", {
            opacity: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: "#pricing",
                start: "top 80%",
                toggleActions: "play none none complete", 
            },
        });

        const cards = gsap.utils.toArray(".cards-item")
        const spacer = 20
        const minScale = 0.8

        const distributer = gsap.utils.distribute({ base: minScale, amount: 0.2 })

        cards.forEach( (card : any, index : number) => {

            const scaleVal = distributer(index, cards[index], cards)

            const tween = gsap.to( card, {
                scrollTrigger : {
                    trigger: card,
                    start: `top 300px`,
                    scrub: true, // ensure that tweens movements are in control by scrollbar depth
                    // markers: true,
                    invalidateOnRefresh: true
                },
                ease: "power2.inOut",
                scale: scaleVal
            } )

            ScrollTrigger.create({
                trigger: card,
                start: `top-=${index * spacer} 100px`,
                endTrigger: ".cards",
                end: `bottom top+=${300 + (cards.length * spacer)}`, /// by default, when bottom of trigger element hits top of viewport, if we have "bottom 100px" scroller ends 100px down from the top
                pin: true,
                pinSpacing: false,
                //markers: true,
                id: 'pin',
                invalidateOnRefresh: true
            })

        } )

        const container = document.querySelector(".message-panels-container")!  // ! indicates non null assertion

        const totalScroll = container.scrollWidth - document.documentElement.clientWidth + 300;

        gsap.to( container, {
            x: -totalScroll,
            scrollTrigger : {
                trigger: container,
                scrub: true,
                start: `top 30%`,
                pin: true,
                pinSpacing: true,
                end: () => "+=" + totalScroll
            },
            ease: "none"
        })

        })()
    }, [])

    

  return(
    <>
        <section id="hero" className="flex flex-col min-h-[70vh] justify-between gap-6 p-2 lg:flex-row gap-5 mx-auto my-15 max-w-[1200px] ">
            <div className="flex flex-col gap-5">
                <h2>Write. Connect. Share. All in one place.</h2>
                <h3>Devrim is where blogging meets social connection. Publish ideas, follow authors, and connect through direct messages or groups. Combinbing Social - with Educational.</h3>
                <h3><b>Under Construction! Estimated Release October (Beta)</b></h3>
                <h3><b>Mobile version Release 1-2 weeks after Beta Release</b></h3>
                {/* {user === null && <a className="primary-btn" href="signup.html" target="_self">Sign Up for Free</a>} */}
                {/* <img src="/images/placeholder_img.png"/> */}
            </div>
            <div>
            {/* <CardSwap
                cardDistance={60}
                verticalDistance={70}
                delay={5000}
                pauseOnHover={false}
            >
                <Card>
                <img className="rounded-3xl" src="/Images/CardSwap/BlogsHome.png"/>
                </Card>
                <Card>
                <img className="rounded-3xl" src="/Images/CardSwap/BlogsCreate.png"/>
                </Card>
                <Card>
                <img className="rounded-3xl" src="/Images/CardSwap/Messaging.png"/>
                </Card>
            </CardSwap> */}
            </div>
        </section>

        <section id="overview" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-[1200px] my-15 mx-auto bg-[#211F2D]">

            <div className="overview-item flex flex-col justify-between g-3 border-solid border-[0.5px] border-[#353535] p-5 ">
                <div className="w-fit border-solid border-[0.5px] border-[#979797] p-5 rounded-[200px] bg-[#111]">
                    <NotebookPen/>
                </div>
                <div className="flex flex-col gap-3 ">
                    <h2>Blogging without Limits</h2>
                    <p>Publish long-form stories, share code, and add rich media.</p>
                </div>
                <div>
                    {/* <img src="/images/placeholder_img.png" width="100px"/> */}
                </div>
            </div>
            <div className="overview-item flex flex-col justify-between g-3 border-solid border-[0.5px] border-[#353535] p-5 ">
                <div className="w-fit border-solid border-[0.5px] border-[#979797] p-5 rounded-[200px] bg-[#111]">
                    <Handshake/>
                </div>
                <div>
                    <h2>Follow & Connect</h2>
                    <p>Stay updated with your favorite authors, or connect directly to chat.</p>
                </div>
                <div>
                    {/* <img src="/images/placeholder_img.png" width="200px"/> */}
                </div>
            </div>
            <div className="overview-item flex flex-col justify-between g-3 border-solid border-[0.5px] border-[#353535] p-5">
                <div className="w-fit border-solid border-[0.5px] border-[#979797] p-5 rounded-[200px] bg-[#111]">
                    <Film/>
                </div>
                <div>
                    <h2>Chat Beyond Text</h2>
                    <p>Share images, audio, and files in DMs or groups.</p>
                </div>
                <div>
                    {/* <img src="/images/placeholder_img.png" width="200px"/> */}
                </div>
            </div>

        </section>

        <section id="features" className="max-w-[1200px] mb-[40] mx-auto mb-[400px]">
            <h1 className="text-center">Blogging Features</h1>
            <div className="card-container pt-[20vh]">
                <div className="cards">

                    <div className="cards-item bg-[#211F2D] border-solid border-[0.5px] border-[#353535] p-5 flex g-5">
                        <div>
                            <h2 className="border-solid border-[0.5px] border-[#979797] p-5 rounded-[200px] bg-[#111] w-[100px] text-center"> 1 </h2>
                            <h2>Rich Text Editor</h2>
                            <p>You can post Images, Audio, and even Code blocks in your posts. Users can format things however they like, with various headings, lists and other formatting options</p>
                        </div>
                        <div className="w-[700px]">

                        </div>
                    </div>

                    <div className="cards-item bg-[#211F2D] border-solid border-[0.5px] border-[#353535] p-5 flex g-5">
                        <div>
                            <h2 className="border-solid border-[0.5px] border-[#979797] p-5 rounded-[200px] bg-[#111] w-[100px] text-center"> 2 </h2>
                            <h2>Follow your favourite Authors</h2>
                            <p>Keep up with the latest posts from your favourite Authors by following them. </p>
                        </div>
                        <div className="w-[700px]">

                        </div>
                    </div>

                    <div className="cards-item bg-[#211F2D] border-solid border-[0.5px] border-[#353535] p-5 flex g-5">
                        <div>
                            <h2 className="border-solid border-[0.5px] border-[#979797] p-5 rounded-[200px] bg-[#111] w-[100px] text-center"> 3 </h2>
                            <h2>Categories and Lists</h2>
                            <p>Categorise your posts, search by cateogry and find exactly what you're looking for. Have your own private collections or share them with your friends.</p>
                        </div>
                        <div className="w-[700px]">

                        </div>
                    </div>

                </div>
            </div>

        </section>

        <section id="messages" className="max-w-[1200px] my-45 mx-auto">
            <div className="message-panels-container flex flex-row gap-5">
                <div className="message-panel">
                    <h2>Direct Message with Authors</h2>
                    <p>Intersted in an Author's work and wanna get some insight, message them directly by connecting with them and use our messaging platform.</p>
                </div>
                <div className="message-panel">
                    <h2>Group Chats</h2>
                    <div>Wanna hold discussions with members of a community, create a Group Chat and share ideas, multimedia and vibes.</div>
                </div>
                <div className="message-panel">
                    <h2>MultiMedia Sharing</h2>
                    <div>Collaborate ideas by sharing Audios, Files and Images</div>
                </div>
                <div className="message-panel">
                    <h2>Connect and Follow</h2>
                    <div>Connect with Authors and Collaborate with them, by adding them into your profiles and more.</div>
                </div>
                
            </div>
        </section>


        <section id="pricing" className=" max-w-[1200px] my-15 mx-auto ">
            <h1 className="text-center">Pricing</h1>
            <div className="flex flex-row justify-center gap-5">
                <div className="pricing-item border-solid border-[0.5px] border-[#353535]">
                    <div className="border-solid border-b-[0.5px] border-[#979797] p-5">
                        <h2>Free</h2>
                        <p className="text-[#979797] italic">Get Started with Blogs and Messaging</p>

                    </div>
                    <div className="p-5">
                        <ul>
                            <li> - DMs and Group Chats</li>
                            <li> - Multimedia sharing</li>
                            <li> - Voice messaging</li>
                        </ul>
                    </div>
                </div>
                <div className="pricing-item border-solid border-[0.5px] border-[#353535]">
                    
                    <div className="border-solid border-b-[0.5px] border-[#979797] p-5">
                        <h2>Enterprise</h2>
                        <p className="text-[#979797] italic">Get access to exclusive member perks</p>
                    </div>
                    <div className="p-5">
                        Currently in the works. Release : TBC
                    </div>
                </div>
            </div>
        </section>
    </>
    
  )
}

export default Home
