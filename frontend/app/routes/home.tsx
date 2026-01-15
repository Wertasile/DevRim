import { useEffect, useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { useUser } from "../context/userContext.js";
import type { Route } from "./+types/home.js";
import type { User } from "~/types/types.js";
import { Film, Handshake, NotebookPen, Users, MessageSquare, BookOpen, Sparkles, TrendingUp, Zap, Shield, Globe, PlusIcon, CircleDotIcon, CircleIcon, PilcrowIcon, BoldIcon, ItalicIcon, ListIcon, ImageIcon, CodeIcon, Heading1Icon, AlignLeftIcon, HighlighterIcon } from "lucide-react";
import gsap from "gsap";
import Lenis from "lenis"
import InfinitePillScrollingFrame from "../components/InfinitePillScrollingFrame";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "DevRim - Where Ideas Meet Community" },
    { name: "description", content: "A platform combining Medium's storytelling depth with Reddit's community engagement. Write long-form content, join communities, connect with authors, and build your network." },
  ];
}

const Home = () => {

    const [user, setUser] = useState< User | null >(null)
    const [expandedFeature, setExpandedFeature] = useState<string | null>("announcements")
    
    const announcementsRef = useRef<HTMLDivElement>(null)
    const moderationRef = useRef<HTMLDivElement>(null)
    const featuredRef = useRef<HTMLDivElement>(null)

    const toggleFeature = (featureId: string) => {
        setExpandedFeature(prev => prev === featureId ? null : featureId)
    }

    // Update heights when expanded feature changes
    useEffect(() => {
        const updateHeight = (ref: React.RefObject<HTMLDivElement | null>, isExpanded: boolean) => {
            if (!ref.current) return
            
            if (isExpanded) {
                
                const height = ref.current.scrollHeight
                
                ref.current.style.height = `${height}px`
                    
            } else {
                // Collapse to 0
                ref.current.style.height = '0px'
            }
        }

        updateHeight(announcementsRef, expandedFeature === 'announcements')
        updateHeight(moderationRef, expandedFeature === 'moderation')
        updateHeight(featuredRef, expandedFeature === 'featured')
    }, [expandedFeature])

    // Handle initial mount - set initial height for expanded feature
    useEffect(() => {
        if (announcementsRef.current && expandedFeature === 'announcements') {
            // Small delay to ensure DOM is fully rendered
            const timeoutId = setTimeout(() => {
                if (announcementsRef.current) {
                    const height = announcementsRef.current.scrollHeight
                    announcementsRef.current.style.height = `${height}px`
                }
            }, 50)
            return () => clearTimeout(timeoutId)
        }
    }, [])

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
    <div className="min-h-screen w-full bg-[#E3E0E9]">

        {/* Hero Section */}
        <section id="hero" className="relative min-h-screen w-full overflow-hidden">
            <div className="relative z-10 top-[70px] flex flex-col h-screen items-center justify-center gap-8 px-4 mx-auto max-w-[1600px]">
                <div className="flex flex-col gap-6 max-w-4xl">
                    <h1 className="flex flex-row gap-[10px]">FIND <div className="text-[#E95444]">COMMUNITY.</div>FIND <div className="bg-[#4DD499] p-[10px] border-solid border-[3px] border-[#000000]" style={{rotate: '-4deg'}}>PEOPLE.</div></h1>
                    <p>
                        THE BEST PLACE TO FIND BLOGS ON INTERESTING TOPICS AND CONNECT WITH PEOPLE WHO HAVE THE SAME INTERESTS. <br />
                        JOIN COMMUNITIES, CREATE AND SHARE YOUR EXPERIENCES AND CONNECT
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

        <section id="overview" className="relative flex flex-wrap justify-center items-center min-h-[600px] px-6 py-16 mx-auto">

            <div className="overview-radial absolute top-[200px] w-[2000px] h-[1.5vh] left-0 w-full h-full z-[20]">
            </div>

            <div className="flex flex-wrap justify-center items-center">

                <div className="flex flex-col justify-betweenborder-solid border border-[#000000] p-[50px] bg-white max-w-[450px] z-[30]">
                    <div className="flex flex-col gap-3">
                        <h2>COMMUNITY</h2>
                        <p>Find Like minded people with similar interests. See what people are up to and know what is trending, popping or what you need to know.</p>
                    </div>  
                </div>
                <div className="flex flex-col justify-betweenborder-solid border border-[#000000] bg-white p-[50px] max-w-[450px] z-[30]">
                    <div className="flex flex-col gap-3">
                        <h2>PEOPLE</h2>
                        <p>Find Like minded people with similar interests. See what people are up to and know what is trending, popping or what you need to know.</p>
                    </div>
                </div>
                <div className="flex flex-col justify-betweenborder-solid border border-[#000000] bg-white p-[50px] max-w-[450px] z-[30]">
                    <div className="flex flex-col gap-3">
                        <h2>BLOGS</h2>
                        <p>Find Like minded people with similar interests. See what people are up to and know what is trending, popping or what you need to know.</p>
                    </div>
                </div>
            </div> 

        </section>

        <section id="community" className="max-w-[1400px] mx-auto px-6 py-16 mb-[100px]">
            <h1>COMMUNITY</h1>
            <p>Find Like minded people with similar interests. See what people are up to and know what is trending, popping or what you need to know.</p>
            <div>
                
            </div>
            {/* COMMUNITY GRID*/}
            <div className="grid grid-cols-3 border-[#000000] border-[3px]">
                
                {/* COMMUNITY CARD 1*/}
                <div className="flex flex-col gap-[10px] px-[10px] pt-[20px] pb-[50px] col-span-1 border-[#000000] border-b-[3px] border-r-[3px] bg-[#E95444]/75">
                    <h2>FEATURES</h2>

                    {/* FEATURE CARD 1*/}
                    <div className="flex flex-col gap-[10px] px-[5px] py-[20px] border-b-[2px] border-[#000000]">

                        <div className="flex flex-row justify-between items-center">
                            <h4 className="font-semibold">ANNOUNCEMENTS</h4>
                            <button 
                                onClick={() => toggleFeature('announcements')}
                                className="cursor-pointer transition-transform duration-200 hover:scale-110"
                                aria-label="Toggle announcements explanation"
                            >
                                <PlusIcon 
                                    size={20} 
                                    className={`transition-transform duration-200 ${expandedFeature === 'announcements' ? 'hidden' : ''}`}
                                />
                            </button>
                        </div>

                        
                            <div 
                                ref={announcementsRef}
                                className="text-small overflow-hidden transition-all duration-500 ease-in-out"
                                style={{ height: '0px' }}
                            >
                            Let your Community know about the up and coming news in relation to your topic.
                            </div>
                        
                    </div>

                    {/* FEATURE CARD 2*/}
                    <div className="flex flex-col gap-[10px] px-[5px] py-[20px] border-b-[2px] border-[#000000]">
                        <div className="flex flex-row justify-between items-center">
                            <h4 className="font-semibold">MODERATION AND RULES</h4>
                            <button 
                                onClick={() => toggleFeature('moderation')}
                                className="cursor-pointer transition-transform duration-200 hover:scale-110"
                                aria-label="Toggle moderation and rules explanation"
                            >
                                <PlusIcon 
                                    size={20} 
                                    className={`transition-transform duration-200 ${expandedFeature === 'moderation' ? 'hidden' : ''}`}
                                />
                            </button>
                        </div>

                        <div 
                            ref={moderationRef}
                            className="text-small overflow-hidden transition-all duration-500 ease-in-out"
                            style={{ height: '0px' }}
                        >
                            Let your Community know about the up and coming news in relation to your topic.
                        </div>

                    </div>

                    {/* FEATURE CARD 3*/}
                    <div className="flex flex-col gap-[10px] px-[5px] py-[20px] border-b-[2px] border-[#000000]">
                        <div className="flex flex-row justify-between items-center">
                            <h4 className="font-semibold">FEATURED POSTS & COMMUNITIES</h4>
                            <button 
                                onClick={() => toggleFeature('featured')}
                                className="cursor-pointer transition-transform duration-200 hover:scale-110"
                                aria-label="Toggle featured posts and communities explanation"
                            >
                                <PlusIcon 
                                    size={20} 
                                    className={`transition-transform duration-200 ${expandedFeature === 'featured' ? 'hidden' : ''}`}
                                />
                            </button>
                        </div>

                        <div 
                            ref={featuredRef}
                            className="text-small overflow-hidden transition-all duration-500 ease-in-out"
                            style={{ height: '0px' }}
                        >
                            Let your Community know about the up and coming news in relation to your topic.
                        </div>
                    </div>

                </div>

                {/* COMMUNITY CARD 2*/}
                <div className="bg-linear-to-b from-[#E95444] to-[#FED259] col-span-2 border-[#000000] border-b-[3px]">

                </div>

                {/* COMMUNITY CARD 3*/}
                <div className="col-span-1 border-[#000000] border-r-[3px] bg-[#E95444]/75">
                    <div className="flex flex-col gap-[10px]">
                        <div className="flex p-[20px] flex-col gap-[10px]">
                            <h2>TOPICS</h2>
                            <div className="text-small">
                                With various topics to choose from, you can find communities and posts that match your interests.
                            </div>
                        </div>
                        <InfinitePillScrollingFrame />
                    </div>
                    
                </div>
                
                {/* COMMUNITY CARD 4*/}
                <div className="col-span-2 bg-[#E95444]/75 justify-between flex flex-col gap-[10px]">
                    <div className="flex p-[20px] flex-col gap-[10px]">
                        <h2>COLLECTIONS</h2>
                        <div className="text-small">
                            Save your favorite posts and communities to your collections for easy access and reference.
                        </div>
                    </div>
                    <div className="flex flex-row gap-[10px] justify-center items-end">
                        <img src="/Collection-Images/Collection.jpg" alt="Collection 1" className="w-[275px]" />
                        <img src="/Collection-Images/Collection Inside.jpg" alt="Collection 1" className="w-[300px]" />
                    </div>
                </div>

                

            </div>
        </section>

        <section id="contribute" className="max-w-[1400px] mx-auto px-6 py-16 mb-[100px]">

            <h1>CONTRIBUTE</h1>
            <p>Contribute to the community by sharing your knowledge, experiences and ideas. Make a difference and help others learn and grow.</p>

            {/* IMAGE */}
            <div id="contribute-img-container" className="flex justify-center items-center border-[#FFFFFF/50] border-[3px] pt-[50px]">
                <img 
                src="/Images/Contribute.png" 
                alt="Contribute"
                className="w-[70%] h-auto border-[#FFFFFF]/50 border-l-[25px] border-t-[25px] border-r-[25px] rounded-t-[16.5px]" 
                style={{ boxShadow: "4px 0 100px 5px #FED259" }}
                />
            </div>

            {/* CARDS */}
            <div className="grid grid-cols-3">

                {/* CARD 1*/}
                <div className="relative flex flex-col gap-[10px] border-[#000000] border-[3px] p-[20px] bg-[#FED259]/75 overflow-hidden">
                    <h2>RICH TEXT EDITOR</h2>
                    <p>Use our natural editor to write long-form content. Start with a title, then write freely. Add code blocks, images, headings, and formatting to make your post stand out.</p>
                    {/* <ul>
                        <li>• Natural writing experience - feels like writing in a book</li>
                        <li>• Rich formatting options - headings, lists, code blocks</li>
                        <li>• Media support - images, audio, and more</li>
                        <li>• Choose a community to share your post</li>
                    </ul> */}

                    <div className="rte-gradient absolute h-[430px] w-[810px] bottom-[-230px] right-[-200px] bg-white">
                        <div className="h-full relative">
                            <div className="highlight-btn rte-icon absolute top-[350px] left-[180px]" style={{rotate: '10deg'}}><PilcrowIcon size={20} /></div>
                            <div className="highlight-btn rte-icon absolute top-[300px] left-[230px]" style={{rotate: '20deg'}}><BoldIcon size={20} /></div>
                            <div className="highlight-btn rte-icon absolute top-[350px] left-[280px]" style={{rotate: '-15deg'}}><ItalicIcon size={20} /></div>
                            <div className="highlight-btn rte-icon absolute top-[270px] left-[330px]" style={{rotate: '-25deg'}}><ListIcon size={20} /></div>
                            <div className="highlight-btn rte-icon absolute top-[380px] left-[360px]" style={{rotate: '5deg'}}><ImageIcon size={20} /></div>
                            <div className="highlight-btn rte-icon absolute top-[315px] left-[410px]" style={{rotate: '-12deg'}}><CodeIcon size={20} /></div>
                            <div className="highlight-btn rte-icon absolute top-[260px] left-[460px]" style={{rotate: '-18deg'}}><Heading1Icon size={20} /></div>
                            <div className="highlight-btn rte-icon absolute top-[350px] left-[500px]" style={{rotate: '-5deg'}}><AlignLeftIcon size={20} /></div>
                            <div className="highlight-btn rte-icon absolute top-[290px] left-[550px]" style={{rotate: '15deg'}}><HighlighterIcon size={20} /></div>
                        </div>
                    </div>
  
                </div>
                
                {/* CARD 2*/}
                <div 
                    id="coding-card"
                    className="flex flex-col gap-[10px] border-[#000000] border-[3px] justify-between pt-[20px] pl-[20px] bg-[#FED259]/75"
                >
                    <div className="pr-[20px]">
                        <h2>BUILT FOR CODING</h2>
                        <p>Our platform is built for coding and development. We have a rich set of tools and features to help you write and share your code.</p>
                        {/* <ul>
                            <li>• Code highlighting - syntax highlighting for your code</li>
                            <li>• Code blocks - embed code blocks into your post</li>
                            <li>• Code snippets - embed code snippets into your post</li>
                            <li>• Code examples - embed code examples into your post</li>
                        </ul> */}
                    </div>

                    <div 
                        className="rounded-tl-[5px] border-t-[#FFFFFF]/50 border-l-[#FFFFFF]/50 border-l-[10px] border-t-[10px]" 
                        style={{boxShadow: "0 0 20px 0 #E95444"}}
                    >
                        <div className="flex flex-row gap-[10px] items-center bg-black rounded-tl-[5px] p-[10px]">
                            <CircleIcon size={12} fill="#F76A63" stroke="#F76A63" />
                            <CircleIcon size={12} fill="#F8CE52" stroke="#F8CE52" />
                            <CircleIcon size={12} fill="#61CE66" stroke="#61CE66" />
                        </div>
                        <div className="text-monospace bg-[#E3E0E9] p-[10px]">
                            <code>
                                <span className="text-red-500">const</span> <span className="text-blue-500">hello</span> <span className="text-green-500">=</span> <span className="text-yellow-500">'World'</span>;
                                <br />
                                <span className="text-red-500">console</span>.<span className="text-blue-500">log</span>(<span className="text-yellow-500">hello</span>);
                            </code>
                        </div>
                    </div>  
                </div>

                <div className="flex flex-col gap-[50px] border-[#000000] border-[3px] pt-[20px] pl-[25px] pr-[25px] bg-[#FED259]/75">

                    <div className="flex flex-col gap-[10px]">
                        <h2>COMMENTS</h2>
                        <p>Comment on posts and engage with the community. Share your thoughts and ideas with others.</p>
                            {/* <ul>
                                <li>• Comment on posts and engage with the community</li>
                                <li>• Share your thoughts and ideas with others</li>
                                <li>• Build discussions and connections</li>
                                <li>• Save comments to your collections</li>
                            </ul> */}
                    </div>

                    <div className="w-full flex justify-center">
                        <video src="/Videos/For-comments.mp4" autoPlay muted className="w-[200px] h-auto rounded-t-[16.5px] border-[#FFFFFF]/50 border-[10px]" />
                    </div>
                    
                </div>
                
                
            </div>

        </section>

        {/* How It Works Section */}

        {/* <section id="features" className="max-w-[1400px] mx-auto px-6 py-16 mb-[100px]">
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
        </section> */}

        {/* <section id="features" className="max-w-[1400px] mx-auto py-16">
        
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
        </section> */}

    </div>
    
  )
}

export default Home
