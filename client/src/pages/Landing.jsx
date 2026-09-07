import { useEffect, useRef, useState } from 'react';
import {
  Activity,
  ArrowDown,
  ArrowRight,
  BarChart3,
  BookOpen,
  Library,
  Pause,
  Play,
  QrCode,
  ScanLine,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import heroImage from '../assets/hero.png';

gsap.registerPlugin(ScrollTrigger);

export default function Landing() {
  const pageRef = useRef(null);
  const videoRef = useRef(null);

  const [videoReady, setVideoReady] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);

  /* =========================================================
     VIDEO
  ========================================================= */

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    const handleLoaded = () => {
      setVideoReady(true);
    };

    const handlePlay = () => {
      setVideoPlaying(true);
    };

    const handlePause = () => {
      setVideoPlaying(false);
    };

    video.addEventListener('loadeddata', handleLoaded);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    if (video.readyState >= 2) {
      setVideoReady(true);
    }

    /*
     * Autoplay.
     * The video is muted, so normal browser autoplay
     * policies should allow it.
     */
    const startVideo = async () => {
      try {
        await video.play();
      } catch (error) {
        console.warn('Autoplay blocked:', error);
      }
    };

    startVideo();

    return () => {
      video.removeEventListener('loadeddata', handleLoaded);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  /* =========================================================
     PAGE ANIMATIONS

     IMPORTANT:
     We do NOT fade the hero text away.
     The hero remains visible while the video plays.
  ========================================================= */

  useEffect(() => {
    const page = pageRef.current;

    if (!page) return;

    const ctx = gsap.context(() => {
      gsap.utils
        .toArray('.landing-reveal')
        .forEach((element) => {
          gsap.fromTo(
            element,
            {
              y: 35,
              opacity: 0,
            },
            {
              y: 0,
              opacity: 1,
              duration: 0.7,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: element,
                start: 'top 86%',
                toggleActions:
                  'play none none reverse',
              },
            }
          );
        });

      gsap.to('.landing-hero-image', {
        scale: 1.06,
        scrollTrigger: {
          trigger: '.landing-hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.1,
        },
      });

      gsap.to('.landing-hero-overlay', {
        opacity: 0.78,
        scrollTrigger: {
          trigger: '.landing-hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.1,
        },
      });
    }, page);

    return () => {
      ctx.revert();
    };
  }, []);

  /* =========================================================
     VIDEO CONTROL
  ========================================================= */

  const toggleVideo = async () => {
    const video = videoRef.current;

    if (!video) return;

    try {
      if (video.paused) {
        /*
         * If the original video has finished,
         * preview starts it again from the beginning.
         */
        if (
          video.ended ||
          video.currentTime >= video.duration
        ) {
          video.currentTime = 0;
        }

        await video.play();
      } else {
        video.pause();
      }
    } catch (error) {
      console.error(
        'Could not control video:',
        error
      );
    }
  };

  return (
    <>
      <style>{`

        /* =====================================================
           ROOT
        ====================================================== */

        .nexlib-landing {
          width: 100%;
          min-height: 100vh;

          overflow-x: hidden;

          background: #090a08;
          color: #f1eee7;
        }

        .nexlib-landing *,
        .nexlib-landing *::before,
        .nexlib-landing *::after {
          box-sizing: border-box;
        }

        .nexlib-landing a {
          text-decoration: none;
          color: inherit;
        }

        .landing-mono {
          font-family:
            "IBM Plex Mono",
            "SFMono-Regular",
            Consolas,
            monospace;
        }

        .landing-index {
          color: rgba(241,238,231,.44);

          font-family:
            "IBM Plex Mono",
            "SFMono-Regular",
            Consolas,
            monospace;

          font-size: 9px;
          letter-spacing: .15em;
          text-transform: uppercase;
        }


        /* =====================================================
           HERO
        ====================================================== */

        .landing-hero {
          position: relative;

          width: 100%;

          height: 155vh;

          background: #080907;
        }

        .landing-hero-sticky {
          position: sticky;

          top: 0;

          width: 100%;
          height: 100vh;

          min-height: 620px;

          overflow: hidden;

          isolation: isolate;
        }

        .landing-hero-image {
          position: absolute;

          inset: 0;

          width: 100%;
          height: 100%;

          object-fit: cover;

          z-index: -5;

          background: #151613;

          transform: scale(1.01);

          filter:
            brightness(.62)
            contrast(1.06)
            saturate(.86);

          pointer-events: none;

          will-change: transform;

          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        .landing-hero-overlay {
          position: absolute;

          inset: 0;

          z-index: -3;

          pointer-events: none;

          background:
            linear-gradient(
              90deg,
              rgba(6,7,5,.89) 0%,
              rgba(6,7,5,.55) 39%,
              rgba(6,7,5,.14) 74%,
              rgba(6,7,5,.44) 100%
            ),
            linear-gradient(
              180deg,
              rgba(6,7,5,.66) 0%,
              rgba(6,7,5,.05) 38%,
              rgba(6,7,5,.84) 100%
            );
        }

        .landing-hero-vignette {
          position: absolute;

          inset: 0;

          z-index: -2;

          pointer-events: none;

          background:
            radial-gradient(
              circle at 72% 52%,
              rgba(210,255,74,.08),
              transparent 28%
            );
        }

        .landing-hero-noise {
          position: absolute;

          inset: 0;

          z-index: -1;

          pointer-events: none;

          opacity: .055;

          background-image:
            url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='.5'/%3E%3C/svg%3E");
        }


        /* TOP */

        .landing-hero-top {
          position: absolute;

          left:
            clamp(18px, 4vw, 64px);

          right:
            clamp(18px, 4vw, 64px);

          top: 86px;

          z-index: 20;

          display: flex;

          justify-content: space-between;

          align-items: center;

          gap: 20px;
        }

        .landing-system {
          display: flex;

          align-items: center;

          gap: 10px;

          color:
            rgba(241,238,231,.8);

          font-family:
            "IBM Plex Mono",
            "SFMono-Regular",
            Consolas,
            monospace;

          font-size: 9px;

          letter-spacing: .14em;

          text-transform: uppercase;
        }

        .landing-system-dot {
          width: 6px;
          height: 6px;

          flex-shrink: 0;

          border-radius: 50%;

          background:
            #d2ff4a;

          box-shadow:
            0 0 0 5px
            rgba(210,255,74,.08);
        }

        .landing-status {
          color:
            rgba(241,238,231,.49);

          font-family:
            "IBM Plex Mono",
            monospace;

          font-size: 8px;

          letter-spacing: .13em;

          text-transform: uppercase;
        }


        /* HERO CONTENT */

        .landing-hero-content {
          position: absolute;

          left:
            clamp(18px, 4vw, 64px);

          right: 20px;

          bottom:
            clamp(100px, 11vh, 145px);

          z-index: 30;

          width:
            min(880px, 80vw);

          opacity: 1 !important;

          visibility: visible !important;

          transform: none;
        }

        .landing-hero-kicker {
          display: inline-flex;

          align-items: center;

          gap: 8px;

          padding-bottom: 10px;

          margin-bottom: 20px;

          border-bottom:
            1px solid
            rgba(241,238,231,.24);

          color:
            #d2ff4a;

          font-family:
            "IBM Plex Mono",
            monospace;

          font-size: 9px;

          letter-spacing: .16em;

          text-transform: uppercase;
        }

        .landing-hero-title {
          margin: 0;

          font-family:
            "Newsreader",
            Georgia,
            serif;

          font-size:
            clamp(67px, 9.2vw, 145px);

          font-weight:
            500;

          line-height:
            .81;

          letter-spacing:
            -.065em;

          text-wrap:
            balance;
        }

        .landing-hero-title span {
          display: block;

          opacity: 1;

          transform: none;
        }

        .landing-hero-title em {
          color:
            #d2ff4a;

          font-style:
            italic;
        }

        .landing-hero-copy {
          max-width: 560px;

          margin:
            27px 0 0;

          color:
            rgba(241,238,231,.8);

          font-size:
            clamp(14px, 1.25vw, 17px);

          line-height:
            1.7;
        }

        .landing-hero-buttons {
          display: flex;

          flex-wrap: wrap;

          gap: 12px;

          margin-top: 30px;
        }

        .landing-button {
          min-height: 48px;

          display: inline-flex;

          align-items: center;

          justify-content: center;

          gap: 8px;

          padding:
            0 17px;

          font-size: 12px;

          transition:
            transform .25s ease,
            background .25s ease,
            border-color .25s ease,
            color .25s ease;
        }

        .landing-button-primary {
  background:
    #d2ff4a;

  color:
    #111503;

  font-weight:
    800;

  text-shadow:
    none;

  border:
    1px solid
    rgba(0,0,0,.18);
}

.landing-button-primary span {
  color:
    #111503;

  font-weight:
    800;
}

.landing-button-primary svg {
  color:
    #111503;

  stroke:
    #111503;
}

.landing-button-primary:hover {
  background:
    #f1eee7;

  color:
    #111503;

  border-color:
    #f1eee7;
}

.landing-button-primary:hover span,
.landing-button-primary:hover svg {
  color:
    #111503;

  stroke:
    #111503;
}

        .landing-button-primary:hover {
          transform:
            translateY(-3px);

          background:
            #f1eee7;
        }

        .landing-button-secondary {
          border:
            1px solid
            rgba(241,238,231,.26);

          color:
            #f1eee7;

          background:
            rgba(8,9,7,.28);
        }

        .landing-button-secondary:hover {
          transform:
            translateY(-3px);

          border-color:
            rgba(241,238,231,.75);
        }


        /* HERO CONTROL */

        .landing-video-button {
          position: absolute;

          right:
            clamp(18px, 4vw, 64px);

          bottom: 110px;

          z-index: 40;

          min-height: 40px;

          display: inline-flex;

          align-items: center;

          gap: 8px;

          padding:
            0 11px;

          border:
            1px solid
            rgba(241,238,231,.2);

          background:
            rgba(7,8,6,.4);

          color:
            rgba(241,238,231,.75);

          cursor:
            pointer;

          font-family:
            "IBM Plex Mono",
            monospace;

          font-size: 8px;

          letter-spacing: .1em;

          text-transform:
            uppercase;
        }

        .landing-video-button:hover {
          color:
            #d2ff4a;

          border-color:
            rgba(210,255,74,.4);
        }

        .landing-scroll {
          position: absolute;

          left:
            clamp(18px, 4vw, 64px);

          bottom: 25px;

          z-index: 40;

          display: flex;

          align-items: center;

          gap: 8px;

          color:
            rgba(241,238,231,.56);

          font-family:
            "IBM Plex Mono",
            monospace;

          font-size: 8px;

          letter-spacing: .12em;

          text-transform:
            uppercase;
        }

        .landing-scroll svg {
          animation:
            landing-bounce 1.8s
            ease-in-out infinite;
        }

        @keyframes landing-bounce {
          50% {
            transform:
              translateY(5px);
          }
        }


        /* =====================================================
           NORMAL SECTION
        ====================================================== */

        .landing-section {
          padding:
            clamp(95px, 12vw, 165px)
            clamp(18px, 7vw, 110px);

          border-top:
            1px solid
            rgba(241,238,231,.09);
        }


        /* =====================================================
           IDEA
        ====================================================== */

        .landing-idea {
          display: grid;

          grid-template-columns:
            90px
            minmax(0,1fr)
            minmax(270px,.55fr);

          gap: 40px;

          align-items: end;
        }

        .landing-heading {
          margin:
            10px 0 0;

          font-family:
            "Newsreader",
            Georgia,
            serif;

          font-size:
            clamp(47px, 6vw, 88px);

          font-weight:
            500;

          line-height:
            .9;

          letter-spacing:
            -.055em;
        }

        .landing-heading em {
          color:
            #d2ff4a;

          font-style:
            italic;
        }

        .landing-muted {
          color:
            #8d8d84;

          font-size:
            14px;

          line-height:
            1.75;
        }

        .landing-idea-copy {
          max-width:
            420px;
        }

        .landing-links {
          display:
            flex;

          flex-wrap:
            wrap;

          gap:
            17px;

          margin-top:
            24px;
        }

        .landing-text-link {
          display:
            inline-flex;

          align-items:
            center;

          gap:
            7px;

          color:
            #f1eee7;

          border-bottom:
            1px solid
            rgba(241,238,231,.25);

          padding-bottom:
            5px;

          font-size:
            12px;

          transition:
            color .2s ease,
            border-color .2s ease;
        }

        .landing-text-link:hover {
          color:
            #d2ff4a;

          border-color:
            #d2ff4a;
        }


        /* =====================================================
           COLLECTION
        ====================================================== */

        .landing-collection-header {
          display: grid;

          grid-template-columns:
            minmax(0,1fr)
            minmax(260px,.5fr);

          gap:
            60px;

          margin-bottom:
            58px;
        }

        .landing-collection-hint {
          align-self:
            end;

          max-width:
            410px;
        }

        .landing-book-grid {
          display: grid;

          grid-template-columns:
            1.2fr
            .8fr
            .8fr;

          grid-template-rows:
            420px
            255px;

          gap:
            14px;
        }


        /* BOOK CARD */

        .landing-book-card {
          position:
            relative;

          display:
            block;

          min-width:
            0;

          overflow:
            hidden;

          padding:
            21px;

          border:
            1px solid
            rgba(241,238,231,.12);

          color:
            #f1eee7;

          cursor:
            pointer;

          transform-style:
            preserve-3d;

          transition:
            border-color .25s ease,
            box-shadow .25s ease;

          will-change:
            transform;
        }

        .landing-book-card:hover {
          border-color:
            rgba(210,255,74,.44);

          box-shadow:
            0 30px 70px
            rgba(0,0,0,.26);
        }

        .landing-book-card--one {
          grid-row:
            1 / span 2;

          background:
            linear-gradient(
              145deg,
              #35442a,
              #1d2518
            );
        }

        .landing-book-card--two {
          background:
            linear-gradient(
              145deg,
              #513c31,
              #2b211d
            );
        }

        .landing-book-card--three {
          background:
            linear-gradient(
              145deg,
              #304148,
              #20292d
            );
        }

        .landing-book-card--four {
          grid-column:
            2 / span 2;

          background:
            linear-gradient(
              145deg,
              #493340,
              #292028
            );
        }

        .landing-book-card::before {
          content:
            "";

          position:
            absolute;

          inset:
            13px;

          border:
            1px solid
            rgba(241,238,231,.06);

          pointer-events:
            none;
        }

        .landing-book-glow {
          position:
            absolute;

          left:
            50%;

          top:
            50%;

          width:
            230px;

          height:
            230px;

          transform:
            translate(-50%,-50%);

          border-radius:
            50%;

          background:
            radial-gradient(
              circle,
              rgba(210,255,74,.2),
              transparent 67%
            );

          opacity:
            0;

          pointer-events:
            none;

          transition:
            opacity .2s ease;
        }

        .landing-book-card:hover
        .landing-book-glow {
          opacity:
            1;
        }

        .landing-book-top {
          position:
            relative;

          z-index:
            3;

          display:
            flex;

          justify-content:
            space-between;

          gap:
            12px;

          color:
            rgba(241,238,231,.56);

          font-family:
            "IBM Plex Mono",
            monospace;

          font-size:
            8px;

          letter-spacing:
            .13em;

          text-transform:
            uppercase;
        }

        .landing-book-middle {
          position:
            absolute;

          left:
            21px;

          right:
            21px;

          top:
            50%;

          transform:
            translateY(-50%);

          z-index:
            3;
        }

        .landing-book-icon {
          width:
            43px;

          height:
            43px;

          display:
            grid;

          place-items:
            center;

          margin-bottom:
            22px;

          color:
            #d2ff4a;

          border:
            1px solid
            rgba(210,255,74,.34);
        }

        .landing-book-title {
          margin:
            0;

          max-width:
            480px;

          font-family:
            "Newsreader",
            Georgia,
            serif;

          font-size:
            clamp(
              36px,
              4vw,
              67px
            );

          font-weight:
            500;

          line-height:
            .89;

          letter-spacing:
            -.055em;
        }

        .landing-book-card--two
        .landing-book-title,
        .landing-book-card--three
        .landing-book-title {
          font-size:
            clamp(
              29px,
              3vw,
              47px
            );
        }

        .landing-book-card--four
        .landing-book-title {
          font-size:
            clamp(
              30px,
              3.5vw,
              53px
            );
        }

        .landing-book-author {
          position:
            absolute;

          left:
            21px;

          right:
            21px;

          bottom:
            20px;

          z-index:
            4;

          display:
            flex;

          justify-content:
            space-between;

          align-items:
            center;

          gap:
            15px;

          color:
            rgba(241,238,231,.56);

          font-family:
            "IBM Plex Mono",
            monospace;

          font-size:
            8px;

          letter-spacing:
            .1em;

          text-transform:
            uppercase;
        }

        .landing-book-author svg {
          color:
            #d2ff4a;

          transition:
            transform .2s ease;
        }

        .landing-book-card:hover
        .landing-book-author svg {
          transform:
            translateX(5px);
        }

        .landing-book-image {
          position:
            absolute;

          right:
            23px;

          bottom:
            53px;

          width:
            92px;

          height:
            120px;

          object-fit:
            cover;

          border:
            1px solid
            rgba(241,238,231,.17);

          opacity:
            .75;

          transform:
            rotate(6deg);

          filter:
            saturate(.78)
            contrast(1.06);

          transition:
            transform .3s ease,
            opacity .3s ease;
        }

        .landing-book-card:hover
        .landing-book-image {
          opacity:
            .98;

          transform:
            rotate(0deg)
            translateY(-7px)
            scale(1.05);
        }


        /* =====================================================
           QR SECTION
        ====================================================== */

        .landing-split {
          display:
            grid;

          grid-template-columns:
            1.05fr .95fr;
        }

        .landing-qr-visual {
          min-height:
            650px;

          display:
            grid;

          place-items:
            center;

          border-right:
            1px solid
            rgba(241,238,231,.09);

          background:
            radial-gradient(
              circle,
              rgba(210,255,74,.07),
              transparent 35%
            );
        }

        .landing-qr {
          position:
            relative;

          width:
            min(510px, 72%);

          aspect-ratio:
            1;
        }

        .landing-qr-frame {
          position:
            absolute;

          inset:
            13%;

          border:
            1px solid
            rgba(210,255,74,.24);
        }

        .landing-qr-grid {
          position:
            absolute;

          inset:
            24%;

          display:
            grid;

          grid-template-columns:
            repeat(8,1fr);

          gap:
            4px;
        }

        .landing-qr-grid span {
          background:
            rgba(241,238,231,.12);
        }

        .landing-qr-grid span:nth-child(3n),
        .landing-qr-grid span:nth-child(7n) {
          background:
            rgba(210,255,74,.62);
        }

        .landing-qr-beam {
          position:
            absolute;

          left:
            5%;

          right:
            5%;

          top:
            50%;

          height:
            1px;

          background:
            #d2ff4a;

          box-shadow:
            0 0 34px
            rgba(210,255,74,.55);

          animation:
            qr-scan 3.2s
            ease-in-out
            infinite;
        }

        @keyframes qr-scan {
          0%,
          100% {
            transform:
              translateY(-110px);

            opacity:
              .25;
          }

          50% {
            transform:
              translateY(110px);

            opacity:
              1;
          }
        }

        .landing-qr-label {
          position:
            absolute;

          right:
            0;

          bottom:
            2%;

          display:
            flex;

          align-items:
            center;

          gap:
            7px;

          color:
            #d2ff4a;

          font-family:
            "IBM Plex Mono",
            monospace;

          font-size:
            9px;

          letter-spacing:
            .12em;
        }

        .landing-split-copy {
          align-self:
            center;

          padding:
            90px
            clamp(28px, 7vw, 110px);
        }

        .landing-split-copy p {
          max-width:
            420px;

          margin:
            28px 0;

          color:
            #8d8d84;

          font-size:
            14px;

          line-height:
            1.75;
        }


        /* =====================================================
           CONTROL ROOM
        ====================================================== */

        .landing-control {
          display:
            grid;

          grid-template-columns:
            .7fr 1.3fr;

          gap:
            75px;
        }

        .landing-control-copy {
          align-self:
            center;

          max-width:
            450px;
        }

        .landing-control-copy p {
          max-width:
            410px;

          margin:
            25px 0;

          color:
            #8d8d84;

          font-size:
            14px;

          line-height:
            1.75;
        }

        .landing-console {
          overflow:
            hidden;

          border:
            1px solid
            rgba(241,238,231,.11);

          background:
            #10120e;
        }

        .landing-console-top,
        .landing-console-bottom {
          min-height:
            48px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          gap:
            20px;

          padding:
            0 16px;

          color:
            #777970;

          font-family:
            "IBM Plex Mono",
            monospace;

          font-size:
            8px;

          letter-spacing:
            .12em;

          text-transform:
            uppercase;
        }

        .landing-console-top {
          border-bottom:
            1px solid
            rgba(241,238,231,.09);
        }

        .landing-console-bottom {
          border-top:
            1px solid
            rgba(241,238,231,.09);
        }

        .landing-console-bottom strong {
          color:
            #d2ff4a;

          font-family:
            "Newsreader",
            Georgia,
            serif;

          font-size:
            20px;

          font-weight:
            500;
        }

        .landing-console-field {
          position:
            relative;

          height:
            410px;

          overflow:
            hidden;

          background-image:
            linear-gradient(
              rgba(241,238,231,.035) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(241,238,231,.035) 1px,
              transparent 1px
            );

          background-size:
            12.5% 20%;
        }

        .landing-console-line-x,
        .landing-console-line-y {
          position:
            absolute;

          background:
            rgba(241,238,231,.08);
        }

        .landing-console-line-x {
          top:
            50%;

          left:
            7%;

          right:
            7%;

          height:
            1px;
        }

        .landing-console-line-y {
          left:
            50%;

          top:
            8%;

          bottom:
            8%;

          width:
            1px;
        }

        .landing-node {
          position:
            absolute;

          width:
            7px;

          height:
            7px;

          border-radius:
            50%;

          background:
            #5e6259;

          transition:
            transform .25s ease;
        }

        .landing-node:nth-child(3n) {
          background:
            #d2ff4a;

          box-shadow:
            0 0 0 6px
            rgba(210,255,74,.05);
        }

        .landing-console:hover
        .landing-node:nth-child(odd) {
          transform:
            scale(1.7);
        }

        .landing-console-core {
          position:
            absolute;

          left:
            50%;

          top:
            50%;

          transform:
            translate(-50%,-50%);

          width:
            58px;

          height:
            58px;

          display:
            grid;

          place-items:
            center;

          border:
            1px solid
            rgba(210,255,74,.32);

          color:
            #d2ff4a;

          font-family:
            "IBM Plex Mono",
            monospace;

          font-size:
            8px;

          letter-spacing:
            .1em;
        }


        /* =====================================================
           WORKFLOW
        ====================================================== */

        .landing-workflow {
          display:
            grid;

          grid-template-columns:
            .7fr 1.3fr;

          gap:
            80px;
        }

        .landing-workflow-copy {
          max-width:
            440px;
        }

        .landing-workflow-list {
          border-top:
            1px solid
            rgba(241,238,231,.1);
        }

        .landing-workflow-row {
          display:
            grid;

          grid-template-columns:
            45px
            minmax(0,1fr)
            auto;

          gap:
            16px;

          padding:
            20px 0;

          border-bottom:
            1px solid
            rgba(241,238,231,.1);

          align-items:
            center;
        }

        .landing-workflow-number {
          color:
            #74776e;

          font-family:
            "IBM Plex Mono",
            monospace;

          font-size:
            8px;

          letter-spacing:
            .1em;
        }

        .landing-workflow-row h3 {
          margin:
            0;

          font-family:
            "Newsreader",
            Georgia,
            serif;

          font-size:
            27px;

          font-weight:
            500;
        }

        .landing-workflow-row p {
          margin:
            5px 0 0;

          color:
            #8d8d84;

          font-size:
            12px;

          line-height:
            1.5;
        }

        .landing-workflow-row svg {
          color:
            #d2ff4a;
        }


        /* =====================================================
           FINAL
        ====================================================== */

        .landing-final {
          min-height:
            620px;

          display:
            grid;

          grid-template-columns:
            1fr 1fr;

          gap:
            70px;

          align-items:
            end;
        }

        .landing-final-actions {
          border-top:
            1px solid
            rgba(241,238,231,.1);
        }

        .landing-final-action {
          min-height:
            82px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          gap:
            15px;

          border-bottom:
            1px solid
            rgba(241,238,231,.1);

          color:
            #f1eee7;

          font-family:
            "Newsreader",
            Georgia,
            serif;

          font-size:
            25px;

          transition:
            padding-left .25s ease,
            color .25s ease;
        }

        .landing-final-action:hover {
          padding-left:
            12px;

          color:
            #d2ff4a;
        }


        /* =====================================================
           TABLET
        ====================================================== */

        @media (max-width: 900px) {

          .landing-hero {
            height:
              145vh;
          }

          .landing-hero-content {
            width:
              auto;

            right:
              24px;
          }

          .landing-idea {
            grid-template-columns:
              1fr;
          }

          .landing-collection-header {
            grid-template-columns:
              1fr;
          }

          .landing-book-grid {
            grid-template-columns:
              1fr 1fr;

            grid-template-rows:
              380px
              270px
              270px;
          }

          .landing-book-card--one {
            grid-row:
              1 / span 2;
          }

          .landing-book-card--four {
            grid-column:
              1 / span 2;
          }

          .landing-split {
            grid-template-columns:
              1fr;
          }

          .landing-qr-visual {
            min-height:
              500px;

            border-right:
              0;

            border-bottom:
              1px solid
              rgba(241,238,231,.09);
          }

          .landing-control,
          .landing-workflow,
          .landing-final {
            grid-template-columns:
              1fr;
          }

        }


        /* =====================================================
           PHONE
        ====================================================== */

        @media (max-width: 600px) {

          .landing-hero {
            height:
              135vh;
          }

          .landing-hero-sticky {
            min-height:
              570px;
          }

          .landing-hero-top {
            top:
              73px;

            left:
              17px;

            right:
              17px;
          }

          .landing-system {
            font-size:
              8px;
          }

          .landing-system span:last-child {
            display:
              none;
          }

          .landing-status {
            font-size:
              7px;
          }

          .landing-hero-content {
            left:
              17px;

            right:
              17px;

            bottom:
              98px;
          }

          .landing-hero-title {
            font-size:
              clamp(
                52px,
                16.4vw,
                77px
              );
          }

          .landing-hero-copy {
            font-size:
              13px;

            line-height:
              1.62;
          }

          .landing-hero-buttons {
            flex-direction:
              column;

            align-items:
              stretch;
          }

          .landing-button {
            width:
              100%;
          }

          .landing-video-button {
            right:
              17px;

            bottom:
              196px;
          }

          .landing-video-button span {
            display:
              none;
          }

          .landing-scroll {
            left:
              17px;

            bottom:
              23px;
          }

          .landing-section {
            padding:
              85px 17px;
          }

          .landing-heading {
            font-size:
              clamp(
                44px,
                12.8vw,
                64px
              );
          }

          .landing-book-grid {
            display:
              flex;

            flex-direction:
              column;

            gap:
              12px;
          }

          .landing-book-card,
          .landing-book-card--one,
          .landing-book-card--two,
          .landing-book-card--three,
          .landing-book-card--four {
            min-height:
              330px;
          }

          .landing-book-title,
          .landing-book-card--two
          .landing-book-title,
          .landing-book-card--three
          .landing-book-title,
          .landing-book-card--four
          .landing-book-title {
            font-size:
              40px;
          }

          .landing-book-image {
            width:
              76px;

            height:
              103px;
          }

          .landing-qr-visual {
            min-height:
              390px;
          }

          .landing-qr {
            width:
              84vw;
          }

          .landing-console-field {
            height:
              290px;
          }

          .landing-console-bottom {
            flex-wrap:
              wrap;
          }

          .landing-workflow-row {
            grid-template-columns:
              34px
              minmax(0,1fr);
          }

          .landing-workflow-row svg {
            grid-column:
              2;
          }

          .landing-final {
            min-height:
              auto;

            gap:
              55px;
          }

          .landing-final-action {
            min-height:
              70px;

            font-size:
              22px;
          }

        }


        /* =====================================================
           TOUCH DEVICES
        ====================================================== */

        @media (hover: none) and (pointer: coarse) {

          .landing-book-card {
            transform:
              none !important;
          }

          .landing-book-card:hover {
            transform:
              none !important;
          }

          .landing-book-glow {
            display:
              none;
          }

          .landing-book-card:hover
          .landing-book-image {
            transform:
              rotate(6deg);
          }

          .landing-console:hover
          .landing-node:nth-child(odd) {
            transform:
              none;
          }

        }


        /* =====================================================
           REDUCED MOTION
        ====================================================== */

        @media (prefers-reduced-motion: reduce) {

          .landing-scroll svg,
          .landing-qr-beam {
            animation:
              none;
          }

        }

      `}</style>


      <main
        ref={pageRef}
        className="nexlib-landing"
      >

        {/* ===================================================
            HERO
        ==================================================== */}

        <section className="landing-hero">

          <div className="landing-hero-sticky">

            <video
              ref={videoRef}
              className="landing-hero-image"
              autoPlay
              muted
              playsInline
              preload="auto"
              poster={heroImage}
            >
              <source
                src="/hero-bg.mp4"
                type="video/mp4"
              />

              Your browser does not support
              the video element.
            </video>

            <div className="landing-hero-overlay" />
            <div className="landing-hero-vignette" />
            <div className="landing-hero-noise" />


            {/* TOP */}

            <div className="landing-hero-top">

              <div className="landing-system">

                <span className="landing-system-dot" />

                <span>
                  NEXLIB
                </span>

                <span>
                  LIBRARY SYSTEM / 01
                </span>

              </div>

              <span className="landing-status">
                {videoPlaying
                  ? 'MOTION / LIVE'
                  : videoReady
                  ? 'INTRO / PAUSED'
                  : 'LOADING INTRO'}
              </span>

            </div>


            {/* MAIN TEXT */}

            <div className="landing-hero-content">

              <div className="landing-hero-kicker">

                <Sparkles
                  size={13}
                />

                SMART LIBRARY CONTROL SYSTEM

              </div>


              <h1 className="landing-hero-title">

                <span>
                  A library,
                </span>

                <span>
                  <em>
                    in motion.
                  </em>
                </span>

              </h1>


              <p className="landing-hero-copy">
                Register every book. Give it a unique
                QR identity. Issue it, return it, and
                know exactly where your collection stands.
              </p>


              <div className="landing-hero-buttons">

                <Link
  to="/dashboard"
  className="landing-button landing-button-primary"
>
  <span>Explore the control room</span>

  <ArrowRight size={15} />
</Link>


                <Link
                  to="/books"
                  className="landing-button landing-button-secondary"
                >
                  View the collection
                </Link>

              </div>

            </div>


            {/* VIDEO CONTROL */}

            <button
              type="button"
              className="landing-video-button"
              onClick={toggleVideo}
            >

              {videoPlaying ? (
                <Pause size={13} />
              ) : (
                <Play size={13} />
              )}

              <span>
                {videoPlaying
                  ? 'Pause motion'
                  : 'Play motion'}
              </span>

            </button>


            {/* SCROLL */}

            <div className="landing-scroll">

              <ArrowDown
                size={13}
              />

              Scroll to explore

            </div>

          </div>

        </section>


        {/* ===================================================
            IDEA
        ==================================================== */}

        <section
          className="landing-section landing-idea"
        >

          <div className="landing-index">
            02 / THE IDEA
          </div>

          <div className="landing-reveal">

            <div className="landing-index">
              Beyond the admin panel
            </div>

            <h2 className="landing-heading">
              A library should
              <br />
              feel <em>alive.</em>
            </h2>

          </div>


          <div className="landing-idea-copy landing-reveal">

            <p className="landing-muted">
              NexLib connects the physical collection
              to one digital system. Every title can
              be registered, searched, identified,
              issued, returned and tracked.
            </p>

            <div className="landing-links">

              <Link
                to="/books"
                className="landing-text-link"
              >
                Browse books
                <ArrowRight size={13} />
              </Link>

              <Link
                to="/add"
                className="landing-text-link"
              >
                Register a title
                <ArrowRight size={13} />
              </Link>

            </div>

          </div>

        </section>


        {/* ===================================================
            INTERACTIVE COLLECTION
        ==================================================== */}

        <section
          className="landing-section"
        >

          <div className="landing-collection-header">

            <div className="landing-reveal">

              <div className="landing-index">
                03 / THE COLLECTION
              </div>

              <h2 className="landing-heading">
                Don't just browse.
                <br />
                <em>Explore.</em>
              </h2>

            </div>

            <p className="landing-muted landing-collection-hint landing-reveal">
              Click a title to open the real collection.
              On desktop, move your cursor over a card
              and watch it react.
            </p>

          </div>


          <div className="landing-book-grid">

            <InteractiveBook
              to="/books"
              className="landing-book-card--one"
              number="01"
              category="SELF HELP"
              title="Atomic Habits"
              author="James Clear"
              image={heroImage}
            />


            <InteractiveBook
              to="/books"
              className="landing-book-card--two"
              number="02"
              category="TECHNOLOGY"
              title="Clean Code"
              author="Robert C. Martin"
              image={heroImage}
            />


            <InteractiveBook
              to="/books"
              className="landing-book-card--three"
              number="03"
              category="HISTORY"
              title="Sapiens"
              author="Yuval Noah Harari"
              image={heroImage}
            />


            <InteractiveBook
              to="/books"
              className="landing-book-card--four"
              number="04"
              category="DESIGN"
              title="The Design of Everyday Things"
              author="Don Norman"
              image={heroImage}
            />

          </div>

        </section>


        {/* ===================================================
            QR
        ==================================================== */}

        <section
          className="landing-section landing-split"
        >

          <div className="landing-qr-visual landing-reveal">

            <div className="landing-qr">

              <div className="landing-qr-frame" />

              <div className="landing-qr-grid">

                {Array.from(
                  { length: 64 },
                  (_, index) => (
                    <span
                      key={index}
                    />
                  )
                )}

              </div>

              <div className="landing-qr-beam" />

              <div className="landing-qr-label">

                <QrCode
                  size={16}
                />

                BOOK IDENTITY

              </div>

            </div>

          </div>


          <div className="landing-split-copy landing-reveal">

            <div className="landing-index">
              04 / IDENTITY
            </div>

            <h2 className="landing-heading">
              One book.
              <br />
              One <em>identity.</em>
            </h2>

            <p>
              Every physical book receives a unique
              QR identity. Scan it when it leaves the
              shelf and when it comes back.
            </p>

            <Link
              to="/scan"
              className="landing-text-link"
            >
              Open scanner
              <ArrowRight size={13} />
            </Link>

          </div>

        </section>


        {/* ===================================================
            CONTROL ROOM
        ==================================================== */}

        <section
          className="landing-section landing-control"
        >

          <div className="landing-control-copy landing-reveal">

            <div className="landing-index">
              05 / CONTROL ROOM
            </div>

            <h2 className="landing-heading">
              Know what is
              <br />
              <em>moving.</em>
            </h2>

            <p>
              Availability, circulation and transaction
              history come together in one operational view.
            </p>

            <Link
              to="/dashboard"
              className="landing-text-link"
            >
              Enter control room
              <ArrowRight size={13} />
            </Link>

          </div>


          <div className="landing-console landing-reveal">

            <div className="landing-console-top">

              <span>
                <Activity size={11} />
                {' '}
                LIVE COLLECTION
              </span>

              <span>
                CONNECTED
              </span>

            </div>


            <div className="landing-console-field">

              <div className="landing-console-line-x" />

              <div className="landing-console-line-y" />

              {Array.from(
                { length: 15 },
                (_, index) => (
                  <span
                    key={index}
                    className="landing-node"
                    style={{
                      left:
                        `${7 +
                          ((index * 21) % 84)}%`,

                      top:
                        `${10 +
                          ((index * 29) % 77)}%`,
                    }}
                  />
                )
              )}

              <div className="landing-console-core">
                NEXLIB
              </div>

            </div>


            <div className="landing-console-bottom">

              <span>
                <Library size={11} />
                {' '}
                Availability
              </span>

              <strong>
                LIVE
              </strong>

              <span>
                Circulation
              </span>

              <strong>
                ACTIVE
              </strong>

            </div>

          </div>

        </section>


        {/* ===================================================
            WORKFLOW
        ==================================================== */}

        <section
          className="landing-section landing-workflow"
        >

          <div className="landing-workflow-copy landing-reveal">

            <div className="landing-index">
              06 / WORKFLOW
            </div>

            <h2 className="landing-heading">
              Identify.
              <br />
              Move.
              <br />
              <em>Track.</em>
            </h2>

            <p className="landing-muted">
              Three actions connect the physical book
              to its digital record.
            </p>

          </div>


          <div className="landing-workflow-list landing-reveal">

            <WorkflowRow
              number="01"
              title="Identify"
              text="Scan the book's unique QR identity."
              icon={
                <ScanLine size={18} />
              }
            />

            <WorkflowRow
              number="02"
              title="Move"
              text="Issue the book or record its return."
              icon={
                <ArrowRight size={18} />
              }
            />

            <WorkflowRow
              number="03"
              title="Track"
              text="Keep every transaction in the history."
              icon={
                <BarChart3 size={18} />
              }
            />

          </div>

        </section>


        {/* ===================================================
            FINAL CTA
        ==================================================== */}

        <section
          className="landing-section landing-final"
        >

          <div className="landing-reveal">

            <div className="landing-index">
              07 / START
            </div>

            <h2 className="landing-heading">
              Put your
              <br />
              collection
              <br />
              <em>to work.</em>
            </h2>

          </div>


          <div className="landing-final-actions landing-reveal">

            <Link
              to="/add"
              className="landing-final-action"
            >
              <span>
                Add a book
              </span>

              <ArrowRight size={18} />
            </Link>


            <Link
              to="/scan"
              className="landing-final-action"
            >
              <span>
                Issue / return
              </span>

              <ScanLine size={18} />
            </Link>


            <Link
              to="/dashboard"
              className="landing-final-action"
            >
              <span>
                Open control room
              </span>

              <Activity size={18} />
            </Link>

          </div>

        </section>

      </main>
    </>
  );
}


