import React, { useEffect, useState, useRef } from "react";
import logo from "../assest/SAN Techn-logo.png";

export default function Carousel() {
    const [isPlaying, setIsPlaying] = useState(true);
    const [slides, setSlides] = useState([]);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [mediaItems, setMediaItems] = useState([]);
    const [currentMedia, setCurrentMedia] = useState(null);
    const timeoutRef = useRef(null);
    const url = process.env.REACT_APP_URL;

    // Toggle play/pause with Enter key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Enter") {
                setIsPlaying((prev) => !prev);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Fetch slides from server
    useEffect(() => {
        fetch(`${url}/getSliders`, {
            method: "GET",
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setSlides(data.sliders);
                    console.log("Fetched slides:", data.sliders);
                } else {
                    alert(data.message);
                }
            })
            .catch((err) => console.error("Error fetching sliders:", err));
    }, [url]);

    // Update mediaItems and currentMedia on slide/media change
    useEffect(() => {
        if (slides.length === 0) return;

        const currentSlide = slides[currentSlideIndex];
        const items = [
            ...(currentSlide.ImageSlide || []),
            ...(currentSlide.VideoSlide || []),
        ];

        setMediaItems(items);
        setCurrentMedia(items[currentMediaIndex] || null);
    }, [slides, currentSlideIndex, currentMediaIndex]);

    // Handle timeout for image transitions (videos handled with onEnded)
    useEffect(() => {
        if (!mediaItems.length || !currentMedia || !isPlaying) return;

        const isVideo = /\.(mp4|webm)$/i.test(currentMedia.filepath);
        if (isVideo) return;

        const duration = slides[currentSlideIndex]?.duration || 3000;

        timeoutRef.current = setTimeout(() => {
            advanceToNext(mediaItems.length);
        }, duration);

        return () => clearTimeout(timeoutRef.current);
    }, [mediaItems, currentMedia, isPlaying]);

    // Reset media index on slide change
    useEffect(() => {
        setCurrentMediaIndex(0);
    }, [currentSlideIndex]);

    // Advance to next media or slide
    const advanceToNext = (mediaLength) => {
        setCurrentMediaIndex((prev) => {
            if (prev + 1 === mediaLength) {
                let nextSlide = (currentSlideIndex + 1) % slides.length;

                // Skip empty slides
                while (
                    slides[nextSlide] &&
                    !slides[nextSlide].ImageSlide?.length &&
                    !slides[nextSlide].VideoSlide?.length
                ) {
                    nextSlide = (nextSlide + 1) % slides.length;
                    if (nextSlide === currentSlideIndex) break;
                }

                setCurrentSlideIndex(nextSlide);
                return 0;
            }
            return prev + 1;
        });
    };

    // Loading or fallback view
    if (!currentMedia) {
        return (
            <div className="flex items-center justify-center w-screen h-screen bg-black text-white">
                Loading...
            </div>
        );
    }

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-black">
            <img src={logo} alt="Logo" className="w-40 absolute bottom-0 right-20" />
            {/\.(mp4|webm)$/i.test(currentMedia.filepath) ? (
                <video
                    key={`${currentMedia.filepath}-${currentMediaIndex}`}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-contain"
                    src={`${url}/${currentMedia.filepath}`}
                    onEnded={() => {
                        if (isPlaying) advanceToNext(mediaItems.length);
                    }}
                />
            ) : (
                <img
                    key={currentMedia.filepath}
                    src={`${url}/${currentMedia.filepath}`}
                    alt={`Media ${currentMediaIndex + 1}`}
                    className="w-full h-full object-contain"
                />
            )}
        </div>
    );
}
