
import React, { useEffect, useState, useRef } from "react";

export default function FullscreenCarousel() {
    const [isPlaying, setIsPlaying] = useState(true);
    const [slides, setSlides] = useState(null);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const timeoutRef = useRef(null);
    const url = process.env.REACT_APP_URL;

    // Handle Enter key for play/pause toggle
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Enter") {
                setIsPlaying((prev) => !prev);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Fetch slides
    useEffect(() => {
        fetch(`${url}/getSliders`, {
            method: "GET",
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setSlides(data.sliders);
                } else {
                    alert(data.message);
                }
            })
            .catch((err) => console.error("Error fetching sliders:", err));
    }, [url]);

    // Handle image timeout
    useEffect(() => {
        if (!slides || !isPlaying) return;

        const currentSlide = slides[currentSlideIndex];
        const mediaItems = [
            ...(currentSlide.ImageSlide || []),
            ...(currentSlide.VideoSlide || []),
        ];

        const currentMedia = mediaItems[currentMediaIndex];
        if (!currentMedia || /\.(mp4|webm)$/i.test(currentMedia.filepath)) return;

        const duration = currentSlide.duration || 3000;
        timeoutRef.current = setTimeout(() => {
            advanceToNext(mediaItems.length);
        }, duration);

        return () => clearTimeout(timeoutRef.current);
    }, [slides, currentSlideIndex, currentMediaIndex, isPlaying]);

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

    // Reset media index when slide changes
    useEffect(() => {
        setCurrentMediaIndex(0);
    }, [currentSlideIndex]);

    if (!slides || !slides.length) {
        return (
            <div className="flex items-center justify-center w-screen h-screen bg-black text-white text-lg">
                Loading slides...
            </div>
        );
    }

    const currentSlide = slides[currentSlideIndex];
    const mediaItems = [
        ...(currentSlide.ImageSlide || []),
        ...(currentSlide.VideoSlide || []),
    ];
    const currentMedia = mediaItems[currentMediaIndex];

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-black">
            {currentMedia ? (
                /\.(mp4|webm)$/i.test(currentMedia.filepath) ? (
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
                )
            ) : (
                <div className="flex items-center justify-center w-full h-full text-white">
                    No media available
                </div>
            )}
        </div>
    )
}
