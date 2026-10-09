import React, { Suspense, lazy, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import Layout from './components/Layout';
import { AuthProvider, Protected } from './components/Auth';
import { Loading, Eyebrow } from './components/UI';
import { Home, PublicPage } from './pages/Public';
import { siteName, siteDescription } from './data';
import './styles.css';
const Gallery = lazy(() => import('./components/Gallery'));
const Quiz = lazy(() => import('./pages/Quiz'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Verify = lazy(() => import('./pages/Verify'));
const Admin = lazy(() => import('./pages/Admin'));
function App() {
  const location = useLocation();
  useEffect(() => {
    const pageMeta: Record<string, { title: string; description: string }> = {
      about: { title: 'About', description: 'Meet ASTROVERSE, the community gathering curious minds for NASA Space Apps Challenge 2026 in Bhimtal.' },
      gallery: { title: 'Gallery', description: 'Explore real event photographs from the ASTROVERSE community and its moments of discovery.' },
      schedule: { title: 'Schedule', description: 'Explore the ASTROVERSE event schedule for 14–16 November 2026 in Bhimtal, Uttarakhand.' },
      faq: { title: 'FAQs', description: 'Find answers about ASTROVERSE, team registration, event dates, venue, and participation.' },
      quiz: { title: 'Space Questions', description: 'Test your space knowledge with the ASTROVERSE interactive space quiz.' },
      questions: { title: 'Space Questions', description: 'Test your space knowledge with the ASTROVERSE interactive space quiz.' },
      register: { title: 'Register', description: 'Create your account and register a team of 4–6 for ASTROVERSE.' },
      login: { title: 'Log In', description: 'Access your ASTROVERSE account and participant dashboard.' },
      dashboard: { title: 'Participant Dashboard', description: 'Review your ASTROVERSE team registration and event ID.' },
      admin: { title: 'Mission Control', description: 'Authorized organizer tools for ASTROVERSE event operations.' },
      verify: { title: 'Verify Registration', description: 'Check an ASTROVERSE registration using its secure QR verification reference.' },
      contact: { title: 'Contact', description: 'Find venue and contact information for ASTROVERSE at Birla Institute of Applied Sciences, Bhimtal.' },
      media: { title: 'Media', description: 'Explore media and real event stories from the ASTROVERSE community.' },
      highlights: { title: 'Experience', description: 'Discover the collaborative experience, workshops, and project building at ASTROVERSE.' },
      'space-apps': { title: 'NASA Space Apps Challenges', description: 'Explore NASA Space Apps Challenge statements and find a direction for your ASTROVERSE team.' },
      'why-participate': { title: 'Why Participate', description: 'Discover what makes collaborative problem solving with open data a worthwhile experience.' },
      privacy: { title: 'Privacy', description: 'Read how ASTROVERSE registration information is used and protected.' },
    };
    const segment = location.pathname.split('/')[1] || '';
    const page = pageMeta[segment];
    const title = page ? `${page.title} — ${siteName}` : `${siteName} — NASA International Space Apps Challenge 2026`;
    const description = page?.description ?? siteDescription;
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    document.querySelector('meta[property="og:site_name"]')?.setAttribute('content', siteName);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);

    const revealTargets = Array.from(document.querySelectorAll('.section, .gallery-section, .quiz-promo'));
    if (!('IntersectionObserver' in window)) {
      revealTargets.forEach(element => element.classList.add('in-view'));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .08 });
    revealTargets.forEach(element => {
      element.classList.add('reveal');
      observer.observe(element);
    });
    return () => observer.disconnect();
  }, [location.pathname]);
  return <Suspense fallback={<Loading text="Opening the next chapter…" />}><Routes><Route element={<Layout />}><Route index element={<Home />} />{['about', 'space-apps', 'highlights', 'why-participate', 'schedule', 'faq', 'contact', 'media', 'privacy'].map(type => <Route key={type} path={type} element={<PublicPage type={type} />} />)}<Route path="gallery" element={<Gallery />} /><Route path="quiz" element={<Quiz />} /><Route path="questions" element={<Quiz />} /><Route path="register" element={<Register />} /><Route path="login" element={<Login />} /><Route path="dashboard" element={<Protected><Dashboard /></Protected>} /><Route path="verify" element={<Verify />} /><Route path="verify/:token" element={<Verify />} /><Route path="admin/login" element={<Login admin />} />{['admin', 'admin/participants', 'admin/teams', 'admin/reports', 'admin/gallery', 'admin/registrations/:id'].map(path => <Route key={path} path={path} element={<Protected admin><Admin /></Protected>} />)}<Route path="admin/verification" element={<Protected admin><Verify /></Protected>} /><Route path="*" element={<div className="page narrow empty-state"><Eyebrow>A LITTLE OFF ORBIT</Eyebrow><h1 className="page-title">THIS SPACE IS<br />UNEXPLORED.</h1><p>The page you’re looking for doesn’t exist.</p><Link className="button primary" to="/">Back to Earth</Link></div>} /></Route></Routes></Suspense>;
}
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><BrowserRouter><AuthProvider><App /></AuthProvider></BrowserRouter></React.StrictMode>);
