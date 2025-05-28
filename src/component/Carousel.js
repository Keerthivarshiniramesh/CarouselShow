
import React, { useEffect, useState, useRef } from "react";
import audios from '../assest/piano.mp3'; // assuming audios is the path to the mp3 file
import logo from "../assest/SAN Techn-logo.png";
import LoadingPage from "./Loading";

export default function Carousel() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [slides, setSlides] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showControls, setShowControls] = useState(false);
    const timeoutRef = useRef(null);

    const [click, setClick] = useState(true)
    const url = process.env.REACT_APP_URL;

    // Create audio ref
    const audioRef = useRef(new Audio(audios));

    const audio = audioRef.current;


    useEffect(() => {

        return () => {
            handlePlay()
        }
    }, [])
    const handlePlay = () => {

        audio.play()
        setIsPlaying(true)
        setClick(false)
    }



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
            if (e.key === 'Enter') {

                setIsPlaying(prev => !prev);
                setShowControls(true);
                setTimeout(() => setShowControls(false), 2000);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);


    // Slide transition logic
    useEffect(() => {
        if (!isPlaying || slides.length === 0) return;

        const duration = 5000; // 3 seconds
        timeoutRef.current = setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        }, duration);

        return () => clearTimeout(timeoutRef.current);
    }, [isPlaying, slides, currentIndex]);

    if (!slides.length) {
        return <LoadingPage />;
    }

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-white">


            {
                click &&
                <div
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="popup-title"
                >
                    <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 text-center transform transition-transform duration-300 ease-out scale-100">
                        <h2 id="popup-title" className="text-xl font-semibold mb-4 text-gray-900">
                            Audio will start
                        </h2>

                        <button
                            onClick={handlePlay}
                            className="bg-black text-white font-semibold px-6 py-3 rounded-md hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                            autoFocus
                        >
                            OK
                        </button>
                    </div>
                </div>
            }

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
                    {isPlaying ? <i className="bi bi-pause-fill w-80"></i> : <i className="bi bi-play-fill w-80"></i>}
                </div>
            )}
        </div>
    );
}
