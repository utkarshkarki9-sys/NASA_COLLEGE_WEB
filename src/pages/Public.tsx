import { useEffect, useRef, useState } from 'react';



import type { MouseEvent as ReactMouseEvent } from 'react';







import { Link } from 'react-router-dom';







import {







  ArrowDown,







  ArrowUpRight,







  CalendarDays,



  MapPin,







  Rocket,







  Globe2,







  Code2,







  Users,







  Sparkles,







  Orbit,







  Lightbulb,







  Mic2,







  Network,







  GraduationCap,







  Trophy,







  Plus,







  Minus,

  ChevronLeft,

  ChevronRight,







} from 'lucide-react';







import {







  ArrowLink,







  Eyebrow,







  OptimizedImage,







  SectionTitle,







} from '../components/UI';







import Gallery from '../components/Gallery';







import {







  event,







  faqs,







  schedule,







  videos,







} from '../data';







import { api } from '../lib/api';



const EVENT_DATE_LABEL = '14–16 November 2026';

const EVENT_DATE_RANGE = '14–16 NOVEMBER 2026';

const EVENT_DURATION_COPY = 'Three days to explore, build, and bring your ideas to life. Here’s how the journey unfolds.';

const challengeStatements = [
  { title: 'Abandoned but not Forgotten: Storytelling about NASA’s Discarded Equipment on the Moon and Mars', level: 'INTERMEDIATE · BEGINNER / YOUTH', tags: 'Astrophysics · Planets & Moons · Space Exploration', text: 'Tell the story of hardware NASA has left across the solar system since the 1960s, introducing school-age space enthusiasts to the equipment, missions, and science it made possible.' },
  { title: 'Be An Earth System Trend Detective!', level: 'ADVANCED', tags: 'Earth Science · Software', text: 'Use NASA mission measurements or NASA models to investigate environmental variables, visualize how they change over time, and determine what is changing, where, how much, and whether the change is statistically significant.' },
  { title: 'Build a Junior Astronaut Mission Trainer', level: 'INTERMEDIATE · BEGINNER / YOUTH', tags: 'Games · Planets & Moons · Software · Space Exploration · Sun', text: 'Build an interactive game or app where students operate a lunar or Martian outpost while balancing life support, radiation shielding, power, food production, and other mission trade-offs.' },
  { title: 'CLPS Lunar Mission Browser', level: 'ADVANCED · INTERMEDIATE', tags: 'Human Exploration · Moon · Software · Space Exploration', text: 'Create an intuitive tool for comparing lunar south-pole landing sites and dates by visualizing Sun and Earth positions, power-generation potential, and direct-to-Earth communication windows.' },
  { title: 'Create Health Monitoring Software for Astronauts on Space Missions', level: 'INTERMEDIATE', tags: 'Human Exploration · Software · Space Exploration', text: 'Build health-monitoring software that gathers health indicators and helps astronauts evaluate and act on their health during long-duration missions affected by radiation, isolation, altered gravity, and other hazards.' },
  { title: 'Dancing with the SARs', level: 'ADVANCED · INTERMEDIATE', tags: 'Earth Science', text: 'Build an interactive application using NASA-ISRO Synthetic Aperture Radar (NISAR) data to track and visualize surface changes such as wetland loss, wildfires, earthquakes, farming activity, or glacier movement.' },
  { title: 'Field Shift: Adapting Farms with NASA Data', level: 'ADVANCED · INTERMEDIATE', tags: 'Arts & Multimedia · Earth Science · Software', text: 'Create a decision-support tool combining NASA Earth observations with local soil information, crop characteristics, and farmer priorities to explore crop-rotation strategies that improve resilience and soil health.' },
  { title: 'Flame in Freefall: AI-Powered Fire Safety Insights from Microgravity Combustion Data', level: 'ADVANCED · INTERMEDIATE', tags: 'Space Exploration', text: 'Create an interactive AI-powered dashboard that summarizes, ranks, and interprets NASA microgravity combustion research to deliver useful fire-safety insights for future human space exploration.' },
  { title: 'Harmonization of MODIS and VIIRS Hot Spots', level: 'ADVANCED · INTERMEDIATE', tags: 'Earth Science · Software', text: 'Build a web application that harmonizes active-fire hotspot records from MODIS and VIIRS into a consistent burning-activity calendar for emergency responders, scientists, and land managers.' },
  { title: 'Identify Earth Locations that Analog the Permanent Moon Base Locations and Mars', level: 'ADVANCED · INTERMEDIATE · BEGINNER / YOUTH', tags: 'Earth Science · Planets & Moons · Software · Space Exploration', text: 'Use open Earth, Moon, and Mars data to identify and characterize terrestrial analog locations that can help prepare for future lunar bases and Mars missions.' },
  { title: 'Interplanetary Survival Guide: Martian Map', level: 'INTERMEDIATE', tags: 'Human Exploration · Mars · Planets & Moons · Software · Space Exploration', text: 'Create a layered, integrated map of a Martian location or route using multiple NASA science missions to help future human explorers plan safe and scientifically useful Marswalks.' },
  { title: 'Planet X and SPHEREx', level: 'ADVANCED', tags: 'Astrophysics · Planets & Moons · Software', text: 'Create a public-facing web tool that displays SPHEREx sky images and makes it easy for people to compare how objects in the sky change over time across the mission’s repeated observations.' },
  { title: 'Space Mission Design Game', level: 'INTERMEDIATE · BEGINNER / YOUTH', tags: 'Games', text: 'Create an interactive game that lets users design, manage, and simulate a complete space mission while making engineering decisions about objectives, spacecraft, instruments, launch vehicles, budgets, power, mass, communications, and orbital constraints.' },
  { title: 'The Earth Information Jukebox', level: 'INTERMEDIATE · BEGINNER / YOUTH', tags: 'Arts & Multimedia · Earth Science · Software', text: 'Build an Earth Jukebox that translates Earth Information Center visual frames into dynamic sonifications, making Earth science more accessible, engaging, and multi-sensory.' },
] as const;




