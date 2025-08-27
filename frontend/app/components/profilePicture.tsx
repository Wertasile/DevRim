import React from 'react'
import type { User } from '~/types/types'

type ProfilePictureProps = {
    src: String
    user: User
}
const ProfilePicture = ( {src, user} : ProfilePictureProps) => {

    const handleNav = () => {
        window.location.href = `/profile/${user._id}`
    }
    return (
        <img src={`${src}`} width={48} onClick={handleNav}></img>
    )
}

export default ProfilePicture