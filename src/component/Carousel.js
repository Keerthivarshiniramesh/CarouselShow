import React, { useEffect, useState, useRef } from "react";
import logo from "../assest/SAN Techn-logo.png";
import LoadingPage from "./Loading";

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


    useEffect(() => {
        setCurrentMediaIndex(0);
    }, [currentSlideIndex]);


    const advanceToNext = (mediaLength) => {
        setCurrentMediaIndex((prev) => {
            if (prev + 1 === mediaLength) {
                let nextSlide = (currentSlideIndex + 1) % slides.length;

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
    if (!mediaItems || !currentMedia) {
        return <LoadingPage />
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
