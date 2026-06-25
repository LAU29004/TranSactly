'use client'
import Link from 'next/link'
import Image from 'next/image'

export default function ContactPage() {
  return (
    /* Complete page background set to the solid orange color */
    <main className="min-h-screen bg-[#F5A800] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Halftone background overlay tuned for dark dots on orange */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-15"
        style={{
          backgroundImage: 'radial-gradient(circle, #0A0F0D 1.3px, transparent 1.3px)',
          backgroundSize: '20px 20px'
        }}
      />

      {/* Transparent Box with White Border and White Text */}
      <div 
        className="relative z-10 w-full max-w-[420px] aspect-square rounded-3xl p-8 flex flex-col items-center justify-center text-center border-2 border-white backdrop-blur-sm shadow-2xl"
        style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.12)', /* Transparent white overlay overlaying the orange background */
        }}
      >
        {/* Logo Container inside the box */}
        <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-white/20 border border-white/30 mb-6">
          <Image
            src="/screenLogo.png"
            alt="Centfluence Logo"
            width={48}
            height={48}
            style={{ objectFit: 'contain' }}
          />
        </div>

        {/* White Typography */}
        <h1 className="font-display text-3xl md:text-4xl text-black font-extrabold tracking-tight mb-3">
          Contact Me
        </h1>
        
        <p className="text-black/95 text-sm max-w-sm mb-8 leading-relaxed font-medium">
          Have a question, feature request, or just want to chat? Reach out via email and we will get back to you.
        </p>

        {/* Gmail Action Button */}
        <Link 
          href="https://mail.google.com/mail/?view=cm&fs=1&to=laukikwaikar@gmail.com"
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 bg-white text-[#F5A800] font-bold px-8 py-3.5 rounded-full hover:bg-white/90 transition-all shadow-md transform hover:-translate-y-0.5"
        >
          <span>Contact on Gmail</span>
        </Link>
      </div>
    </main>
  )
}