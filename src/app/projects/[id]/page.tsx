"use client";
import React from "react";
import { motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";

// Dummy Data (Duplicated for simplicity)
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
        description: "This project wasn't just about design — it was about creating a meaningful tool that drives results. From strategy to execution, we focused on delivering a seamless user experience that aligns with the brand's core values.",
        images: ["/projects/p1.webp", "/projects/p2.webp"],
    },
    {
        id: 2,
        title: "Project Two",
        category: "Branding, Identity",
        image: "/projects/p3.png",
        hoverImage: "/projects/p4.png",
        client: "Alpha Corp",
        date: "August 20, 2025",
        service: "Branding",
        description: "A complete rebranding for Alpha Corp, focusing on modern aesthetics and strong visual identity. We created a design system that scales across all platforms.",
        images: ["/projects/p1.webp", "/projects/p2.webp"],
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
        description: "Full-stack development and SEO optimization for Beta Inc. We improved site performance by 40% and increased organic traffic by 200%.",
        images: ["/projects/p1.webp", "/projects/p2.webp"],
    },
];

export default function ProjectDetailPage() {
    const params = useParams();
    const id = params?.id ? parseInt(params.id as string) : null;
    const project = projects.find((p) => p.id === id);

    if (!project) {
        return <div className="min-h-screen flex items-center justify-center text-black bg-white">Project not found</div>;
    }

    return (
        <main className="min-h-screen bg-white text-black relative">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center z-50">
                <Link href="/projects" className="text-sm font-medium hover:opacity-70 transition-opacity flex items-center gap-2 text-black">
                    ← Back to Projects
                </Link>
                <Link href="/" className="text-xl font-bold tracking-tighter text-black">
                    RIPPLE MEDIA
                </Link>
            </nav>

            <div className="flex flex-col md:flex-row min-h-screen">
                {/* Left Side - Sticky Details */}
                <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center md:sticky md:top-0 md:h-screen z-10 bg-white">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight text-black md:mt-0 mt-14">{project.title}</h1>

                        <div className="mb-12">
                            <h2 className="text-sm text-gray-500 uppercase tracking-widest mb-4">Overview</h2>
                            <p className="text-lg md:text-xl text-gray-800 leading-relaxed max-w-xl">
                                {project.description}
                            </p>
                        </div>

                        <div className="border-t border-gray-200 pt-8 grid grid-cols-1 gap-6">
                            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                                <span className="text-gray-500">Client</span>
                                <span className="font-medium text-black">{project.client}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                                <span className="text-gray-500">Date</span>
                                <span className="font-medium text-black">{project.date}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                                <span className="text-gray-500">Service</span>
                                <span className="font-medium text-black">{project.service}</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right Side - Scrollable Images */}
                <div className="w-full md:w-1/2 bg-white">
                    <div className="flex flex-col gap-0">
                        {project.images.map((img, index) => (
                            <motion.div
                                key={index}
                                className="relative w-full h-[80vh] md:h-screen"
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-10%" }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                            >
                                <Image
                                    src={img}
                                    alt={`${project.title} - Image ${index + 1}`}
                                    fill
                                    className="object-cover"
                                />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
