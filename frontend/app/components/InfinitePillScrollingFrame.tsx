export default function InfinitePillScrollingFrame() {
  // Color schemes for different topics
  const colorSchemes: Record<string, { gradient: string; glow: string }> = {
    "Anime and Manga": { 
      gradient: "from-[#FF6B9D] to-[#FFB3D9]", 
      glow: "rgba(255, 107, 157, 0.4)" 
    },
    "Video Games": { 
      gradient: "from-[#4DD499] to-[#7EE8B8]", 
      glow: "rgba(77, 212, 153, 0.4)" 
    },
    "Science": { 
      gradient: "from-[#6C5CE7] to-[#A29BFE]", 
      glow: "rgba(108, 92, 231, 0.4)" 
    },
    "Technology": { 
      gradient: "from-[#00D2FF] to-[#5CE1E6]", 
      glow: "rgba(0, 210, 255, 0.4)" 
    },
    "Sport": { 
      gradient: "from-[#E95444] to-[#FF6B6B]", 
      glow: "rgba(233, 84, 68, 0.4)" 
    },
    "Travel": { 
      gradient: "from-[#FED259] to-[#FFE48A]", 
      glow: "rgba(254, 210, 89, 0.4)" 
    },
    "Food and Cooking": { 
      gradient: "from-[#FF8C42] to-[#FFB366]", 
      glow: "rgba(255, 140, 66, 0.4)" 
    },
    "Comics": { 
      gradient: "from-[#FF4757] to-[#FF6B7A]", 
      glow: "rgba(255, 71, 87, 0.4)" 
    },
    "Education": { 
      gradient: "from-[#5F27CD] to-[#8B7EC8]", 
      glow: "rgba(95, 39, 205, 0.4)" 
    },
    "Lifestyle": { 
      gradient: "from-[#00D2D3] to-[#54E0E1]", 
      glow: "rgba(0, 210, 211, 0.4)" 
    },
    "Books": { 
      gradient: "from-[#C44569] to-[#E77F9E]", 
      glow: "rgba(196, 69, 105, 0.4)" 
    },
    "Programming": { 
      gradient: "from-[#2ED573] to-[#5FE896]", 
      glow: "rgba(46, 213, 115, 0.4)" 
    },
    "Personal Computers": { 
      gradient: "from-[#3742FA] to-[#5F6FFA]", 
      glow: "rgba(55, 66, 250, 0.4)" 
    },
    "Fitness and Health": { 
      gradient: "from-[#FF6348] to-[#FF8A75]", 
      glow: "rgba(255, 99, 72, 0.4)" 
    },
    "Health": { 
      gradient: "from-[#FFA502] to-[#FFB84D]", 
      glow: "rgba(255, 165, 2, 0.4)" 
    }
  };

  const pills = [
    { text: "Anime and Manga", left: "20px", top: "59px" },
    { text: "Video Games", left: "94px", top: "0" },
    { text: "Science", left: "0", top: "0" },
    { text: "Technology", left: "219px", top: "0" },
    { text: "Sport", left: "330px", top: "59px" },
    { text: "Travel", left: "334px", top: "0" },
    { text: "Food and Cooking", left: "174px", top: "59px" },
    { text: "Comics", left: "418px", top: "0" },
    { text: "Education", left: "510px", top: "0" },
    { text: "Lifestyle", left: "616px", top: "0" },
    { text: "Books", left: "414px", top: "59px" },
    { text: "Programming", left: "501px", top: "59px" },
    { text: "Personal Computers", left: "629px", top: "59px" },
    { text: "Fitness and Health", left: "713px", top: "0" },
    { text: "Health", left: "797px", top: "59px" },
    { text: "Anime and Manga", left: "887px", top: "59px" },
    { text: "Science", left: "868px", top: "0" },
    { text: "Video Games", left: "962px", top: "0" },
    { text: "Technology", left: "1087px", top: "0" },
    { text: "Sport", left: "1198px", top: "59px" },
    { text: "Travel", left: "1202px", top: "0" },
    { text: "Food and Cooking", left: "1042px", top: "59px" },
    { text: "Comics", left: "1286px", top: "0" },
    { text: "Education", left: "1378px", top: "0" },
    { text: "Lifestyle", left: "1484px", top: "0" },
    { text: "Books", left: "1282px", top: "59px" },
    { text: "Programming", left: "1369px", top: "59px" },
    { text: "Personal Computers", left: "1497px", top: "59px" },
    { text: "Fitness and Health", left: "1581px", top: "0" },
    { text: "Health", left: "1665px", top: "59px" }
  ];

  return (
    <div className="max-w-[600px] py-[20px] overflow-hidden bg-[rgba(255,255,255,0)] content-stretch flex flex-col items-start p-[5px] relative size-full" data-name="Infinite Pill Scrolling Frame">
      <div className="infinite-pill-scroll-container h-[100px] relative shrink-0 w-full" data-name="Pills">
        {pills.map((pill, index) => {
          const colorScheme = colorSchemes[pill.text] || { 
            gradient: "from-[#edede9] to-[#ddfffd]", 
            glow: "rgba(51, 0, 255, 0.2)" 
          };
          return (
          <div
            key={index}
            className={`absolute bg-gradient-to-t content-stretch flex items-center justify-center p-[10px] rounded-[25px] ${colorScheme.gradient}`}
            style={{ left: pill.left, top: pill.top, boxShadow: `0px 0px 20px 0px ${colorScheme.glow}` }}
            data-name="Pill"
            
          >
            <div aria-hidden="true" className="absolute border border-white/50 border-solid inset-[-1px] pointer-events-none rounded-[26px] shadow-[0px_0px_20px_0px_rgba(51,0,255,0.2)]" />
            <div className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[12px] text-black text-nowrap">
              {pill.text}
            </div>
          </div>
        );
        })}
      </div>
    </div>
  );
}
