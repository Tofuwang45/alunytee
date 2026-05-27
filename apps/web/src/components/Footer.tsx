import Link from 'next/link';

function Footer() {
  return (
    <footer className="relative bg-slate-950 border-t border-sky-400/20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand column */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-sky-300 to-cyan-200 bg-clip-text text-transparent mb-4">
              Alunyte
            </h3>
            <p className="text-slate-300/90 mb-6 max-w-md">
              Preserve critical knowledge and accelerate employee onboarding with AI-powered documentation that evolves with your organization.
            </p>
            
            {/* CTA */}
            <Link
              href="#signup"
              className="inline-flex items-center gap-2 rounded-lg bg-sky-400 px-5 py-3 text-slate-900 font-medium transition hover:bg-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300"
            >
              Get Started
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Product links */}
          <div>
            <h4 className="font-semibold text-slate-100 mb-4">Product</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/features" className="text-slate-300 hover:text-sky-200 transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-slate-300 hover:text-sky-200 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-slate-300 hover:text-sky-200 transition-colors">
                  Documentation
                </Link>
              </li>
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h4 className="font-semibold text-slate-100 mb-4">Company</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-slate-300 hover:text-sky-200 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-slate-300 hover:text-sky-200 transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-300 hover:text-sky-200 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 mt-8 border-t border-sky-400/20">
          <p className="text-slate-400 text-sm">
            © 2025 Alunyte. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-slate-400 hover:text-sky-200 text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-slate-400 hover:text-sky-200 text-sm transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