/* =========================================================
   INTERACTIVE BOOK
========================================================= */

function InteractiveBook({
  to,
  className,
  number,
  category,
  title,
  author,
  image,
}) {
  const cardRef =
    useRef(null);

  const glowRef =
    useRef(null);

  const handlePointerMove = (event) => {
    /*
     * Do not use cursor tilt on touch devices.
     */
    if (
      event.pointerType === 'touch'
    ) {
      return;
    }

    const card =
      cardRef.current;

    const glow =
      glowRef.current;

    if (!card) return;

    const rect =
      card.getBoundingClientRect();

    const x =
      event.clientX -
      rect.left;

    const y =
      event.clientY -
      rect.top;

    const centerX =
      rect.width / 2;

    const centerY =
      rect.height / 2;

    const rotateX =
      ((centerY - y) /
        centerY) *
      4.5;

    const rotateY =
      ((x - centerX) /
        centerX) *
      4.5;

    card.style.transform =
      `perspective(1000px)
       rotateX(${rotateX}deg)
       rotateY(${rotateY}deg)
       translateY(-7px)`;

    if (glow) {
      glow.style.left =
        `${x}px`;

      glow.style.top =
        `${y}px`;
    }
  };

  const resetCard = () => {
    const card =
      cardRef.current;

    if (!card) return;

    card.style.transform =
      '';
  };

  return (
    <Link
      ref={cardRef}
      to={to}
      className={
        `landing-book-card ${className} landing-reveal`
      }
      onPointerMove={
        handlePointerMove
      }
      onPointerLeave={
        resetCard
      }
    >

      <div
        ref={glowRef}
        className="landing-book-glow"
      />


      <div className="landing-book-top">

        <span>
          {number}
        </span>

        <span>
          {category}
        </span>

      </div>


      <div className="landing-book-middle">

        <div className="landing-book-icon">

          <BookOpen
            size={20}
            strokeWidth={1.3}
          />

        </div>

        <h3 className="landing-book-title">
          {title}
        </h3>

      </div>


      <div className="landing-book-author">

        <span>
          {author}
        </span>

        <ArrowRight size={15} />

      </div>


      <img
        src={image}
        alt=""
        className="landing-book-image"
        loading="lazy"
        draggable="false"
      />

    </Link>
  );
}


/* =========================================================
   WORKFLOW ROW
========================================================= */

function WorkflowRow({
  number,
  title,
  text,
  icon,
}) {
  return (
    <div className="landing-workflow-row">

      <span className="landing-workflow-number">
        {number}
      </span>

      <div>

        <h3>
          {title}
        </h3>

        <p>
          {text}
        </p>

      </div>

      {icon}

    </div>
  );
}