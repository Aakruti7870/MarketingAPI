import React from 'react';
import { PublicNavbar, PublicFooter } from '../components/PublicNav';
import { Card, Button } from '../components/ui';

export function LoginPage() {
  return (
    <div>
      <PublicNavbar />
      <div className="max-w-md mx-auto py-12"><Card><h1 className="text-xl font-bold">Log In</h1></Card></div>
      <PublicFooter />
    </div>
  );
}

export function RegisterPage() {
  return (
    <div>
      <PublicNavbar />
      <div className="max-w-md mx-auto py-12"><Card><h1 className="text-xl font-bold">Register</h1></Card></div>
      <PublicFooter />
    </div>
  );
}
