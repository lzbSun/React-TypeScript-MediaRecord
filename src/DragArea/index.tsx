import React, { FunctionComponent, useCallback, useState } from 'react'
import './style.css'


const stopDefault = (e: any) => {
    e.stopPropagation()
    e.preventDefault()
}

const DragArea: FunctionComponent<{setSourceBlob: Function}> = ({ setSourceBlob }) => {
    const [dragInClass, setDragInClass] = useState('')
    const [fileName, setFileName] = useState('')
    let droppedFiles: any = null

    const dragOverEnter = useCallback(e => {
        stopDefault(e)
        setDragInClass('is-dragover')
    }, [])

    const dragLeave = useCallback(e => {
        stopDefault(e)
        setDragInClass('')
    }, [])

    const handleDrop = useCallback(e => {
        stopDefault(e)
        setDragInClass('')
        droppedFiles = e.dataTransfer.files
        setSourceBlob(droppedFiles[0])
        setFileName(droppedFiles[0].name)
    }, [])


    return (
           <form className={`drag-area ${dragInClass}`} method="post" action="" encType="multipart/form-data"
                onDrag={stopDefault} 
                onDragStart={stopDefault}
                onDragEnd={stopDefault} 
                onDragOver={dragOverEnter}
                onDragEnter={dragOverEnter} 
                onDragLeave={dragLeave}
                onDrop={handleDrop}>
             <strong>{ fileName ? fileName : 'Choose a file and drag it here.' }</strong>
            </form>
    )
}
export default DragArea