const additionalFaqs: [string, string][] = [

  ['Is registration free?', 'Yes. There is no registration fee for participants.'],

  ['Where and when is the event?', 'ASTROVERSE takes place on 14–16 November 2026 at Birla Institute of Applied Sciences, Bhimtal, Uttarakhand.'],

  ['What is the last date to register?', '20 November 2026 is the last date for registration.'],

  ['Can students from different institutions form one team?', 'No. All team members must belong to the same institution.'],

  ['Can we have a faculty mentor?', 'Yes. A faculty mentor is optional and can be added during registration.'],

  ['What information is required during registration?', 'You will need team details, institution details, team size, team leader details, and details for each team member.'],

  ['What happens after I submit my registration?', 'Your registration is validated, checked for duplicates, saved, and assigned a registration ID. QR and ID-card generation follow the successful registration flow.'],

  ['Will participants receive certificates?', 'Details about certificate eligibility will be updated soon.'],

  ['Are goodies provided to participants?', 'Details about event goodies will be updated soon.'],

  ['What should participants bring to the event?', 'The final participant checklist will be updated soon.'],

  ['Will food and accommodation be provided?', 'Details about food and accommodation will be updated soon.'],

  ['How will projects be evaluated?', 'The project evaluation criteria will be updated soon.'],

  ['Are awards or prizes part of the event?', 'Award and prize details will be updated soon.'],

];



const allFaqs: [string, string][] = Array.from(

  new Map(

    [...faqs, ...additionalFaqs].map(([question, answer]) => [

      question,

      [question, answer] as [string, string],

    ])

  ).values()

);



const scheduleForDisplay = schedule.map((day) => {

  if (day.day === '15') {

    return {

      ...day,

      stages: day.stages.filter((stage) => stage.title !== 'Closing & awards'),

    };

  }

  return day;

});



const closingDay = {

  day: '16',

  month: 'NOVEMBER',

  title: 'Close the mission. Celebrate the journey.',

  stages: [

    {

      label: 'CLOSING',

      title: 'Schedule closing',

      text: 'Final announcements, mission wrap-up, and the closing of the event.',

    },

    {

      label: 'CELEBRATE',

      title: 'Award celebration',

      text: 'Celebrate the teams, ideas, and achievements from the mission.',

    },

  ],

};



const displaySchedule = scheduleForDisplay.some((day) => day.day === '16')

  ? scheduleForDisplay

  : [...scheduleForDisplay, closingDay];







