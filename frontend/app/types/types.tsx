import type { ReactNode } from "react";

export type List = {
  _id: string;
  user: User;
  name: string;
  blogs: Blog[]
}

export type User = {
    googleId: string,
    email: string;
    family_name: string;
    given_name: string;
    _id: string;
    name: string;
    picture: string;
    lists: List[];
    liked: Blog[];
    following: User[];
    followers: User[];
    byline: string;
    about: string;
    requests: string[]
    connections : string[]
}

export type Token = {
    accessToken : string;
    refreshToken : string;
    idToken : string;
}

export type TipTapNode = {
  type: string;
  attrs?: Record<string, any>;
  content?: TipTapNode[];
  text?: string;
}

export type TipTapDoc = {
  type: "doc";
  content: TipTapNode[];
}

export type Comment = {
  _id: string;
  blog: Blog;
  comment: string;
  user: User;
}

export type Blog = {
  _id: string;
  title: string;
  summary: string;
  user: User;
  content: TipTapDoc;  // ✅ now strongly typed
  releaseDate: string;
  categories: string[] ;
  likes : User[];
  comments: Comment[];
}

export type Chat = {
    _id:string,
    chatName: string,
    isGroupChat: boolean;
    latestMessage: Message;
    users: User[];
    pinned: Message[];
    created_at: string;
    updatedAt: string;
}

export type Message = {
    _id:string,
    sender: User,
    content: string,
    chat: string;
    messageType: string;
    url: string;
    createdAt: string;
    updatedAt: string;
    reply: Message;
}