import  {useCallback} from 'react'
import {useDropzone} from 'react-dropzone'
import { Header, Icon } from 'semantic-ui-react';

interface Props{
    setFiles: (files: any) => void;
}

export default function DocumentUploadWidgetDropzone({setFiles}: Props) {
   
    const dzStyles = {
        border: 'dashed 3px #eee',
        borderColor: '#eee',
        borderRadius: '5px',
        paddingTop: '30px',
        textAlign: 'center' as 'center',
        height: '200px'
    }

    const dzActive = {
        borderColor: 'green',
    }

    const onDrop = useCallback((acceptedFiles: any) => {
        console.log(acceptedFiles[0]);
        setFiles(acceptedFiles.map((file: any) => Object.assign(file, {
            preview: URL.createObjectURL(file)
        })))
    }, [setFiles])


  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

  return (
    <div {...getRootProps()} style={isDragActive ? {...dzStyles, ...dzActive} : dzStyles}>
            <input {...getInputProps()} />
            <Icon name='hand point down' size='huge' />
            <Header content='Drag And Drop, Or Click To Browse' />
        </div>
  )
}   