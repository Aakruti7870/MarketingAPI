import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PublicNavbar, PublicFooter } from '../components/PublicNav';
import { Button, Card, Badge } from '../components/ui';

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PublicNavbar />
      <section className="pt-16 pb-20 px-6 max-w-7xl mx-auto text-center space-y-6">
        <h1 className="text-4xl font-black text-slate-900">Turn Local Prospects into Closed Deals</h1>
        <Button variant="primary" size="lg" onClick={() => navigate('/register')}>Start Free Trial</Button>
      </section>
      <PublicFooter />
    </div>
  );
}
