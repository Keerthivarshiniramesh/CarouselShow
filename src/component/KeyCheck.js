import React, { useEffect, useRef, useState } from 'react'

export default function KeyCheck() {
    const [keypress, setKeypress] = useState('')


    window.addEventListener('keydown', (e) => {
        if (e.key) {
            setKeypress(e.key)
        }
    })


    return (
        <div>
            <h1>Latest Type Letter : {keypress}</h1>
        </div>
    )
}
