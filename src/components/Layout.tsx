import { useEffect, useRef, useState } from 'react';

import {

  Link,

  NavLink,

  Outlet,

  useLocation,

  useNavigate,

} from 'react-router-dom';

import {

  ArrowUpRight,

  Menu,

  X,

  LogOut,

  ArrowRight,

} from 'lucide-react';

import { logout } from '@netlify/identity';

import { useAuth } from './Auth';

import { event } from '../data';

export default function Layout() {

  const [open, setOpen] = useState(false);

  const errorRedirected = useRef(false);

  const { user, callback, clearCallback, error } = useAuth();

  const location = useLocation();

  const navigate = useNavigate();

  // Hero video is shown only on the Home page

  const isHomePage = location.pathname === '/';

  useEffect(() => {

    setOpen(false);

    if (location.hash) {

      const timer = setTimeout(() => {

        try {

          document

            .getElementById(

              decodeURIComponent(location.hash.slice(1))

            )

            ?.scrollIntoView({

              behavior: 'smooth',

            });

        } catch {}

      }, 100);

      return () => clearTimeout(timer);

    } else {

      window.scrollTo(0, 0);

    }

  }, [location.pathname, location.hash]);

  useEffect(() => {

    if (callback === 'recovery' || callback === 'invite') {

      navigate('/login', { replace: true });

    } else if (callback === 'confirmation' && user) {

      clearCallback();

      navigate('/register', { replace: true });

    } else if (

      error &&

      !errorRedirected.current

    ) {

      errorRedirected.current = true;

      navigate('/login', { replace: true });

    }

  }, [

    callback,

    user,

    navigate,

    error,

    clearCallback,

  ]);
  return (

    <>

      {/* ACCESSIBILITY */}

      <a

        className="skip-link"

        href="#main"

      >

        Skip to content

      </a>
{/* =====================================================

          HOME HERO VIDEO

          ===================================================== */}

      {isHomePage && (

        <div

          className="home-hero-video"

          aria-hidden="true"

        >

          <video

            autoPlay

            muted

            loop

            playsInline

            preload="auto"

          >

            <source

              src="/video/hero.mp4"

              type="video/mp4"

            />

          </video>

          {/* Dark cinematic layer */}

          <div className="home-hero-overlay" />

          {/* Bottom transition into website */}

          <div className="home-hero-bottom-fade" />

        </div>

      )}

      {/* =====================================================

          NAVIGATION

          ===================================================== */}

      <header className="site-header">

        <div className="nav-wrap">

          <Link

            to="/"

            className="brand"

            aria-label="ASTROVERSE home"

          >

            <img
              src="/img/astroverse-logo.svg"
              alt="ASTROVERSE"
            />
            <span className="site-brand-name">NASA SPACE APPS CHALLENGE 2026</span>

          </Link>

          <nav

            className={

              open

                ? 'nav open'

                : 'nav'

            }

            id="primary-navigation"

            aria-label="Main navigation"

          >

            {[

              ['/', 'Home'],

              ['/about', 'About'],

              ['/space-apps', 'Challenges'],

              ['/highlights', 'Experience'],

              ['/gallery', 'Gallery'],

              ['/schedule', 'Schedule'],

              ['/faq', 'FAQs'],

              [user?.roles?.includes('admin') ? '/admin' : '/admin/login', user?.roles?.includes('admin') ? 'Mission control' : 'Organizer'],

            ].map(([path, label]) => (

              <NavLink

                key={path}

                to={path}

                end={path === '/'}

              >

                {label}

              </NavLink>

            ))}

          </nav>

          <div className="nav-actions">

            <Link

              className="login-link"

              to={

                user

                  ? '/dashboard'

                  : '/login'

              }

            >

              {user

                ? 'Dashboard'

                : 'Log in'}

              <ArrowUpRight

                size={14}

              />

            </Link>

            <Link

              className="button primary nav-register"

              to="/register"

            >

              Register now

              <ArrowUpRight

                size={15}

              />

            </Link>

            <button

              className="menu-button icon-button"

              aria-label={

                open

                  ? 'Close navigation'

                  : 'Open navigation'

              }

              aria-expanded={open}

              aria-controls="primary-navigation"

              type="button"

              onClick={() =>

                setOpen(!open)

              }

            >

              {open ? (

                <X />

              ) : (

                <Menu />

              )}

            </button>

          </div>

        </div>

      </header>

      {/* =====================================================

          PAGE CONTENT

          ===================================================== */}

      <main id="main">

        <Outlet />

      </main>

      {/* =====================================================

          FINAL CTA

          ===================================================== */}

      <section className="final-call container">

        <div>

          <EyebrowLocal />

          <h2>

            THE NEXT BIG IDEA

            <br />

            COULD BE YOURS.

          </h2>

          <p>

            Bring your curiosity.

            Find your crew.

            Build what comes next.

          </p>

        </div>

        <Link

          to="/register"

          className="button primary"

        >

          Join the mission

          <ArrowUpRight

            size={19}

          />

        </Link>

        <span

          className="call-orbit"

          aria-hidden="true"

        />

      </section>

      {/* =====================================================

          FOOTER

          ===================================================== */}

      <footer className="site-footer container">

        <div className="footer-top">

          <div className="footer-brand">

            <img

              src="/img/astroverse-logo.svg"

              alt="ASTROVERSE"

            />

            <p>

              {event.name}

            </p>

            <span>

              A little curiosity can

              change a whole planet.

            </span>

          </div>

          <div>

            <span className="footer-label">

              EXPLORE

            </span>

            <Link to="/about">

              About ASTROVERSE

            </Link>

            <Link to="/space-apps">

              NASA Space Apps

            </Link>

            <Link to="/gallery">

              The gallery

            </Link>

            <Link to="/media">

              Videos & media

            </Link>

            <a href="/download.html">

              Download project ZIP

            </a>

          </div>

          <div>

            <span className="footer-label">

              YOUR MISSION

            </span>

            <Link to="/register">

              Registration

            </Link>

            <Link to="/quiz">

              Space questions

            </Link>

            <Link to="/verify">

              Verify an ID

            </Link>

            <Link to="/contact">

              Contact & venue

            </Link>

          </div>

          <div className="footer-venue">

            <span className="footer-label">

              HOSTED AT

            </span>

            <p>

              Birla Institute of Applied Sciences

              <br />

              Bhimtal, Uttarakhand

            </p>

            <span>

              14–16 NOVEMBER 2026

            </span>

          </div>

        </div>

        <div className="footer-bottom">

          <span>

            © 2026 ASTROVERSE.

            Made for the curious.

          </span>

          <div>
<Link to="/privacy">

              Privacy & declaration

            </Link>

            <Link to={user?.roles?.includes('admin') ? '/admin' : '/admin/login'}>

              {user?.roles?.includes('admin') ? 'Mission control' : 'Organizer access'}

              <ArrowRight

                size={12}

              />

            </Link>

            {user && (

              <button

                onClick={async () => {

                  await logout();

                  navigate('/');

                }}

              >

                Sign out

                <LogOut

                  size={12}

                />

              </button>

            )}

          </div>

        </div>

      </footer>

    </>

  );

}

function EyebrowLocal() {

  return (

    <div className="eyebrow">

      <span />

      YOUR COUNTDOWN TO DISCOVERY

    </div>

  );

}





