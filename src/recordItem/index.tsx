import React, { FunctionComponent, useState, useEffect, useCallback } from 'react'
import waveSurfer from 'wavesurfer.js'
import { Button } from 'antd'



const RecordItem: FunctionComponent<{blob: Blob | null}> = ({blob}) => {
    let [enableButton, setEnableButton] = useState(true)
    let waveSurferInstance:any
    let waveRef = React.createRef<HTMLDivElement>()    

    const initWaveSurfer = useCallback((blob: Blob | null) => {
       
        let container: HTMLElement | string = ''
        if(!!waveRef.current) {
            container = waveRef.current
        }
        waveSurferInstance = waveSurfer.create({
            container,
            waveColor: 'violet',
            progressColor: 'purple',
            scrollParent: true
        });

        waveSurferInstance.loadBlob(blob)
        
    }, [enableButton]) 
    
    useEffect(() => {
        initWaveSurfer(blob)
        waveSurferInstance.on('ready', () => {
            setEnableButton(false)
        })
    }, [])

    const handleTogglePlay = useCallback(() => {
            waveSurferInstance.playPause()
    },[])


    return (
        <div className="record-item">
            <div ref={waveRef}></div>
            <div>
                <Button type='primary' disabled={enableButton} onClick={handleTogglePlay}>play/pause</Button>
            </div>
        </div>
    )
}

export default RecordItem