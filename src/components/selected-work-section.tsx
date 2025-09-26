"use client";
import React, { useState } from "react";
import { motion, useInView, useScroll, useTransform } from "motion/react";

// Card type for grid items
type Card = {
  id: number | string;
  content: React.ReactNode;
  className?: string;
  title?: string;
  videoUrl?: string; // direct URL for video (used for both preview and modal)
};

// Simple Video Player Component using direct URLs
const VideoPlayer: React.FC<{ 
  videoUrl?: string; 
  autoplay?: boolean;
  muted?: boolean;
  showFullVideo?: boolean;
}> = ({ videoUrl, autoplay = false, muted = true, showFullVideo = false }) => {
  // Determine video type based on file extension
  const videoType = videoUrl?.toLowerCase().endsWith('.MOV') ? 'video/quicktime' : 'video/mp4';

  if (!videoUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-lg">
        <div className="text-center">
          <p className="text-sm text-gray-600">No video available</p>
        </div>
      </div>
    );
  }

  return (
    <video
      className={`${showFullVideo
        ? "max-h-[85vh] max-w-[95vw] w-auto h-auto object-contain"
        : "w-full h-full object-cover"
      } rounded-lg bg-black`}
      autoPlay={autoplay}
      loop
      muted={muted}
      playsInline
      controls={showFullVideo}
      preload={autoplay ? "auto" : "metadata"}
    >
      <source src={videoUrl} type={videoType} />
      <p className="text-red-500">Your browser doesn&apos;t support video playback.</p>
    </video>
  );
};

// Custom Layout Grid Component
const LayoutGrid: React.FC<{ cards: Card[] }> = ({ cards }) => {
  const [selected, setSelected] = useState<Card | null>(null);

  const handleCardClick = (card: Card) => {
    setSelected(selected === card ? null : card);
  };

  return (
    <div className="w-full h-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[800px]">
        {cards.map((card) => (
          <motion.div
            key={card.id}
            className={`${card.className} relative overflow-hidden rounded-xl cursor-pointer bg-white shadow-lg hover:shadow-2xl transition-all duration-300`}
            whileHover={{ scale: 1.02 }}
            onClick={() => handleCardClick(card)}
          >
            {card.content}
            {card.title && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <h3 className="text-white font-semibold text-lg">{card.title}</h3>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Modal for selected video */}
      {selected && (
        <motion.div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 overflow-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSelected(null)}
        >
          <motion.div
            className="relative w-auto max-w-[95vw] max-h-[90vh]"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelected(null)}
              className="absolute -top-12 right-0 text-white text-2xl hover:text-gray-300 z-10"
            >
              ✕
            </button>
            
            {/* Full video with controls */}
            {selected.videoUrl ? (
              <VideoPlayer
                videoUrl={selected.videoUrl}
                showFullVideo={true}
                muted={false}
              />
            ) : (
              <div className="bg-white rounded-xl p-8">
                {selected.content}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

// Video data using direct videoUrl for everything (dummy URLs for now)
const videos: Card[] = [
  {
    id: 1,
    content: (
      <VideoPlayer
        videoUrl="https://dvb3gr8ptb8kd.cloudfront.net/videos/fluxad.mp4"
        autoplay={true}
      />
    ),
    className: "md:col-span-2 md:row-span-2",
    title: "Featured Project",
    videoUrl: "https://dvb3gr8ptb8kd.cloudfront.net/videos/fluxad.mp4",
  },
  {
    id: 2,
    content: (
      <VideoPlayer
        videoUrl="/videos/banner.MOV"
        autoplay={true}
      />
    ),
    className: "col-span-1",
    title: "Project 2",
    videoUrl: "/videos/banner.MOV",
    // No videoKey/previewUrl for "Coming Soon" cards
  },
  {
    id: 3,
    content: (
      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg flex items-center justify-center">
        <p className="font-bold text-white text-lg">Coming Soon</p>
      </div>
    ),
    className: "col-span-1",
    title: "Project 3",
    // No videoKey/previewUrl for "Coming Soon" cards
  },
];

export const SelectedWorkSection: React.FC = () => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.1,
    margin: "200px 0px -20% 0px",
  });

  const workRef = React.useRef<HTMLSpanElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: workRef,
    offset: ["start 95%", "start 10%"],
  });
  const bgSize = useTransform(scrollYProgress, [0, 1], ["0% 100%", "100% 100%"]);

  return (
    <section ref={ref} className="min-h-screen py-16 px-6 relative">
      <div className="mx-auto md:mx-40">
        {/* Title */}
        <div className="relative mb-8">
          <motion.h2
            className="text-4xl md:text-5xl text-left font-semibold"
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{
              duration: 0.6,
              ease: "easeOut",
              delay: 0.2,
            }}
          >
            Selected{" "}
            <motion.span
              ref={workRef}
              className="italic relative"
              style={{
                backgroundImage:
                  "linear-gradient(to right, var(--primary) 0%, var(--primary) 100%)",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "left center",
                display: "inline-block",
                backgroundSize: bgSize,
              }}
            >
              Work
            </motion.span>
          </motion.h2>
        </div>

        {/* Layout Grid for Videos */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 100 }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
            delay: 0.8,
          }}
        >
          <LayoutGrid cards={videos} />
        </motion.div>
      </div>
    </section>
  );
};