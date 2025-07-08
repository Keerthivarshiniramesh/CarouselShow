
import React, { useEffect, useState, useRef } from "react"
import audios from '../assest/piano.mp3' // assuming audios is the path to the mp3 file
// import logo from "../assest/SAN Techn-logo.png"
import LoadingPage from "./Loading"

export default function Carousel() {
    const [isPlaying, setIsPlaying] = useState(false)
    const [slides, setSlides] = useState([])

    const [showControls, setShowControls] = useState(false)
    const timeoutRef = useRef(null)
    const videoRef = useRef(null)
    const imageRef = useRef(null)
    const [duration, setDuration] = useState(null)

    const [click, setClick] = useState(true)
    const url = process.env.REACT_APP_URL

    // Create audio ref
    const audioRef = useRef(new Audio(audios))

    const audio = audioRef.current


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
        const audio = audioRef.current
        audio.loop = true // loop the audio continuously

        if (isPlaying) {
            audio.play().catch(() => {

            })
        } else {
            audio.pause()
        }

        return () => {
            audio.pause()
            audio.currentTime = 0
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

                    const imageSlides = data.sliders
                    setSlides(imageSlides);
                    const timers = data.sliders.find(slide => slide.duration)
                    console.log("Duations", typeof (timers.duration))
                    setDuration(timers.duration)
                } else {
                    alert(data.message)
                }
            })
            .catch((err) => console.error("Error fetching sliders:", err))
    }, [url]);

    // Keyboard control
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Enter') {
                // const video = videoRef.current;
                // // video full screen
                // video.requestFullscreen()
                setIsPlaying(prev => !prev)
                setShowControls(true)
                setTimeout(() => setShowControls(false), 2000)
            }
        };

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, []);



    const [mediaType, setMediaType] = useState(null)
    const [mediaIndex, setMediaIndex] = useState(0)
    const [loadImage, setLoadImage] = useState(false)


    useEffect(() => {
        if (slides.length > 0) {
            const currentSlide = slides[0];
            if (currentSlide.ImageSlide && currentSlide.ImageSlide.length > 0) {
                setMediaType('image');
            } else if (currentSlide.VideoSlide && currentSlide.VideoSlide.length > 0) {
                setMediaType('video');
            }
        }
    }, [slides]);

    // Slide logic
    useEffect(() => {
        if (!isPlaying || slides.length === 0) return

        const durations = duration

        if (slides) {

            const slide = slides[0];
            const videos = slide.VideoSlide || [];
            const images = slide.ImageSlide || [];
            console.log(images)

            if (mediaType === 'video' && videos.length > 0 && mediaIndex < videos.length) {
                const video = videoRef.current;


                if (video && video.src) {
                    console.log("Trying to play video:", video.src)

                    if (video && video.audioTracks && video.audioTracks.length > 0) {
                        audio.pause()
                    } else {
                        audio.play()
                    }

                    video.play().catch(err => {
                        console.error("Video playback error:", err)
                    })

                    const handleEnded = () => {
                        if (mediaIndex + 1 < videos.length) {
                            setMediaIndex(mediaIndex + 1)
                        } else if (images.length > 0) {
                            setMediaType('image')
                            setMediaIndex(0)
                        } else {
                            setMediaIndex(0)

                        }
                    }

                    video.addEventListener("ended", handleEnded)

                    return () => {
                        video.removeEventListener("ended", handleEnded)
                        video.pause()
                    }
                }
            }
            else if (mediaType === 'image' && images.length > 0 && mediaIndex < images.length) {

                const currentImage = images[mediaIndex]

                const image = imageRef.current
                if (image && image.src) {
                    console.log("Trying to play video:", image.src)

                    audio.play()
                }

                const img = new Image();    // create an off-screen image
                img.src = `${url}/stream/${currentImage.filename}`;

                // attach your callback **before** or **immediately after** setting src
                img.onload = () => {
                    console.log('✅ Image is fully loaded and ready to render')
                    setLoadImage(true)
                    timeoutRef.current = setTimeout(() => {
                        if (mediaIndex + 1 < images.length) {
                            setMediaIndex(mediaIndex + 1)
                            setLoadImage(false)
                            console.log("load finished")
                        } else if (videos.length > 0) {
                            setMediaType('video')
                            setMediaIndex(0)
                        } else {
                            setMediaIndex(0)
                        }
                    }, durations)

                }


                img.onerror = () => {
                    console.error('🚫 Failed to load the image')
                    timeoutRef.current = setTimeout(() => {
                        if (mediaIndex + 1 < images.length) {
                            setMediaIndex(mediaIndex + 1)

                            console.log("load finished")
                        } else if (videos.length > 0) {
                            setMediaType('video')
                            setMediaIndex(0)
                        } else {
                            setMediaIndex(0)
                            setLoadImage(true)
                        }
                    }, durations)
                }


                return () => clearTimeout(timeoutRef.current)
            }

        }
    }, [isPlaying, slides, mediaType, mediaIndex, loadImage])





    if (!slides.length || !duration) {
        return <LoadingPage />
    }

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-white ">

            {
                click &&

                <div
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 cursor-default"
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



            {slides.length > 0 && (() => {
                const currentSlide = slides[0];
                const images = currentSlide.ImageSlide || []
                const videos = currentSlide.VideoSlide || []

                const currentImage = images[mediaIndex]
                const currentVideo = videos[mediaIndex]

                return (
                    <>
                        {mediaType === 'image' && currentImage?.filename && (
                            <img
                                ref={imageRef}
                                key={currentImage.filename}
                                src={`${url}/stream/${currentImage.filename}`}
                                alt={`Slide ${mediaIndex + 1}`}
                                onLoad={() => setLoadImage(true)}
                                className={`absolute cursor-none inset-0 w-full h-full object-contain transition-opacity duration-1000 ease-in-out opacity-100 z-0 bg-white`}
                            />
                        )}

                        {mediaType === 'video' && currentVideo?.filename && (
                            <video
                                ref={videoRef}
                                key={currentVideo.filename}
                                src={`${url}/stream/${currentVideo.filename}`}
                                loop={images.length === 0 && videos.length === 1}
                                autoPlay
                                className="absolute cursor-none inset-0 w-full h-full object-contain transition-opacity duration-1000 ease-in-out opacity-100 z-0 bg-white"
                            />
                        )}
                    </>
                )
            })()}




            {/* Play/Pause overlay shown briefly on Enter */}
            {showControls && (
                <div className="absolute top-[50%] left-[50%] text-white text-lg bg-black bg-opacity-60 px-4 py-2 rounded">
                    {isPlaying ? <i className="bi bi-pause-fill w-80"></i> : <i className="bi bi-play-fill w-80"></i>}
                </div>
            )}
        </div>
    );
}
