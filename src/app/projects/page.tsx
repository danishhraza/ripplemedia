"use client";
import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";

// Dummy Data for Projects
const projects = [
    {
        id: 1,
        title: "One Step",
        category: "Web Design, Marketing",
        image: "/projects/p1.webp",
        hoverImage: "/projects/p2.webp",
        client: "One Step",
        date: "July 14, 2025",
        service: "Web Design, Marketing",
    },
    {
        id: 2,
        title: "Project Two",
        category: "Branding, Identity",
        image: "/projects/p1.webp",
        hoverImage: "/projects/p2.webp",
        client: "Alpha Corp",
        date: "August 20, 2025",
        service: "Branding",
    },
    {
        id: 3,
        title: "Project Three",
        category: "Development, SEO",
        image: "/projects/p1.webp",
        hoverImage: "/projects/p2.webp",
        client: "Beta Inc",
        date: "September 10, 2025",
        service: "Development",
    },
];

export default function ProjectsPage() {
    return (
        <main className="min-h-screen bg-white text-black relative overflow-hidden">
            {/* Grainy Background Overlay - Darker grain for light mode */}
            <div className="fixed inset-0 pointer-events-none opacity-10 z-0 mix-blend-multiply" style={{ backgroundImage: 'url("/noise.png")' }}></div>

            {/* Navigation / Header */}
            <nav className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center z-50">
                <Link href="/" className="text-xl font-bold tracking-tighter text-black">
                    RIPPLE MEDIA
                </Link>
                <Link href="/" className="text-sm font-medium hover:opacity-70 transition-opacity text-black">
                    Back to Home
                </Link>
            </nav>

            {/* Projects Grid */}
            <div className="relative z-10 container mx-auto px-4 py-32">
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16"
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    {projects.map((project, index) => (
                        <ProjectCard key={project.id} project={project} index={index} />
                    ))}
                </motion.div>
            </div>
        </main>
    );
}

const ProjectCard = ({ project, index }: { project: typeof projects[0], index: number }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const isEven = index % 2 === 0;

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        // Initial check
        checkMobile();

        // Add listener
        window.addEventListener('resize', checkMobile);

        // Cleanup
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <Link href={`/projects/${project.id}`} className="block">
            <motion.div
                className="relative w-full aspect-[4/3] cursor-pointer group rounded-2xl overflow-hidden"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Background Container */}
                <div className="absolute inset-0 bg-green-100 overflow-hidden transition-all duration-500">
                    {/* Hover Image Background */}
                    <Image
                        src={project.hoverImage}
                        alt={project.title}
                        fill
                        className={`object-cover transition-opacity duration-500 ${isMobile ? 'opacity-100' : (isHovered ? 'opacity-100' : 'opacity-0')}`}
                    />
                </div>

                {/* Main Image Container */}
                <motion.div
                    className="absolute overflow-hidden shadow-sm z-10 rounded-xl"
                    initial={{ top: "15%", bottom: "15%", left: "15%", right: "15%" }}
                    animate={{
                        top: "15%",
                        bottom: "15%",
                        // Desktop Hover: Shift Left if Even (Left col), Shift Right if Odd (Right col)
                        // Base inset 15% (70% width). Shift to 5%/25% (70% width).
                        left: !isMobile && isHovered ? (isEven ? "5%" : "25%") : "15%",
                        right: !isMobile && isHovered ? (isEven ? "25%" : "5%") : "15%",
                    }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                    <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover"
                    />
                </motion.div>

                {/* Project Details (Inside) */}
                <div className={`absolute bottom-0 left-0 right-0 p-6 flex justify-between items-end z-20 transition-opacity duration-300 ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <div>
                        <h3 className="text-md md:text-xl font-semibold mb-1 text-white">{project.title}</h3>
                        <p className="text-xs md:text-sm text-white/80">{project.category}</p>
                    </div>
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-white text-xs md:text-base font-medium"
                    >
                        View Project →
                    </motion.div>
                </div>
            </motion.div>
        </Link>
    );
};
