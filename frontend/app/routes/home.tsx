import { useEffect, useState } from "react";
import { useGSAP } from "@gsap/react";
import { useUser } from "../context/userContext.js";
import type { Route } from "./+types/home.js";
import type { User } from "~/types/types.js";
import { Film, Handshake, NotebookPen, Users, MessageSquare, BookOpen, Sparkles, TrendingUp, Zap, Shield, Globe } from "lucide-react";
import gsap from "gsap";
import Lenis from "lenis"

export function meta({}: Route.MetaArgs) {
  return [
    { title: "DevRim - Where Ideas Meet Community" },
    { name: "description", content: "A platform combining Medium's storytelling depth with Reddit's community engagement. Write long-form content, join communities, connect with authors, and build your network." },
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
                start: `top-=${index * spacer} 75px`,
                endTrigger: ".cards",
                end: `bottom top+=${300 + (cards.length * spacer)}`, /// by default, when bottom of trigger element hits top of viewport, if we have "bottom 100px" scroller ends 100px down from the top
                pin: true,
                pinSpacing: false,
                //markers: true,
                id: 'pin',
                invalidateOnRefresh: true
            })

        } )

        // const container = document.querySelector(".message-panels-container")!  // ! indicates non null assertion

        // const totalScroll = container.scrollWidth - document.documentElement.clientWidth + 300;

        // gsap.to( container, {
        //     x: -totalScroll,
        //     scrollTrigger : {
        //         trigger: container,
        //         scrub: true,
        //         start: `top 30%`,
        //         pin: true,
        //         pinSpacing: true,
        //         end: () => "+=" + totalScroll
        //     },
        //     ease: "none"
        // })

        })()
    }, [])

    

  return(
    <div className="min-h-screen w-full">
        {/* Hero Section */}
        <section id="hero" className="relative min-h-screen w-full overflow-hidden">
            <div className="relative z-10 flex flex-col h-screen items-center justify-center text-center gap-8 px-4 mx-auto max-w-[1200px]">
                <div className="flex flex-col items-center gap-6 max-w-4xl">
                    <h1>Where Ideas Meet Community</h1>
                    <h3>
                        Publish long-form stories like Medium. Build communities like Reddit. Connect, discuss, and grow together.
                    </h3>
                    <p>
                        A platform that combines the depth of Medium's storytelling with the engagement of Reddit's communities.
                    </p>
                </div>
                <div className="mt-8">
                    <img 
                        src="/Images/HomePage/hero-image.png" 
                        className="hero-image max-w-full h-auto"
                        alt="DevRim Hero"
                    />
                </div>
            </div>
        </section>

        <section id="overview" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-[1200px] gap-6 px-6 py-16 mx-auto">

            <div className="overview-item flex flex-col justify-between gap-4 border-solid border-[0.5px] border-[#353535] bg-[#E95444]/70 p-6">
                <div className="w-fit border-solid border-[0.5px] border-[#979797] p-5 rounded-[200px] bg-[#111]">
                    <NotebookPen className="text-white"/>
                </div>
                <div className="flex flex-col gap-3">
                    <h2>Blogging without Limits</h2>
                    <p>Publish long-form stories, share code, and add rich media.</p>
                </div>
                <div>
                    {/* <img src="/images/placeholder_img.png" width="100px"/> */}
                </div>
            </div>
            <div className="overview-item flex flex-col justify-between gap-4 border-solid border-[0.5px] border-[#353535] bg-[#4DD499]/70 p-6">
                <div className="w-fit border-solid border-[0.5px] border-[#979797] p-5 rounded-[200px] bg-[#111]">
                    <Handshake className="text-white"/>
                </div>
                <div className="flex flex-col gap-3">
                    <h2>Follow & Connect</h2>
                    <p>Stay updated with your favorite authors, or connect directly to chat.</p>
                </div>
                <div>
                    {/* <img src="/images/placeholder_img.png" width="200px"/> */}
                </div>
            </div>
            <div className="overview-item flex flex-col justify-between gap-4 border-solid border-[0.5px] border-[#353535] bg-[#FFE48A]/30 p-6">
                <div className="w-fit border-solid border-[0.5px] border-[#979797] p-5 rounded-[200px] bg-[#111]">
                    <Film className="text-white"/>
                </div>
                <div className="flex flex-col gap-3">
                    <h2>Chat Beyond Text</h2>
                    <p>Share images, audio, and files in DMs or groups.</p>
                </div>
                <div>
                    {/* <img src="/images/placeholder_img.png" width="200px"/> */}
                </div>
            </div>
            

        </section>

        {/* How It Works Section */}
        <section id="features" className="max-w-[1400px] mx-auto px-6 py-16 mb-[100px]">
            <div className="text-center mb-16">
                <h1>How It Works</h1>
                <p>
                    Three simple steps to start your journey
                </p>
            </div>
            
            <div className="card-container">
                <div className="cards">
                    <div className="cards-item bg-[#E95444]/50 backdrop-blur-lg border border-[#000000] rounded-xl p-8 flex flex-col gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-[#CCCCCC] flex items-center justify-center flex-shrink-0">
                                <h2>1</h2>
                            </div>
                            <div>
                                <h2>Write Your Story</h2>
                                <p>
                                    Use our natural editor to write long-form content. Start with a title, then write freely. Add code blocks, images, headings, and formatting to make your post stand out.
                                </p>
                            </div>
                        </div>
                        <div className="pl-24">
                            <ul>
                                <li>• Natural writing experience - feels like writing in a book</li>
                                <li>• Rich formatting options - headings, lists, code blocks</li>
                                <li>• Media support - images, audio, and more</li>
                                <li>• Choose a community to share your post</li>
                            </ul>
                        </div>
                    </div>

                    <div className="cards-item bg-[#4DD499]/70 border border-[#000000] backdrop-blur-lg rounded-xl p-8 flex flex-col gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-[#CCCCCC] flex items-center justify-center flex-shrink-0">
                                <h2>2</h2>
                            </div>
                            <div>
                                <h2>Join Communities</h2>
                                <p>
                                    Discover communities around topics you love, or create your own. Each community has rules, moderators, and dedicated discussions. Share posts and engage with like-minded people.
                                </p>
                            </div>
                        </div>
                        <div className="pl-24">
                            <ul>
                                <li>• Browse and join existing communities</li>
                                <li>• Create your own community with custom rules</li>
                                <li>• Post within communities for targeted audience</li>
                                <li>• Search and filter posts within communities</li>
                            </ul>
                        </div>
                    </div>

                    <div className="cards-item bg-[#FFE48A]/30 border border-[#000000] backdrop-blur-lg rounded-xl p-8 flex flex-col gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-[#CCCCCC] flex items-center justify-center flex-shrink-0">
                                <h2>3</h2>
                            </div>
                            <div>
                                <h2>Connect & Engage</h2>
                                <p>
                                    Follow authors, connect with peers, and build your network. Comment on posts, save favorites to collections, and chat directly with other members. Build meaningful relationships.
                                </p>
                            </div>
                        </div>
                        <div className="pl-24">
                            <ul>
                                <li>• Follow authors and see their latest posts</li>
                                <li>• Comment and reply to build discussions</li>
                                <li>• Save posts to collections for later</li>
                                <li>• Message directly or join group chats</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section id="features" className="max-w-[1400px] mx-auto py-16">
        {/* <section id="messages" className="my-45"> */}
            <div className="message-panels-container flex flex-col gap-16 overflow-clip">
                <div className="message-panel ">
                    <h2>Direct Message with Authors</h2>
                    <p>Intersted in an Author's work and wanna get some insight, message them directly by connecting with them and use our messaging platform.</p>
                </div>
                <div className="message-panel right">
                    <h2>Group Chats</h2>
                    <div>Wanna hold discussions with members of a community, create a Group Chat and share ideas, multimedia and vibes.</div>
                </div>
                <div className="message-panel">
                    <h2>MultiMedia Sharing</h2>
                    <div>Collaborate ideas by sharing Audios, Files and Images</div>
                </div>
                <div className="message-panel right">
                    <h2>Connect and Follow</h2>
                    <div>Connect with Authors and Collaborate with them, by adding them into your profiles and more.</div>
                </div>
            </div>
        </section>

        {/* <section id="pricing" className=" max-w-[1200px] my-15 mx-auto ">
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
        </section> */}
    </div>
    
  )
}

export default Home
