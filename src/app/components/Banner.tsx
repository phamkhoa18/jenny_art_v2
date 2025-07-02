"use client";
import { motion } from "framer-motion";
import { useRef } from "react";

export default function Banner() {
  const videoRef = useRef<HTMLVideoElement>(null);


  return (
    <section className="banner h-[100%] flex items-center justify-center">
      <motion.div
        className="w-full h-full max-w-screen-lg mx-auto rounded-xl overflow-hidden shadow-lg relative"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
      >
        <video
          ref={videoRef}
          className="w-full h-full"
          src="/videos/video_banner.mp4"
          poster="/images/image_banner.jpg"
          controls
          loop
          playsInline
        >
          Trình duyệt của bạn không hỗ trợ video.
        </video>
      </motion.div>
    </section>
  );
}
