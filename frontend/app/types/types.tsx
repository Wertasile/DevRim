import type { ReactNode } from "react";

export type User = {
    googleId: string,
    email: string;
    family_name: string;
    given_name: string;
    _id: string;
    name: string;
    picture: string;

}

export type Token = {
    accessToken : string;
    refreshToken : string;
    idToken : string;
}

export type Blog = {
    _id: string;
    title: string;
    summary : string;
    content: object;
    releaseDate: string;
}

export type Chat = {
    _id:string,
    chatName: string,
    isGroupChat: boolean;
    users: User[];
    created_at: string;
    updatedAt: string;
}

export type Message = {
    _id:string,
    sender: string,
    content: string,
    chat: string;
    created_at: string;
    updated_at: string;
}