function Countdown() {







  const [remaining, setRemaining] = useState(







    Math.max(







      0,







      new Date(event.startsAt).getTime() - Date.now()







    )







  );







  useEffect(() => {







    const timer = setInterval(() => {







      setRemaining(







        Math.max(







          0,







          new Date(event.startsAt).getTime() - Date.now()







        )







      );







    }, 1000);







    return () => clearInterval(timer);







  }, []);







  const values = [







    Math.floor(remaining / 86400000),







    Math.floor(remaining / 3600000) % 24,







    Math.floor(remaining / 60000) % 60,







    Math.floor(remaining / 1000) % 60,







  ];







  return (







    <div className="countdown">







      <div className="countdown-label">







        <span className="live-dot" />







        {remaining







          ? 'COUNTDOWN TO LIFTOFF'







          : 'THE MISSION IS HERE'}







      </div>







      <div className="countdown-numbers">







        {values.map((value, index) => (







          <div key={index}>







            <strong>







              {String(value).padStart(2, '0')}







            </strong>







            <span>







              {[







                'DAYS',







                'HOURS',







                'MINUTES',







                'SECONDS',







              ][index]}







            </span>







            {index < 3 && <b>:</b>}







          </div>







        ))}







      </div>







    </div>







  );







}







function Hero() {







  const heroRef = useRef<HTMLElement>(null);







    const [registrationOpen, setRegistrationOpen] =
    useState<boolean | null>(null);

  const [typedText, setTypedText] = useState('');

  useEffect(() => {
    const text = 'CHALLENGE 2026';
    let index = 0;
    let deleting = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const type = () => {
      if (!deleting) {
        index += 1;
        setTypedText(text.slice(0, index));

        if (index === text.length) {
          deleting = true;
          timeoutId = setTimeout(type, 1500);
          return;
        }

        timeoutId = setTimeout(type, 72);
        return;
      }

      index -= 1;
      setTypedText(text.slice(0, index));

      if (index === 0) {
        deleting = false;
        timeoutId = setTimeout(type, 450);
        return;
      }

      timeoutId = setTimeout(type, 42);
    };

    timeoutId = setTimeout(type, 350);

    return () => clearTimeout(timeoutId);
  }, []);







  useEffect(() => {







    let active = true;







    api('/event')







      .then((data) => {







        if (active) {







          setRegistrationOpen(







            data.event?.registrationOpen ?? null







          );







        }







      })







      .catch(() => {});







    return () => {







      active = false;







    };







  }, []);







  const move = (







    event: ReactMouseEvent<HTMLElement>







  ) => {







    if (







      window.matchMedia(







        '(prefers-reduced-motion: reduce)'







      ).matches







    ) {







      return;







    }







    const rect =







      event.currentTarget.getBoundingClientRect();







    heroRef.current?.style.setProperty(







      '--px',







      `${(







        (event.clientX -







          rect.left -







          rect.width / 2) *







        0.009







      ).toFixed(2)}px`







    );







    heroRef.current?.style.setProperty(







      '--py',







      `${(







        (event.clientY -







          rect.top -







          rect.height / 2) *







        0.009







      ).toFixed(2)}px`







    );







  };







  return (







    <section







      className="hero"







      ref={heroRef}







      onMouseMove={move}







      onMouseLeave={() => {







        heroRef.current?.style.setProperty(







          '--px',







          '0px'







        );







        heroRef.current?.style.setProperty(







          '--py',







          '0px'







        );







      }}







    >







      {/* =====================================================







          HERO BACKGROUND







          The actual cinematic video is handled by Layout.tsx.







          This keeps the existing hero artwork and particles.







          Decorative orbit paths and planets have been removed.







          ===================================================== */}







      {/* =====================================================







          HERO CONTENT







          ===================================================== */}







      <div className="hero-content container">







        <div className="mission-pill">



          <span className="mission-date">



            <CalendarDays size={16} />



            <span>{EVENT_DATE_LABEL}</span>



          </span>







          <span className="pill-divider" />







          {registrationOpen === null







            ? 'JOIN THE MISSION'







            : registrationOpen







              ? 'REGISTRATION OPEN'







              : 'REGISTRATION CLOSED'}







        </div>







        {/* =================================================







            UPDATED HERO HEADING







            ================================================= */}







        <h1>







          NASA SPACE







          <br />







          APPS







          <br />







          <span className="typing-wrap" aria-label="CHALLENGE 2026">
            <span className="typing-title">{typedText}</span>
            <span className="typing-cursor" aria-hidden="true">|</span>
          </span>







        </h1>







        <div className="hero-description">







          <h3>



            Astroverse X Birla Institute of Applied Sciences



          </h3>







        </div>







        <div className="hero-buttons">







          <ArrowLink







            primary







            to="/register"







          >







            Register now







          </ArrowLink>







          <a

          className="button secondary"

          href="https://astroverse.in/"

          target="_blank"

          rel="noopener noreferrer"

          aria-label="Visit Astroverse official website"

        >

          Explore ASTROVERSE

          <ArrowUpRight size={17} />

        </a>







        </div>







        <a



          className="mission-host hero-launchpad"



          href="https://birlainstitute.co.in/"



          target="_blank"



          rel="noopener noreferrer"



          aria-label="Visit Birla Institute of Applied Sciences official website"



        >



          <div className="mission-host-mark" aria-hidden="true">



            <img



              src="/img/my-logo.png"



              alt="Birla Institute of Applied Sciences logo"



              width={54}



              height={54}



            />



          </div>



          <div>



            <span className="mono muted">OUR LAUNCHPAD</span>



            <strong>BIRLA INSTITUTE OF APPLIED SCIENCES</strong>



            <span>Bhimtal, Uttarakhand</span>



          </div>



          <ArrowUpRight size={20} />



        </a>







      </div>







      {/* =====================================================







          HERO NOTE







          ===================================================== */}







      {/* =====================================================







          SCROLL CUE







          ===================================================== */}







      <a







        className="scroll-cue"







        href="#about"







      >







        <ArrowDown size={16} />







        <span>







          SCROLL TO DISCOVER







        </span>







      </a>







    </section>







  );







}







