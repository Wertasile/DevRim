import { useEffect, useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { useUser } from "../context/userContext.js";
import type { Route } from "./+types/home.js";
import type { User } from "~/types/types.js";
import { Film, Handshake, NotebookPen, Users, MessageSquare, BookOpen, Sparkles, TrendingUp, Zap, Shield, Globe, PlusIcon, CircleDotIcon, CircleIcon, PilcrowIcon, BoldIcon, ItalicIcon, ListIcon, ImageIcon, CodeIcon, Heading1Icon, AlignLeftIcon, HighlighterIcon, EditIcon, FilterIcon, SortDescIcon, MessageCircleIcon, ThumbsUpIcon, BookmarkIcon } from "lucide-react";
import gsap from "gsap";
import Lenis from "lenis"
import InfinitePillScrollingFrame from "../components/InfinitePillScrollingFrame";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "DevRim - Where Ideas Meet Community" },
        { name: "description", content: "A platform combining Medium's storytelling depth with Reddit's community engagement. Write long-form content, join communities, connect with authors, and build your network." },
    ];
}

const Home = () => {

    const [user, setUser] = useState<User | null>(null)
    const [expandedFeature, setExpandedFeature] = useState<string | null>("features")

    const heroImgRef = useRef<HTMLDivElement>(null)
    const featuresRef = useRef<HTMLDivElement>(null)
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

                //const height = ref.current.scrollHeight

                //ref.current.style.height = `${height}px`
                ref.current.style.height = `90px`

            } else {
                // Collapse to 0
                ref.current.style.height = '0px'
            }
        }

        updateHeight(announcementsRef, expandedFeature === 'announcements')
        updateHeight(moderationRef, expandedFeature === 'moderation')
        updateHeight(featuredRef, expandedFeature === 'featured')
        updateHeight(featuresRef, expandedFeature === 'features')
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

    useGSAP(() => {

        if (typeof window === "undefined") return;

        (async () => {
            const gsap = (await import("gsap")).default;
            const ScrollTrigger = (await import("gsap/ScrollTrigger")).default;
            gsap.registerPlugin(ScrollTrigger);


            // ----- RTE ICONS ANIMATION ------
            const rteIcons = gsap.utils.toArray(".rte-icon") as any
            rteIcons.forEach((icon: any, index: number) => {
                gsap.to(icon, {
                    opacity: 1,
                    duration: 0.3,
                    ease: "power2.inOut",
                    rotate: gsap.utils.random(-10, 10),
                    y: -200,
                    scrollTrigger: {
                        trigger: ".rte-card",
                        start: "top 60%",

                    }
                })
            })

            // ------ HERO IMG ANIMATION --------------------

            const heroImg = document.querySelector(".hero-image") as HTMLImageElement
            const heroTop = document.querySelector("#hero-top") as HTMLDivElement
            gsap.to(heroTop, {
                duration: 1,
                ease: "power2.inOut",
                scrollTrigger: {
                    pin: heroTop,
                    //markers: true,
                    start: "top 162px",
                    scrub: true,
                },
                opacity: 0.33,
                scale: 0.7
            })


            // ------------------- CHATS SECTION ANIMATION -------------------

            const cards = gsap.utils.toArray(".cards-item")
            const spacer = 20
            const minScale = 0.8

            const distributer = gsap.utils.distribute({ base: minScale, amount: 0.2 })

            cards.forEach( (card : any, index : number) => {

                const scaleVal = distributer(index, cards[index], cards)

                const tween = gsap.fromTo( card, {
                    opacity: 0
                }, {

                    // scroll trigger to minimise card size
                    scrollTrigger : {
                        trigger: card,
                        start: `top 60%`,
                        end: `+=275`,
                        scrub: true, // ensure that tweens movements are in control by scrollbar depth
                        //markers: true,
                        invalidateOnRefresh: true
                    },
                    ease: "expo.in",
                    opacity: 1,
                    
                } )

                // scroll trigger for each individual card to be pinned in place.

                ScrollTrigger.create({
                    trigger: card,
                    start: `top 75px`,
                    endTrigger: ".cards",
                    end: `bottom top+=${300 + (cards.length * spacer)}`, /// by default, when bottom of trigger element hits top of viewport, if we have "bottom 100px" scroller ends 100px down from the top
                    pin: true,
                    pinSpacing: false,
                    //markers: true,
                    id: 'pin',
                    invalidateOnRefresh: true,
                    snap: {
                        snapTo: 1
                    }
                })

            } )
        })()
    }, [])



    return (
        <div className="min-h-screen w-full bg-[#E3E0E9]">

            {/* Hero Section */}
            <section id="hero" className="relative w-full">

                <div className="relative z-10 flex flex-col items-center justify-center gap-[100px] px-4 pt-[100px] mx-auto max-w-[1600px]">

                    <div id="hero-top" className="flex flex-col gap-6  justify-center items-center z-[10]">
                        <h1 className="flex flex-row gap-[10px]">FIND <div className="text-[#E95444]">COMMUNITY.</div></h1>
                        <h1 className="flex flex-row gap-[10px]">FIND <div className="bg-[#4DD499] p-[10px] border-solid border-[3px] border-[#000000]" style={{ rotate: '-4deg' }}>PEOPLE.</div></h1>
                        <p className="text-center">
                            THE BEST PLACE TO FIND BLOGS ON INTERESTING TOPICS AND CONNECT WITH PEOPLE WHO HAVE THE SAME INTERESTS. <br />
                            JOIN COMMUNITIES, CREATE AND SHARE YOUR EXPERIENCES AND CONNECT
                        </p>
                    </div>

                    <div id="hero-bottom" ref={heroImgRef} className=" z-[10] max-w-[1250px] px-[50px]">
                        <img
                            src="/Images/HomePage/heroImg.png"
                            className="hero-img border-[10px] rounded-t-[16.5px] border-solid border-[#FFFFFF]/50 hero-image max-w-full"
                            alt="DevRim Hero"
                            style={{ boxShadow: "0 0 50px 20px #FED259" }}
                        />
                    </div>

                </div>
            </section>

            {/* Overview Section */}
            <section id="overview" className="relative flex flex-wrap justify-center items-center min-h-[600px] px-6 py-16 mx-auto">

                <div className="overview-radial w-[2000px] h-[1.5vh] left-0 w-full h-full z-[20]">
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

            {/* Community Section */}
            <section id="community" className="max-w-[1400px] mx-auto px-6 py-16 mb-[100px]">
                <h1>COMMUNITY</h1>
                <p>Find Like minded people with similar interests. See what people are up to and know what is trending, popping or what you need to know.</p>
                <div>

                </div>
                {/* COMMUNITY GRID*/}
                <div className="grid grid-cols-3 border-[#000000] border-[3px]">

                    {/* COMMUNITY CARD 1*/}
                    <div className="flex flex-col gap-[10px] px-[10px] pt-[20px] pb-[50px] col-span-1 border-[#000000] border-b-[3px] border-r-[3px] bg-[#E95444]/75">

                        {/* FEATURE CARD 0*/}
                        <div className="flex flex-col gap-[10px] px-[5px] py-[20px] border-b-[2px] border-[#000000]">

                            <div className="flex flex-row justify-between items-center">
                                <h4><b>COMMUNITY CREATION</b></h4>
                                <button
                                    onClick={() => toggleFeature('features')}
                                    className="cursor-pointer transition-transform duration-200 hover:scale-110"
                                    aria-label="Toggle community features explanation"
                                >
                                    <PlusIcon
                                        size={20}
                                        className={`transition-transform duration-200 ${expandedFeature === 'features' ? 'hidden' : ''}`}
                                    />
                                </button>
                            </div>


                            <div
                                ref={featuresRef}
                                className="text-small overflow-hidden transition-all duration-500 ease-in-out"
                                style={{ height: '0px' }}
                            >
                                Create Communnities based on your interests and make use of the dashboard to manage your communities and posts and explore the features of the platform.
                            </div>

                        </div>

                        {/* FEATURE CARD 1*/}
                        <div className="flex flex-col gap-[10px] px-[5px] py-[20px] border-b-[2px] border-[#000000]">

                            <div className="flex flex-row justify-between items-center">
                                <h4><b> ANNOUNCEMENTS & COLLECTIONS</b></h4>
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
                                Let your Community know about the up and coming news in relation to your topic and make use of the moderation and rules to keep your community safe and engaging.
                            </div>

                        </div>

                        {/* FEATURE CARD 2*/}
                        <div className="flex flex-col gap-[10px] px-[5px] py-[20px] border-b-[2px] border-[#000000]">
                            <div className="flex flex-row justify-between items-center">
                                <h4><b>MODERATION AND RULES</b></h4>
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
                                Ensure that your community is safe and engaging by moderating and enforcing rules.
                                This includes moderating posts, comments, and users.
                                You can also create rules for your community to help keep it safe and engaging.

                            </div>

                        </div>

                        {/* FEATURE CARD 3*/}
                        <div className="flex flex-col gap-[10px] px-[5px] py-[20px] border-b-[2px] border-[#000000]">
                            <div className="flex flex-row justify-between items-center">
                                <h4><b>FEATURED POSTS & COMMUNITIES</b></h4>
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
                                Feature posts within your community that are trending, insightful or just something that you think is worth sharing.
                            </div>
                        </div>

                    </div>

                    {/* COMMUNITY CARD 2*/}
                    <div className="relative flex items-center justify-center bg-linear-to-b from-[#E95444] to-[#FED259] col-span-2 border-[#000000] border-b-[3px] px-[50px] pt-[100px] font-Manrope">
                        
                        <div className="flex flex-row gap-[10px] bg-[#E3E0E9] bottom-0 absolute p-[10px] border-white/50 border-[10px] rounded-t-[16.5px]">
                            <div className="flex flex-col gap-[10px]">
                                <img src="/Images/CardSwap/BlogsHome.png" alt="Community Card 2" className="w-[400px] h-[100px] object-cover" />
                                <div className="flex justify-between items-center">
                                    <div className="h2-half">PC BUILDING</div>
                                    <div className="flex flex-row gap-[10px]">
                                        <div className="icon-half bg-[#E95444]"><PlusIcon size={10} /></div>
                                        <div className="icon-half bg-[#E95444]"><EditIcon size={10} /></div>
                                    </div>                                   
                                </div>
                                <div className="flex flex-row gap-[10px]">
                                    <input className="w-full input-decor-half text-small-half" type="text" placeholder="Search within PC Building" />
                                    <div className="flex flex-row gap-[10px]">
                                        <div className="icon-half bg-[#E95444]"><FilterIcon size={10} /></div>
                                        <div className="icon-half bg-[#E95444]"><SortDescIcon size={10} /></div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <div className="blog-card-half">
                                        
                                        <div className="flex flex-col gap-[2.5px] p-[2.5px]">
                                            
                                            <div className="flex gap-[2.5px] items-center">
                                                <img src="/Images/CardSwap/BlogsHome.png" alt="Blog Post" className="w-[24px] h-[24px] rounded-full object-cover" />
                                                <div className="flex flex-col gap-[2.5px]">
                                                    <div className="text-small-half">Leon Scott K.</div>
                                                    <div className="text-mini-half">27/02/2026</div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-col gap-[2.5px]">

                                                <div className="h4-half">Insight into Jeff Bezos's claims of the future of PCs.</div>
                                                <div className="flex flex-row text-[#353535] gap-[12.5px]">
                                                    <div className="flex gap-[5px] items-center justify-center text-small-half"><MessageCircleIcon size={10} /> 200</div>
                                                    <div className="flex gap-[5px] items-center justify-center text-small-half"><ThumbsUpIcon size={10} /> 10k</div>
                                                    <div className="flex gap-[5px] items-center justify-center text-small-half"><BookmarkIcon size={10} fill="black" stroke="black"/></div>
                                                </div>
                                            </div>    
                                        </div>

                                        <div>
                                            <img src="/Images/HomePage/cloud-gaming.png" alt="Blog Post" className="w-[100px] h-[50px] object-cover" />
                                        </div>
                                    </div>
                                </div>
                                
                            </div>

                            <div className="flex flex-col gap-[10px] w-40">
                                <div className="bg-[#EDEDE9] border-[1.5px] border-[#000000] gap-[5px] flex flex-col p-[5px] shadow-lg hover:shadow-xl transition-all duration-300">
                                    <div className="h3-half">PC Building - PC News - Innovation - Discussions and more.</div>
                                    <div className="text-small-half">This is a community for people who are into the art of building and modding their own PCs.</div>
                                    <div className="text-small-half">Created on 12/12/2025</div>
                                    <div className="text-small-half flex flex-col gap-[2.5px]">
                                        <b>200k</b> 
                                        members
                                    </div>
                                </div>

                                <div 
                                className={`bg-[#EDEDE9] border-[1.5px] border-[#000000] gap-[5px] flex flex-col p-[5px] shadow-lg hover:shadow-xl 
                                transition-all duration-300 ${expandedFeature == "announcements" ? 'border-[2px] border-[#E95444]' : 'border-[1.5px] border-[#000000]'}`}
                                style={{ 
                                    scale: expandedFeature == "announcements" ? 1.025 : 1, 
                                    boxShadow: expandedFeature == "announcements" && '0 0 10px 0 #E95444'
                                }}
                                >
                                    <div className="h3-half">ANNOUNCEMENTS</div>
                                    <div className="p-1.5 bg-[#E95444]/20 border-b-[1px] rounded-[5px] border-[#979797]">
                                        <div className="h4-half">Update to Code of Conduct and Rules </div>
                                        <div className="p-half">Recently there has been an uptick in users posted leaks and datamined content, this could lead to legal issues and violations of the code of conduct and rules.</div>
                                        <div className="text-mini-half text-[#979797]">
                                            By Devrim User on 12/12/2025
                                        </div>

                                    </div>
                                </div>

                                <div className={`bg-[#EDEDE9] border-[1.5px] border-[#000000] p-[5px] shadow-lg hover:shadow-xl transition-all duration-300 ${expandedFeature == "moderation" ? 'border-[2px] border-[#E95444]' : 'border-[1.5px] border-[#000000]'}`}
                                style={{ 
                                    scale: expandedFeature == "moderation" ? 1.025 : 1, 
                                    boxShadow: expandedFeature == "moderation" && '0 0 10px 0 #E95444'
                                }}
                                >
                                    <div className="h4-half">RULES</div>
                                    <ol>
                                        <li className="text-black/90 text-small-half">Please be respectful and considerate of other users.</li>
                                        <li className="text-black/90 text-small-half">No leaks or datamined content.</li>
                                        <li className="text-black/90 text-small-half">PC Building and Modding related content only. General Tech news and discussions are allowed.</li>
                                        <li className="text-black/90 text-small-half">No spam, self-promotion or advertising.</li>
                                    </ol>
                                </div>
                            </div>


                        </div>



                    </div>

                    {/* COMMUNITY CARD 3*/}
                    <div className="col-span-1 border-[#000000] border-r-[3px] bg-[#E95444]/75">
                        <div className="flex flex-col gap-[10px]">
                            <div className="flex p-[20px] flex-col gap-[10px]">
                                <h2>TOPICS</h2>
                                <div className="text-small">
                                    Create communities based on predefined topics, this makes it so that it is 
                                    easier for community discovery and finding communities that match your interests.
                                </div>
                            </div>
                            <InfinitePillScrollingFrame />
                        </div>

                    </div>

                    {/* COMMUNITY CARD 4*/}
                    <div className="col-span-2 bg-[#E95444]/75 justify-between flex flex-col gap-[10px]">
                        <div className="flex p-[20px] flex-col gap-[10px]">
                            <h2>CUSTOM COLLECTIONS</h2>
                            <div className="text-small">
                                Save posts from various communities into a custom collection, wether it may be posts you want to read later, posts you want to share with others or just posts you want to keep for yourself.
                            </div>
                        </div>
                        <div className="flex flex-row gap-[10px] justify-center items-end">
                            <img src="/Collection-Images/Collection.jpg" alt="Collection 1" className="w-[275px]" />
                            <img src="/Collection-Images/Collection Inside.jpg" alt="Collection 1" className="w-[300px]" />
                        </div>
                    </div>



                </div>
            </section>

            {/* Contribute Section */}
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
                    <div className="rte-card relative flex flex-col gap-[10px] border-[#000000] border-[3px] p-[20px] bg-[#FED259]/75 overflow-hidden">
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
                                <div className="highlight-btn rte-icon absolute top-[350px] left-[180px]" style={{ rotate: '10deg' }}><PilcrowIcon size={20} /></div>
                                <div className="highlight-btn rte-icon absolute top-[270px] left-[230px]" style={{ rotate: '20deg' }}><BoldIcon size={20} /></div>
                                <div className="highlight-btn rte-icon absolute top-[350px] left-[280px]" style={{ rotate: '-15deg' }}><ItalicIcon size={20} /></div>
                                <div className="highlight-btn rte-icon absolute top-[270px] left-[330px]" style={{ rotate: '-25deg' }}><ListIcon size={20} /></div>
                                <div className="highlight-btn rte-icon absolute top-[380px] left-[360px]" style={{ rotate: '5deg' }}><ImageIcon size={20} /></div>
                                <div className="highlight-btn rte-icon absolute top-[315px] left-[410px]" style={{ rotate: '-12deg' }}><CodeIcon size={20} /></div>
                                <div className="highlight-btn rte-icon absolute top-[260px] left-[460px]" style={{ rotate: '-18deg' }}><Heading1Icon size={20} /></div>
                                <div className="highlight-btn rte-icon absolute top-[350px] left-[500px]" style={{ rotate: '-5deg' }}><AlignLeftIcon size={20} /></div>
                                <div className="highlight-btn rte-icon absolute top-[290px] left-[550px]" style={{ rotate: '15deg' }}><HighlighterIcon size={20} /></div>
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
                            style={{ boxShadow: "0 0 20px 0 #E95444" }}
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

            {/* Socialise Section */}
            <section id="features" className="bg-[#1A4E29] flex flex-col justify-center items-center mx-auto px-6 pt-16 pb-[250px] text-white">
                <div className="text-center mb-16">
                    <h1>SOCIALISE</h1>
                    <p>
                        CONNECT WITH PEOPLE WHO HAVE THE SAME INTERESTS AND BUILD YOUR NETWORK.
                    </p>
                </div>
            
            
                <div className="cards max-w-[1400px]">
                    <div className="cards-item w-full bg-[#1A4E29] backdrop-blur-lg p-8 flex flex-col gap-6">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h2>MULTIMEDIA SHARING</h2>
                                <p>Share your thoughts and ideas with others.</p>
                            </div>
                            <div>
                                <video src="/Videos/Chats.mp4" autoPlay muted className="w-[400px] h-auto" />
                            </div>
                        </div>
                    </div>

                    <div className="cards-item bg-[#1A4E29] backdrop-blur-lg p-8 flex flex-col gap-6">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h2>GROUP CHATS</h2>
                                <p>Share your thoughts and ideas with others.</p>
                            </div>
                            <div>
                                <video src="/Videos/MultiMedia.mp4" autoPlay muted className="w-[400px] h-auto" />
                            </div>
                        </div>
                    </div>

                    <div className="cards-item bg-[#1A4E29] backdrop-blur-lg p-8 flex flex-col gap-6">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h2>CONNECT AND CHAT</h2>
                                <p>Share your thoughts and ideas with others.</p>
                            </div>
                            <div>
                                <video src="/Videos/MultiMedia.mp4" autoPlay muted className="w-[400px] h-auto" />
                            </div>
                        </div>
                    </div>
                </div>            
            </section>

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
