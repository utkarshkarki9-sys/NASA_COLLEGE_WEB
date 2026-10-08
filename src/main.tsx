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
    const pageNames: Record<string, string> = { about: 'About', gallery: 'Gallery', schedule: 'Schedule', faq: 'FAQs', quiz: 'Space Questions', register: 'Register', login: 'Log In', dashboard: 'Participant Dashboard', admin: 'Mission Control', verify: 'Verify Registration', contact: 'Contact', media: 'Media', highlights: 'Experience', 'space-apps': 'NASA Space Apps', 'why-participate': 'Why Participate', privacy: 'Privacy' };
    const label = pageNames[location.pathname.split('/')[1]];
    document.title = label ? `${label} — ${siteName}` : `${siteName} — NASA International Space Apps Challenge 2026`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', siteDescription);
    document.querySelector('meta[property="og:site_name"]')?.setAttribute('content', siteName);
    const observer = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('in-view'); observer.unobserve(entry.target); } }); }, { threshold: .08 });
    document.querySelectorAll('.section, .gallery-section, .quiz-promo').forEach(element => { element.classList.add('reveal'); observer.observe(element); });
    return () => observer.disconnect();
  }, [location.pathname]);
  return <Suspense fallback={<Loading text="Opening the next chapter…" />}><Routes><Route element={<Layout />}><Route index element={<Home />} />{['about', 'space-apps', 'highlights', 'why-participate', 'schedule', 'faq', 'contact', 'media', 'privacy'].map(type => <Route key={type} path={type} element={<PublicPage type={type} />} />)}<Route path="gallery" element={<Gallery />} /><Route path="quiz" element={<Quiz />} /><Route path="questions" element={<Quiz />} /><Route path="register" element={<Register />} /><Route path="login" element={<Login />} /><Route path="dashboard" element={<Protected><Dashboard /></Protected>} /><Route path="verify" element={<Verify />} /><Route path="verify/:token" element={<Verify />} /><Route path="admin/login" element={<Login admin />} />{['admin', 'admin/participants', 'admin/teams', 'admin/reports', 'admin/gallery', 'admin/registrations/:id'].map(path => <Route key={path} path={path} element={<Protected admin><Admin /></Protected>} />)}<Route path="admin/verification" element={<Protected admin><Verify /></Protected>} /><Route path="*" element={<div className="page narrow empty-state"><Eyebrow>A LITTLE OFF ORBIT</Eyebrow><h1 className="page-title">THIS SPACE IS<br />UNEXPLORED.</h1><p>The page you’re looking for doesn’t exist.</p><Link className="button primary" to="/">Back to Earth</Link></div>} /></Route></Routes></Suspense>;
}
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><BrowserRouter><AuthProvider><App /></AuthProvider></BrowserRouter></React.StrictMode>);