function HomeGallerySlider() {

  const images = Array.from({ length: 20 }, (_, index) => {

    const number = String(index + 1).padStart(2, '0');

    return `/gallery/event-${number}.jpeg`;

  });

  const [activeIndex, setActiveIndex] = useState(0);

  const activeNumber = String(activeIndex + 1).padStart(2, '0');

  const previous = () => {

    setActiveIndex((current) => (current - 1 + images.length) % images.length);

  };

  const next = () => {

    setActiveIndex((current) => (current + 1) % images.length);

  };



  return (

    <section className="home-gallery section container" id="gallery-preview">

      <div className="home-gallery-heading">

        <div>

          <Eyebrow>THE PEOPLE. THE PROJECTS. THE POSSIBILITIES.</Eyebrow>

          <h2>A universe of memories.</h2>

          <p>Not just a hackathon. A community of minds that dare to ask “what if?”</p>

        </div>

      </div>



      <div className="home-gallery-slider">

        <div className="home-gallery-image">

          <OptimizedImage

            src={images[activeIndex]}

            alt={`NASA Space Apps Challenge event photo ${activeNumber}`}

          />

          <div className="home-gallery-image-meta">

            <span className="mono">EVENT ARCHIVE</span>

            <span className="mono">{activeNumber} / 20</span>

          </div>

        </div>



        <div className="home-gallery-info">

          <div className="home-gallery-copy">

            <span className="mono muted">NASA INTERNATIONAL SPACE APPS CHALLENGE</span>

            <strong>NASA SPACE APPS CHALLENGE 2026</strong>

            <p>Moments, people, ideas and memories from the Space Apps community.</p>

          </div>



          <div className="home-gallery-controls" aria-label="Gallery navigation">

            <button type="button" onClick={previous} aria-label="Previous gallery image">

              <ChevronLeft size={20} />

            </button>

            <span className="home-gallery-counter">

              <b>{activeNumber}</b>

              <span>/ 20</span>

            </span>

            <button type="button" onClick={next} aria-label="Next gallery image">

              <ChevronRight size={20} />

            </button>

          </div>

        </div>

      </div>

    </section>

  );

}



export function Home() {







  return (







    <>







      <Hero />







      <div className="mission-strip container">







        <Countdown />







      </div>







      <div className="mission-facts container">







        {[







          [Rocket, '03', 'DAYS OF DISCOVERY'],







          [Users, '4–6', 'SKILLS. ONE TEAM.'],







          [







            Globe2,







            'OPEN',







            'DATA. REAL CHALLENGES.',







          ],







          [







            Orbit,







            '∞',







            'IMAGINATION. ENGINEERED.',







          ],







        ].map(







          ([Icon, value, label], index) => {







            const FactIcon =







              Icon as typeof Rocket;







            return (







              <div key={index}>







                <FactIcon size={23} />







                <strong>







                  {String(value)}







                </strong>







                <span>







                  {String(label)}







                </span>







              </div>







            );







          }







        )}







      </div>







      <HighlightsSection />







      <HomeGallerySlider />

<ScheduleSection preview />







      <FAQSection preview />







    </>







  );







}







