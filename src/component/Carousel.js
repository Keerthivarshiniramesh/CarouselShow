// import React, { useEffect, useState, useRef } from "react";
// import logo from "../assest/SAN Techn-logo.png";
// import LoadingPage from "./Loading";

// export default function Carousel() {
//     const [isPlaying, setIsPlaying] = useState(true);
//     const [slides, setSlides] = useState([]);
//     const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
//     const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
//     const [mediaItems, setMediaItems] = useState([]);
//     const [currentMedia, setCurrentMedia] = useState(null);
//     const timeoutRef = useRef(null);
//     const url = process.env.REACT_APP_URL;

//     // Toggle play/pause with Enter key
//     useEffect(() => {
//         const handleKeyDown = (e) => {
//             if (e.key === "Enter") {
//                 setIsPlaying((prev) => !prev);
//             }
//         };
//         window.addEventListener("keydown", handleKeyDown);
//         return () => window.removeEventListener("keydown", handleKeyDown);
//     }, []);


//     useEffect(() => {
//         fetch(`${url}/getSliders`, {
//             method: "GET",
//             credentials: "include",
//         })
//             .then((res) => res.json())
//             .then((data) => {
//                 if (data.success) {
//                     setSlides(data.sliders);
//                     console.log("Fetched slides:", data.sliders);
//                 } else {
//                     alert(data.message);
//                 }
//             })
//             .catch((err) => console.error("Error fetching sliders:", err));
//     }, [url]);


//     useEffect(() => {
//         if (slides.length === 0) return;

//         const currentSlide = slides[currentSlideIndex];
//         const items = [
//             ...(currentSlide.ImageSlide || []),
//             ...(currentSlide.VideoSlide || []),
//         ];

//         setMediaItems(items);
//         setCurrentMedia(items[currentMediaIndex] || null);
//     }, [slides, currentSlideIndex, currentMediaIndex]);


//     useEffect(() => {
//         if (!mediaItems.length || !currentMedia || !isPlaying) return;

//         const isVideo = /\.(mp4|webm)$/i.test(currentMedia.filepath);
//         if (isVideo) return;

//         const duration = slides[currentSlideIndex]?.duration || 3000;

//         timeoutRef.current = setTimeout(() => {
//             advanceToNext(mediaItems.length);
//         }, duration);

//         return () => clearTimeout(timeoutRef.current);
//     }, [mediaItems, currentMedia, isPlaying]);


//     useEffect(() => {
//         setCurrentMediaIndex(0);
//     }, [currentSlideIndex]);


//     const advanceToNext = (mediaLength) => {
//         setCurrentMediaIndex((prev) => {
//             if (prev + 1 === mediaLength) {
//                 let nextSlide = (currentSlideIndex + 1) % slides.length;

//                 while (
//                     slides[nextSlide] &&
//                     !slides[nextSlide].ImageSlide?.length &&
//                     !slides[nextSlide].VideoSlide?.length
//                 ) {
//                     nextSlide = (nextSlide + 1) % slides.length;
//                     if (nextSlide === currentSlideIndex) break;
//                 }

//                 setCurrentSlideIndex(nextSlide);
//                 return 0;
//             }
//             return prev + 1;
//         });
//     };

//     // Loading or fallback view
//     if (!mediaItems || !currentMedia) {
//         return <LoadingPage />
//     }

//     return (
//         <div className="relative w-screen h-screen overflow-hidden bg-black">
//             <img src={logo} alt="Logo" className="w-40 absolute bottom-0 right-20" />
//             {/\.(avif|jpeg)$/i.test(currentMedia.filepath) && (

//                 <img
//                     key={currentMedia.filepath}
//                     src={`${url}/${currentMedia.filepath}`}
//                     alt={`Media ${currentMediaIndex + 1}`}
//                     className="w-full h-full object-contain"
//                 />
//             )}
//         </div>
//     );
// }


import React, { useEffect, useState, useRef } from "react";
import audios from '../assest/piano.mp3'; // assuming audios is the path to the mp3 file
import logo from "../assest/SAN Techn-logo.png";
import LoadingPage from "./Loading";

export default function Carousel() {
    const [isPlaying, setIsPlaying] = useState(true);
    const [slides, setSlides] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showControls, setShowControls] = useState(false);
    const timeoutRef = useRef(null);
    const url = process.env.REACT_APP_URL;

    // Create audio ref
    const audioRef = useRef(new Audio(audios));

    // Setup audio on mount
    useEffect(() => {
        const audio = audioRef.current;
        audio.loop = true; // loop the audio continuously

        if (isPlaying) {
            audio.play().catch(() => {
                // handle autoplay restrictions here if needed
                
            });
        } else {
            audio.pause();
        }

        return () => {
            audio.pause();
            audio.currentTime = 0;
        };
    }, [isPlaying]);

    // Fetch slides
    useEffect(() => {
        fetch(`${url}/getSliders`, {
            method: "GET",
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    const imageSlides = data.sliders.flatMap(slide => slide.ImageSlide || []);
                    setSlides(imageSlides);
                } else {
                    alert(data.message);
                }
            })
            .catch((err) => console.error("Error fetching sliders:", err));
    }, [url]);

    // Keyboard control: Enter toggles play/pause
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Enter") {
                setIsPlaying((prev) => !prev);
                setShowControls(true);
                setTimeout(() => setShowControls(false), 2000);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Slide transition logic
    useEffect(() => {
        if (!isPlaying || slides.length === 0) return;

        const duration = 3000; // 3 seconds
        timeoutRef.current = setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        }, duration);

        return () => clearTimeout(timeoutRef.current);
    }, [isPlaying, slides, currentIndex]);

    if (!slides.length) {
        return <LoadingPage />;
    }

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-black">
            <img src={logo} alt="Logo" className="w-32 absolute bottom-0 right-20 z-10" />

            {/* Render all images, fading between them */}
            {slides.map((media, index) => (
                <img
                    key={media.filepath}
                    src={`${url}/${media.filepath}`}
                    alt={`Slide ${index + 1}`}
                    className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-1000 ease-in-out ${index === currentIndex ? "opacity-100 z-0" : "opacity-0 z-0"
                        }`}
                />
            ))}

            {/* Play/Pause overlay shown briefly on Enter */}
            {showControls && (
                <div className="absolute top-[50%] left-[50%] text-white text-lg bg-black bg-opacity-60 px-4 py-2 rounded">
                    {isPlaying ? <i className="bi bi-play-fill w-80"></i> : <i className="bi bi-pause-fill w-80"></i>}
                </div>
            )}
        </div>
    );
}
