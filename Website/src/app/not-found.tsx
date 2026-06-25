import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0F0D] flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,229,160,0.06) 0%, transparent 80%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(rgba(0,229,160,0.1) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse 70% 70% at 50% 50%, black 0%, transparent 100%)",
        }}
      />

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-16 group">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shadow-[#F5A800]/30">
          <Image
            src="/screenLogo.png"
            alt="Centfluence Logo"
            width={32} // Fills the w-8 wrapper (32px)
            height={32} // Fills the h-8 wrapper (32px)
            style={{ objectFit: "contain" }}
          />
        </div>
        <span className="text-white font-semibold text-lg font-display">
          centfluence
        </span>
      </Link>

      {/* 404 display */}
      <div className="relative mb-6">
        <p
          className="font-display text-[120px] md:text-[180px] text-[#F5A800] leading-none select-none font-bold"
          style={{ WebkitTextStroke: "1px #F5A800" }}
        >
          404
        </p>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-2xl bg-[#F5A800]/10 border border-[#F5A800]/20 flex items-center justify-center text-3xl animate-float">
            🔍
          </div>
        </div>
      </div>

      <h1 className="font-display text-3xl md:text-4xl text-white mb-3">
        Page not <span className="text-[#F5A800] italic">found</span>
      </h1>
      <p className="text-[#B8CEC4] max-w-sm leading-relaxed mb-8">
        The page you are looking for does not exist or has been moved. Let us
        get you back on track.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 bg-[#F5A800] text-[#0A0F0D] font-semibold px-6 py-3 rounded-full hover:bg-[#976802] transition-all shadow-lg shadow-[#00E5A0]/25"
        >
          Back to Home
        </Link>
        <Link
          href="https://mail.google.com/mail/?view=cm&fs=1&to=laukikwaikar@example.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 border border-[#1E2B24] text-white font-semibold px-6 py-3 rounded-full hover:border-white/40 transition-all"
        >
          Contact on Email
        </Link>
      </div>
    </div>
  );
}