export function AboutSection() {







  return (







    <section







      id="about"







      className="about-section section container"







    >







      <div className="about-images">







        <div className="photo-frame">







          <OptimizedImage







            src="/gallery/event-03.jpeg"







            alt="Space Apps participants celebrating their projects"







          />







        </div>







        <div className="photo-inset">







          <OptimizedImage







            src="/gallery/event-11.jpeg"







            alt="Participants collaborating on real projects"







          />







        </div>







        <div className="image-stamp">







          <Orbit size={30} />







          <span>







            CURIOUS MINDS.







            <br />







            EXTRAORDINARY IDEAS.







          </span>







        </div>







        <span className="image-crosshair">







          +







        </span>







      </div>







      <div className="about-copy">







        <Eyebrow>







          WELCOME TO ASTROVERSE







        </Eyebrow>







        <h2>







          DOWN TO EARTH.







          <br />







          <span className="serif-accent">







            Looking beyond.







          </span>







        </h2>







        <p>







          Some of the biggest discoveries begin







          with a simple question. At ASTROVERSE,







          we give that curiosity a place to take off.







        </p>







        <p>







          Join the NASA International Space Apps







          Challenge 2026 at Birla Institute of







          Applied Sciences, Bhimtal. Work with open







          data, connect with different minds, and







          turn a real-world challenge into something







          remarkable.







        </p>







        <div className="about-values">







          <span>







            <Sparkles size={15} />







            No idea too ambitious







          </span>







          <span>







            <Users size={15} />







            Every perspective matters







          </span>







        </div>







        <ArrowLink to="/space-apps">







          Meet the mission







        </ArrowLink>







      </div>







    </section>







  );







}







const highlights = [

  {

    icon: Trophy,

    title: 'CERTIFICATION',

    subtitle: 'Participation & recognition',

    text: 'Celebrate your participation with recognition for being part of the NASA Space Apps Challenge journey.',

    tag: '01 / RECOGNITION',

  },

  {

    icon: Sparkles,

    title: 'GOODIES',

    subtitle: 'Event perks & keepsakes',

    text: 'Take home a few special memories from the event and make your Space Apps experience even more memorable.',

    tag: '02 / PERKS',

  },

  {

    icon: Orbit,

    title: 'FOLLOW YOUR CURIOSITY',

    subtitle: 'Space science & exploration',

    text: 'Explore new ideas, connect the dots, and turn your curiosity about space and technology into something real.',

    tag: '03 / EXPLORE',

  },

  {

    icon: Network,

    title: 'CONNECT & COMMUNICATE',

    subtitle: 'Teamwork & networking',

    text: 'Share ideas, communicate clearly, meet new people, and build connections that continue beyond the event.',

    tag: '04 / CONNECT',

  },

];







export function HighlightsSection() {







  return (







    <section







      className="highlights-section section container"







      id="experience"







    >







      <SectionTitle







        label="MORE THAN A HACKATHON"







        title="Three days. A whole new perspective."







      >







        <ArrowLink to="/why-participate">







          Why participate?







        </ArrowLink>







      </SectionTitle>







      <div className="highlight-grid">







        {highlights.map((item) => (







          <article







            className="highlight-card"







            key={item.title}







          >







            <div className="highlight-top">







              <item.icon







                size={29}







                strokeWidth={1.5}







              />







              <span>







                {item.tag}







              </span>







            </div>







            <span className="highlight-subtitle">







              {item.subtitle}







            </span>







            <h3>







              {item.title}







            </h3>







            <p>







              {item.text}







            </p>







          </article>







        ))}







      </div>







        </section>







  );







}







export function ScheduleSection({







  preview = false,







}: {







  preview?: boolean;







}) {







  return (







    <section className="schedule-section section container">







      <SectionTitle







        label="YOUR FLIGHT PLAN"







        title="From “what if” to what’s next."







      >







        {preview && (







          <ArrowLink to="/schedule">







            Full event schedule







          </ArrowLink>







        )}







      </SectionTitle>







      <div className="schedule-grid">







        {displaySchedule.map((day, index) => (







          <article







            className="day-card"







            key={day.day}







          >







            <header>







              <div className="day-date">







                <strong>







                  {day.day}







                </strong>







                <span>







                  {day.month}







                  <br />







                  2026







                </span>







              </div>







              <span className="mono muted">







                DAY {String(index + 1).padStart(2, '0')}







              </span>







            </header>







            <h3>







              {day.title}







            </h3>







            <div className="timeline">







              {day.stages.map(







                (stage, index) => (







                  <div







                    className="timeline-item"







                    key={stage.title}







                  >







                    <span className="timeline-dot" />







                    <span className="mono timeline-label">







                      {stage.label}







                    </span>







                    <h4>







                      {stage.title}







                    </h4>







                    {!preview && (







                      <p>







                        {stage.text}







                      </p>







                    )}







                    <span className="timeline-number">







                      0{index + 1}







                    </span>







                  </div>







                )







              )}







            </div>







          </article>







        ))}







      </div>







      <p className="schedule-note">







        <CalendarDays size={14} />







        Sequence shown for planning. Final session







        times will be confirmed by the organizers.







      </p>







    </section>







  );







}







