import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background -z-10 pointer-events-none" />
      
      <div className="container px-4 md:px-6 flex flex-col items-center text-center space-y-8 mt-12 mb-24">
        <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
          Kognit is now in public beta
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground max-w-4xl leading-tight">
          Align your teams. <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
            Ship products faster.
          </span>
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl">
          The modern platform for product managers to organize features, prioritize tasks, and align engineering teams without the chaos.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4">
          <Link href="/register">
            <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 rounded-full shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
              Start building for free
            </Button>
          </Link>
          <Link href="#demo">
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 rounded-full border-border/60 hover:bg-muted">
              Book a demo
            </Button>
          </Link>
        </div>
        
        {/* Placeholder for App Mockup */}
        <div className="w-full max-w-5xl mt-16 aspect-video rounded-xl border border-border/50 bg-card/50 shadow-2xl overflow-hidden relative backdrop-blur-sm flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
          <p className="text-muted-foreground font-medium z-10 text-lg">Platform Dashboard Preview</p>
        </div>
      </div>
    </div>
  );
}
