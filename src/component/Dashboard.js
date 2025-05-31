import React, { useEffect, useState } from 'react'
import imageCompression from 'browser-image-compression'
import Header from './Header';

export default function Dashboard() {
    const [see, setSee] = useState(false)
    const url = process.env.REACT_APP_URL

    const [slider, setSlider] = useState(null)

    // Form data state: duration, compressed images, videos
    const [create, setCreate] = useState({
        duration: '',
        image: [], // compressed images will go here
        video: []
    });

    const [progress, setProgress] = useState(0)
    const [statusMessage, setStatusMessage] = useState('')

    // Fetch sliders on mount
    useEffect(() => {
        fetch(`${url}/getSliders`, {
            method: 'GET',
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                if (data.success === true) {
                    setSlider(data.sliders)
                } else {
                    alert(data.message)
                }
            })
            .catch(err => {
                console.log('Error fetching in checkauth', err)
            })
    }, [url])

    // Handle duration input and file input changes
    const Create = async (e, key) => {
        const { value, files, type } = e.target;

        if (type === 'file' && files.length > 0) {
            if (key === 'image') {
                setProgress(0);
                setStatusMessage('Compressing images...');
                const compressedFiles = [];

                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const options = {
                        maxSizeMB: 1,
                        maxWidthOrHeight: 1920,
                        useWebWorker: true
                    };

                    try {
                        const compressedBlob = await imageCompression(file, options);

                        // ✅ Convert Blob to File
                        const newFile = new File([compressedBlob], file.name, {
                            type: file.type,
                            lastModified: Date.now()
                        });

                        compressedFiles.push(newFile)
                    } catch (error) {
                        console.error('Compression failed:', error)
                        compressedFiles.push(file); // fallback
                    }

                    setProgress(((i + 1) / files.length) * 100)
                }

                setStatusMessage('Compression complete!')
                setCreate(prev => ({
                    ...prev,
                    image: [...(prev.image || []), ...compressedFiles]
                }));
            }
            else if (key === 'video') {
                // No compression for videos, just append

                const VideosArray = []
                VideosArray.push(...Array.from(files))


                setCreate(prev => ({
                    ...prev,
                    video: [...(prev.video), ...VideosArray]
                }));

            }
        } else {
            // Normal input (e.g. duration)
            setCreate(prev => ({
                ...prev,
                [key]: value
            }));
        }
    };
    console.log(create.video)
    // Save handler to upload form data
    const Save = () => {
        // if (!create.duration) {
        //     alert('Please enter duration');
        //     return;
        // }

        const formData = new FormData()
        formData.append('duration', create.duration)

        create.image.forEach(file => {
            formData.append('ImageSlide', file);
        });


        create.video.forEach(file => {
            formData.append('VideoSlide', file)
        })

        fetch(`${url}/create-slide`, {
            method: 'POST',
            credentials: 'include',
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert(data.message)
                    setSee(false)
                    setCreate({ duration: '', image: [], video: [] })
                    setProgress(0)
                    setStatusMessage('')
                    window.location.reload()

                } else {
                    alert(data.message)
                }
            })
            .catch(() => alert('Trouble connecting to server'))
    };


    // Delete images

    const Delete = (id, filename, types) => {
        fetch(`${url}/delete-file`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ id, type: types, filename })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert(data.message)
                    window.location.reload()

                } else {
                    alert(data.message)
                }
            })
            .catch(() => alert('Trouble connecting to server'));
    }

    return (
        <div>
            <Header />
            <section className="bg-gradient-to-br from-blue-200 to-blue-5000 h-[100vh]">
                <main className="w-full py-6 px-4 flex-grow ">
                    <h3 className="text-center text-2xl font-semibold mb-6">Sliders</h3>

                    <div className="w-full mt-auto pb-3 px-4 sm:px-6 md:px-8">
                        <div>
                            <div className="flex justify-end pt-4 pr-4">
                                <button
                                    className="bg-blue-800 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded shadow"
                                    onClick={() => setSee(true)}
                                >
                                    Upload Images and Videos
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Slider Table */}
                    <div className="overflow-x-auto shadow-2xl mt-20">
                        <table className="w-full text-sm text-left rounded-lg overflow-hidden">
                            <thead className="bg-gray-200 text-gray-700 uppercase text-xs">
                                <tr>
                                    <th className="p-3">S.No</th>
                                    <th className="p-3">Duration</th>

                                    <th className="p-3 ">Images</th>
                                    <th className="p-3">Video</th>

                                </tr>
                            </thead>
                            <tbody>
                                {slider &&
                                    slider.map((slide, index) => (
                                        <tr
                                            key={index}
                                            className={`${slide.id % 2 === 0 ? 'bg-white' : 'bg-blue-50'} border-b border-gray-200`}
                                        >
                                            <td className="p-3 font-semibold">{index + 1}</td>
                                            <td className="p-3 uppercase">{slide.duration}</td>

                                            {/* Images */}
                                            <td className="p-3  ">
                                                {slide.ImageSlide && slide.ImageSlide.length > 0 ? (
                                                    slide.ImageSlide.map((img, i) => (
                                                        <div className='flex justify-start items-center' key={i}>
                                                            <img className='my-6'
                                                                key={i}
                                                                src={`${url}/${img.filepath}`}
                                                                alt={`Slide Image ${i + 1}`}
                                                                style={{ width: '50px', height: '50px', marginRight: '5px' }}
                                                            />
                                                            <i className="bi bi-trash-fill mx-2 px-1 text-danger text-red-600" role="button" onClick={() => Delete(slide.id, img.filename, 'ImageSlide')}></i>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span>No Images</span>
                                                )}
                                            </td>

                                            {/* videos */}

                                            <td className="p-3  ">
                                                {slide.VideoSlide && slide.VideoSlide.length > 0 ? (
                                                    slide.VideoSlide.length > 0 && slide.VideoSlide.map((video, i) => (
                                                        <div className='flex justify-start items-center' key={i}>
                                                            <video className='my-6'
                                                                key={i}
                                                                src={`${url}/${video.filepath}`}
                                                                alt={`Slide Image ${i + 1}`}
                                                                style={{ width: '50px', height: '50px', marginRight: '5px' }}
                                                            />
                                                            <i className="bi bi-trash-fill mx-2 px-1 text-danger text-red-600" role="button" onClick={() => Delete(slide.id, video.filename, 'VideoSlide')}></i>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span>No Videos</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </main>

                {/* Upload Modal */}
                {see && (
                    <div className="fixed inset-0 z-30 flex justify-center items-center bg-white/75">
                        <div className="w-full max-w-3xl max-h-[90vh] overflow-auto bg-white rounded-lg shadow-lg p-6">
                            <h4 className="text-center text-info text-2xl font-semibold mb-6">Upload Images and Videos</h4>

                            <div className="flex flex-wrap -mx-2">
                                <div className="w-full md:w-1/2 px-2 mb-4">
                                    <label className="block text-info font-medium mb-1">Duration:</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-info"
                                        value={create.duration}
                                        onChange={e => Create(e, 'duration')}
                                    />
                                </div>

                                <div className="w-full md:w-1/2 px-2 mb-4">
                                    <label className="block text-info font-medium mb-1">Image Upload:</label>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-info"
                                        onChange={e => Create(e, 'image')}
                                    />
                                    {create.image.length > 0 && (
                                        <ul className="mt-2 text-sm text-gray-600">
                                            {create.image.map((file, index) => (
                                                <li key={index}>{file.name}</li>
                                            ))}
                                        </ul>
                                    )}
                                    {progress > 0 && <p>Compression Progress: {progress.toFixed(0)}%</p>}
                                    {statusMessage && <p>{statusMessage}</p>}
                                </div>
                            </div>

                            <div className="flex flex-wrap -mx-2 gap-7">
                                <div className="w-full md:w-1/2 px-2 mb-4">
                                    <label className="block text-info font-medium mb-1">Video Upload:</label>
                                    <input
                                        accept="video/mp4,video/webm,video/ogg"
                                        type="file"
                                        multiple
                                        className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-info"
                                        onChange={e => Create(e, 'video')}
                                    />
                                    {create.video.length > 0 && (
                                        <ul className="mt-2 text-sm text-gray-600">
                                            {create.video.map((file, index) => (
                                                <li key={index}>{file.name}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-between mt-8">
                                <button
                                    onClick={() => {
                                        setSee(false);
                                        setCreate({ duration: '', image: [] });
                                        setProgress(0);
                                        setStatusMessage('');
                                    }}
                                    className="bg-gray-100 hover:bg-gray-200 text-black font-semibold py-2 px-4 rounded"
                                >
                                    Close
                                </button>
                                <button onClick={Save} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold py-2 px-4 rounded border border-white">
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </div >
    );
}
