import React, { useCallback, useState } from 'react'

import { useDropzone, FileRejection, DropEvent } from 'react-dropzone'
import { FiUpload } from 'react-icons/fi'

import './styles.css'

type OnDropCallback = <T extends File>(acceptedFiles: T[], fileRejections: FileRejection[], event: DropEvent) => void

interface Props {
  onFileUploaded: (file: File) => void
}

const Dropzone: React.FC<Props> = ({ onFileUploaded }) => {
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null)

  const onDrop = useCallback<OnDropCallback>(acceptedFiles => {
    const file = acceptedFiles[0]

    const url = URL.createObjectURL(file)

    setSelectedFileUrl(url)
    onFileUploaded(file)
  }, [])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: 'image/*'
  })

  return (
    <div className='dropzone' {...getRootProps()}>
      <input {...getInputProps()} accept="image/*" />
      {
        selectedFileUrl
          ? <img src={selectedFileUrl} alt="Point thumbnail" />
          : (
            <p>
              <FiUpload />
              Imagem do estabelecimento
            </p>
          )
      }

    </div>
  )
}

export default Dropzone