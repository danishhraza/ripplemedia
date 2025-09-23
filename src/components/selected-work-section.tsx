"use client";
import React, { useState } from "react";
import { motion, useInView, useScroll, useTransform } from "motion/react";

// Custom Layout Grid Component
const LayoutGrid = ({ cards }: { cards: any[] }) => {
  const [selected, setSelected] = useState<any | null>(null);

  return (
    <div className="w-full h-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[800px]">
        {cards.map((card, i) => (
          <motion.div
            key={card.id}
            className={`${card.className} relative overflow-hidden rounded-xl cursor-pointer bg-white shadow-lg hover:shadow-2xl transition-all duration-300`}
            whileHover={{ scale: 1.02 }}
            onClick={() => setSelected(selected === card ? null : card)}
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

      {selected && (
        <motion.div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSelected(null)}
        >
          <motion.div
            className="bg-white rounded-xl p-4 max-w-4xl max-h-[90vh] overflow-auto"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            {selected.content}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

// Video data - replace with your actual videos
const videos = [
  {
    id: 1,
    content: (
      <div className="w-full h-full">
        <video
          className="w-full h-full object-cover rounded-lg"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/videos/banner.MOV" />
        </video>
      </div>
    ),
    className: "md:col-span-2 md:row-span-2",
    title: "Featured Project",
  },
  {
    id: 2,
    content: (
      <div className="w-full h-full bg-gradient-to-br from-orange-400 to-yellow-400 rounded-lg flex items-center justify-center">
        <p className="font-bold text-white text-lg">Coming Soon</p>
      </div>
    ),
    className: "col-span-1",
    title: "Project 2",
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
  },
];

export const SelectedWorkSection: React.FC = () => {
  const ref = React.useRef(null);
  // Trigger animations earlier: expand root with positive top margin and require only 10% visibility
  const isInView = useInView(ref, {
    once: true,
    amount: 0.1,
    // rootMargin: top right bottom left -> start earlier and don't require deep scroll
    margin: "200px 0px -20% 0px",
  });

  // Scroll progress for the word "Work" only, finish quickly over a small scroll range
  const workRef = React.useRef<HTMLSpanElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: workRef,
    // Complete highlight between when the word is near the bottom and slightly higher in the viewport
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
                backgroundSize: bgSize, // controlled by scroll
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
