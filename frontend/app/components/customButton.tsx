import React from 'react'

type CustomButtonProps = {
  children:React.ReactNode;
  onClick:React.MouseEventHandler<HTMLButtonElement>
}
const CustomButton = ({children, onClick} : CustomButtonProps) => {
  return (
    <button onClick={onClick} className='primary-btn'>{children}</button>
  )
}

export default CustomButton