export function FAQSection({







  preview = false,







}: {







  preview?: boolean;







}) {







  const [open, setOpen] =







    useState<number | null>(0);







  return (







    <section className="faq-section section container">







      <div className="faq-heading">







        <Eyebrow>







          BEFORE YOU BLAST OFF







        </Eyebrow>







        <h2>







          GOT QUESTIONS?







          <br />







          <span className="serif-accent">







            We’ve got you.







          </span>







        </h2>







        <p>







          Your mission briefing, minus the jargon.







        </p>







        {preview && (







          <ArrowLink to="/faq">







            All FAQs







          </ArrowLink>







        )}







        <Link







          className="text-link"







          to="/contact"







        >







          Venue & contact







          <ArrowUpRight size={15} />







        </Link>







      </div>







      <div className="faq-list">







        {(preview

          ? allFaqs.slice(0, 8)

          : allFaqs

        ).map(







          ([question, answer], index) => (







            <div







              className={`faq-item ${







                open === index







                  ? 'expanded'







                  : ''







              }`}







              key={question}







            >







              <button







                type="button"







                aria-expanded={







                  open === index







                }







                aria-controls={`faq-answer-${index}`}







                onClick={() =>







                  setOpen(







                    open === index







                      ? null







                      : index







                  )







                }







              >







                <span className="faq-number">







                  {String(index + 1).padStart(







                    2,







                    '0'







                  )}







                </span>







                <span>







                  {question}







                </span>







                {open === index ? (







                  <Minus size={18} />







                ) : (







                  <Plus size={18} />







                )}







              </button>







              <div







                id={`faq-answer-${index}`}







                hidden={open !== index}







              >







                <p>







                  {answer}







                </p>







              </div>







            </div>







          )







        )}







      </div>







    </section>







  );







}







