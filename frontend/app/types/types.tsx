import type { ReactNode } from "react";

export type List = {
  _id: string;
  user: User;
  name: string;
  blogs: Blog[]
}

// start of better auth properties

export type User = {
    _id: string;              //
    name: string;             //
    picture: string;          //
    created_at: string;       //
    updatedAt: string;        //
    email: string;            //
    emailVerified: boolean,   //
    family_name: string;
    given_name: string;
    googleId: string,
    image: string;
    lists: List[];
    liked: Blog[];
    following: User[];
    followers: User[];
    byline: string;
    about: string;
    requestsSent: string[]
    requestsReceived: string[]
    connections : string[]
    communities: Community[]
}

export type Session = {
  id: string;               // Unique identifier for each session (PK)
  userId: string;           // The ID of the user (FK)
  token: string;            // The unique session token
  expiresAt: Date;          // The time when the session expires
  ipAddress?: string;       // The IP address of the device (optional)
  userAgent?: string;       // The user agent information of the device (optional)
  createdAt: Date;          // Timestamp of when the session was created
  updatedAt: Date;          // Timestamp of when the session was updated
};

export type Account = {
  _id: string;                      // Unique identifier for each account (PK)
  userId: string;                  // The ID of the user (FK)
  accountId: string;               // The ID of the account from the SSO or equals userId for credential accounts
  providerId: string;              // The ID of the provider
  accessToken?: string;            // Access token returned by the provider (optional)
  refreshToken?: string;           // Refresh token returned by the provider (optional)
  accessTokenExpiresAt?: Date;     // When the access token expires (optional)
  refreshTokenExpiresAt?: Date;    // When the refresh token expires (optional)
  scope?: string;                  // The scope of the account (optional)
  idToken?: string;                // ID token returned from the provider (optional)
  password?: string;               // Password for credential-based accounts (optional)
  createdAt: Date;                 // Timestamp of when the account was created
  updatedAt: Date;                 // Timestamp of when the account was updated
};

// end of better auth properties

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
  replyTo?: Comment | null;
  createdAt?: string;
  updatedAt?: string;
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
  community?: {
    _id: string;
    title: string;
  };
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

export type BlogScore = {
  _id: string;
  score: number;
  blog: Blog;
}

export type Trending = {
    _id: string;
    type: string;
    posts: BlogScore[];
    updatedAt: string;
}

export type Community = {
    _id: string;
    title: string;
    description: string;
    creator: User;
    moderators: User[];
    rules: string[];
    picture: string;
    members: User[];
    posts: Blog[];
    topics: string[];
    createdAt: string;
    updatedAt: string;
}