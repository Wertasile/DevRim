import React, { useRef } from 'react'

const FileInput = ({onImageSelected, type, onError}) => {

    const inputRef = useRef()

    const handleOnChange = (e) => {
        if (e.target.files && e.target.files.length > 0){
            const file = e.target.files[0]
            
            // Validate file type
            if (!file.type.startsWith('image/')) {
                if (onError) {
                    onError('Please select an image file')
                }
                return
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                if (onError) {
                    onError('Image size must be less than 5MB')
                }
                return
            }

            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = function (e) {
                onImageSelected(reader.result)
            }
            reader.onerror = function () {
                if (onError) {
                    onError('Failed to read image file')
                }
            }
        }
    }

    const onChooseImg = () => {
        inputRef.current.click()
    }
  return (
    <div>
        
        <input type='file' accept='image/*' ref={inputRef} onChange={handleOnChange} style={{display:"none"}}/>

        <button 
          type="button" 
          className='primary-btn bg-[#E95444]' 
          onClick={onChooseImg}
        >
          UPLOAD {type.toUpperCase()}
        </button>
    </div>
  )
}

export default FileInput