export function PublicPage({







  type,







}: {







  type: string;







}) {







  if (type === 'schedule') {







    return (







      <div className="page">







        <PageIntro







          label={EVENT_DATE_RANGE}







          title="THE MISSION PLAN."







          text={EVENT_DURATION_COPY}







        />







        <ScheduleSection />







      </div>







    );







  }







  if (type === 'faq') {







    return (







      <div className="page">







        <PageIntro







          label="YOUR PRE-LAUNCH BRIEFING"







          title="BEFORE THE COUNTDOWN."







          text="The practical details, from assembling your team to verifying your registration."







        />







        <FAQSection />







      </div>







    );







  }







  if (type === 'highlights') {







    return (







      <div className="page">







        <PageIntro







          label="THE ASTROVERSE EXPERIENCE"







          title="A LITTLE SPACE. A LOT OF POSSIBILITY."







          text="Hackathons, workshops, open data, and a room full of people who see the world differently."







        />







        <HighlightsSection />







        <Gallery preview />







      </div>







    );







  }







  if (type === 'about') {







    return (







      <div className="page">







        <PageIntro







          label="THIS IS ASTROVERSE"







          title="WHERE CURIOUS MINDS FIND THEIR ORBIT."







          text="An event built around one belief: extraordinary things happen when different perspectives work together."







        />







        <AboutSection />







        <HighlightsSection />







      </div>







    );







  }







  if (type === 'space-apps') {
    return (
      <div className="page problem-statements-page">
        <PageIntro
          label="NASA INTERNATIONAL SPACE APPS CHALLENGE 2026"
          title="CHOOSE YOUR CHALLENGE."
          text="NASA has released 14 official 2026 challenges. Explore the challenge summaries below, find the problem that fits your team, and open the official NASA challenge hub for the full statements and resources."
        />
        <section className="challenge-intro container section">
          <div>
            <Eyebrow>THE NEXT FRONTIER</Eyebrow>
            <h2>14 PROBLEMS.<br /><span className="serif-accent">Countless ways to solve them.</span></h2>
          </div>
          <div className="challenge-intro-copy">
            <p>These are the official 2026 challenge summaries published for NASA Space Apps. Teams can approach them through software, science, design, games, storytelling, data analysis, or combinations of disciplines.</p>
            <a className="button primary" href="https://www.spaceappschallenge.org/2026/challenges/" target="_blank" rel="noopener noreferrer">Open official NASA challenges <ArrowUpRight size={17} /></a>
          </div>
        </section>
        <section className="challenge-grid container" aria-label="NASA Space Apps Challenge 2026 problem statements">
          {challengeStatements.map((challenge, index) => (
            <article className="challenge-card" key={challenge.title}>
              <div className="challenge-card-top">
                <span className="challenge-number">{String(index + 1).padStart(2, '0')}</span>
                <span className="mono challenge-level">{challenge.level}</span>
              </div>
              <h3>{challenge.title}</h3>
              <p className="challenge-tags">{challenge.tags}</p>
              <p>{challenge.text}</p>
            </article>
          ))}
        </section>
        <section className="challenge-footer container section">
          <div>
            <Eyebrow>BUILD DURING THE HACKATHON</Eyebrow>
            <h2>READ THE FULL BRIEF.<br /><span className="serif-accent">Then build what comes next.</span></h2>
            <p>NASA Space Apps publishes the full challenge statements and their resources on the official platform. Use the summaries here to shortlist a direction, then open the official source for the complete brief.</p>
          </div>
          <a className="button secondary" href="https://www.spaceappschallenge.org/2026/challenges/" target="_blank" rel="noopener noreferrer">View full challenge resources <ArrowUpRight size={17} /></a>
        </section>
      </div>
    );
  }

  if (type === 'why-participate') {







    return (







      <div className="page">







        <PageIntro







          label="YOUR NEXT CHAPTER"







          title="COME CURIOUS. LEAVE CHANGED."







          text="You don’t have to know all the answers. You just have to be ready to explore them."







        />







        <div className="benefit-grid container section">







          {[







            [







              Lightbulb,







              'Ideas with purpose',







              'Apply creativity to real-world problems, from Earth’s environment to life in space.',







            ],







            [







              Code2,







              'Experience that stays with you',







              'Explore NASA data, develop technical skills, and add a meaningful project to your portfolio.',







            ],







            [







              Network,







              'A bigger circle',







              'Meet collaborators, exchange perspectives, and build your network.',







            ],







            [







              GraduationCap,







              'Learning by doing',







              'Find mentorship, join workshops, and discover tools you might never have tried.',







            ],







            [







              Mic2,







              'A platform for your ideas',







              'Present your project, tell its story, and practice explaining what makes it matter.',







            ],







            [







              Trophy,







              'The joy of building together',







              'Challenge yourself and create something as a team that you couldn’t have made alone.',







            ],







          ].map(







            ([Icon, title, text], index) => {







              const BenefitIcon =







                Icon as typeof Lightbulb;







              return (







                <article key={index}>







                  <BenefitIcon />







                  <span className="mono">







                    0{index + 1}







                  </span>







                  <h3>







                    {String(title)}







                  </h3>







                  <p>







                    {String(text)}







                  </p>







                </article>







              );







            }







          )}







        </div>







      </div>







    );







  }







  if (type === 'contact') {







    return (







      <div className="page">







        <PageIntro







          label=""







          title="SEE YOU IN BHIMTAL."







          text="Big ideas. Mountain air. A space to build something extraordinary."







        />







        <div className="contact-grid container section">







          <div>







            <Eyebrow>







              THE VENUE







            </Eyebrow>







            <h2>







              Birla Institute of







              <br />







              Applied Sciences







            </h2>







            <p>







              Bhimtal, Uttarakhand, India







            </p>







            <div className="contact-line">







              <CalendarDays />







              {event.dates}







            </div>







            <div className="contact-line">







              <MapPin />







              BIAS, Bhimtal







            </div>







            <a







              className="button secondary"







              href="https://www.google.com/maps/search/?api=1&query=Birla+Institute+of+Applied+Sciences+Bhimtal"







              target="_blank"







              rel="noreferrer"







            >







              Get directions







              <ArrowUpRight size={16} />







            </a>







            <p className="muted small">







              Organizer contact and social channels







              will be published here once confirmed.







              No unverified contact information is listed.







            </p>







          </div>







          <div className="contact-photo">







            <OptimizedImage







              src="/gallery/event-16.jpeg"







              alt="The event community gathered at the campus"







            />







            <span>







              YOUR IDEAS HAVE A HOME HERE.







            </span>







          </div>







        </div>







        <FAQSection preview />







      </div>







    );







  }







  if (type === 'media') {







    return (







      <div className="page">







        <PageIntro







          label="STORIES FROM THE LAUNCHPAD"







          title="BEHIND THE BIG IDEAS."







          text="The people, prototypes, and moments that make ASTROVERSE more than an event."







        />







        <div className="container section media-grid">







          {videos.length ? (







            videos.map((video) => (







              <article







                className="media-card"







                key={video.source}







              >







                {video.type === 'youtube' ? (







                  <iframe







                    src={`https://www.youtube-nocookie.com/embed/${video.source}`}







                    title={video.title}







                    loading="lazy"







                    allow="fullscreen; encrypted-media; picture-in-picture"







                    allowFullScreen







                  />







                ) : (







                  <video







                    src={video.source}







                    controls







                    preload="metadata"







                  />







                )}







                <h3>







                  {video.title}







                </h3>







              </article>







            ))







          ) : (







            <>







              <article className="media-story">







                <OptimizedImage







                  src="/gallery/event-19.jpeg"







                  alt="An event speaker sharing a science demonstration"







                />







                <div>







                  <span className="mono muted">







                    FROM THE EVENT ARCHIVE







                  </span>







                  <h3>







                    Every question starts a story.







                  </h3>







                  <p>







                    Ideas take the stage,







                    conversations spark,







                    and a new perspective begins.







                  </p>







                  <ArrowLink to="/gallery">







                    Discover the moments







                  </ArrowLink>







                </div>







              </article>







              <article className="media-story">







                <OptimizedImage







                  src="/gallery/event-17.jpeg"







                  alt="A real participant-built robotic prototype"







                />







                <div>







                  <span className="mono muted">







                    BUILDING WHAT COMES NEXT







                  </span>







                  <h3>







                    From open data to real prototypes.







                  </h3>







                  <p>







                    Official event films will be shared







                    when released. Until then, explore







                    the real event photo archive.







                  </p>







                  <ArrowLink to="/gallery">







                    Explore all 20 photos







                  </ArrowLink>







                </div>







              </article>







            </>







          )}







        </div>







      </div>







    );







  }







  return (







    <div className="page narrow">







      <Eyebrow>







        YOUR INFORMATION MATTERS







      </Eyebrow>







      <h1 className="page-title">







        PRIVACY & DECLARATION







      </h1>







      <div className="prose">







        <h2>







          Registration information







        </h2>







        <p>







          We collect team names, participant names,







          emails, mobile numbers, institutions, roles,







          optional ages, and optional mentor details







          to administer ASTROVERSE, review registrations,







          communicate event updates, and verify event access.







        </p>







        <h2>







          Access & verification







        </h2>







        <p>







          Your signed-in team members and authorized







          organizers can access team details. Public QR







          verification shows only the registration ID,







          team name, institution, size, status, and







          check-in state. It does not reveal participant







          emails or phone numbers.







        </p>







        <h2>







          Your declaration







        </h2>







        <p>







          By registering, you confirm that the information







          is accurate and that every member has agreed to







          share their details for event administration.







          For any member under 18, the team leader must







          confirm guardian consent. A submitted registration







          is pending until organizers approve it.







        </p>







        <h2>







          Corrections & deletion







        </h2>







        <p>







          Ask an authorized event organizer at Birla







          Institute of Applied Sciences for corrections,







          access, or deletion requests. Confirmed contact







          channels will be published on the contact page.







          Organizer exports are restricted to authenticated







          admin accounts.







        </p>







        <h2>







          Website storage







        </h2>







        <p>







          Authentication uses session storage and cookies







          provided by Netlify Identity. Registration records







          are stored in a managed PostgreSQL database.







          No payment information is collected by this site.







        </p>







      </div>







    </div>







  );







}







export function PageIntro({







  label,







  title,







  text,







}: {







  label: string;







  title: string;







  text: string;







}) {







  return (







    <div className="page-intro container">







      <Eyebrow>







        {label}







      </Eyebrow>







      <h1 className="page-title">







        {title}







      </h1>







      <p>







        {text}







      </p>







    </div>







  );







}