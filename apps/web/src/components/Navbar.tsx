"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-slate-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent">
              Alunyte
            </span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/features"
              className="text-slate-700 hover:text-sky-600 transition-colors"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="text-slate-700 hover:text-sky-600 transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/docs"
              className="text-slate-700 hover:text-sky-600 transition-colors"
            >
              Docs
            </Link>
            <Link
              href="/about"
              className="text-slate-700 hover:text-sky-600 transition-colors"
            >
              About
            </Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/login"
              className="text-slate-700 hover:text-sky-600 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-white font-medium transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg text-slate-700 hover:text-sky-600 hover:bg-slate-100 transition-colors"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile navigation */}
        {open && (
          <div className="md:hidden py-4 border-t border-slate-200 bg-white">
            <div className="flex flex-col space-y-4">
              <Link
                href="/features"
                className="text-slate-700 hover:text-sky-600 transition-colors py-2"
                onClick={() => setOpen(false)}
              >
                Features
              </Link>
              <Link
                href="/pricing"
                className="text-slate-700 hover:text-sky-600 transition-colors py-2"
                onClick={() => setOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/docs"
                className="text-slate-700 hover:text-sky-600 transition-colors py-2"
                onClick={() => setOpen(false)}
              >
                Docs
              </Link>
              <Link
                href="/about"
                className="text-slate-700 hover:text-sky-600 transition-colors py-2"
                onClick={() => setOpen(false)}
              >
                About
              </Link>
              <div className="pt-4 border-t border-slate-200">
                <Link
                  href="/login"
                  className="block text-slate-700 hover:text-sky-600 transition-colors py-2"
                  onClick={() => setOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-white font-medium transition hover:bg-sky-700 mt-2"
                  onClick={() => setOpen(false)}
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
