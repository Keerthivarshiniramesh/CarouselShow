import React, { createContext, useEffect, useState } from 'react'

export const DContext = createContext()
function Provider(props) {
    const apiurl = process.env.REACT_APP_URL;

    const [Auth, setAuth] = useState(null)


    useEffect(() => {

        if (apiurl) {


            fetch(`${apiurl}/checkauth`, {
                method: "GET",
                credentials: 'include'
            })
                .then(res => res.json())
                .then(data => {
                    console.log(data)
                    if (data.success === true) {
                        setAuth(data.user)
                    }
                    else {
                        setAuth(false)
                    }
                })
                .catch(err => {
                    console.log("error fetching in checkauth", err)
                })

        }

    }, [apiurl])




    const data = { Auth, setAuth, apiurl }
    return (



        <DContext.Provider value={data}>
            {props.children}
        </DContext.Provider>
    )
}

export default Provider