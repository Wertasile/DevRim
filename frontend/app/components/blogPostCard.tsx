import { Bookmark, CalendarDays, MessageCircle, Share2, ThumbsUp, Trash2, MoreVertical, CirclePlusIcon, CircleXIcon } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useUser } from '~/context/userContext';
import type { Comment, User, List } from '~/types/types';
import getAllList from '~/apiCalls/list/getAllLists';
import AddToList from '~/apiCalls/list/addToList';
import RemoveFromList from '~/apiCalls/list/removeFromList';

const API_URL = import.meta.env.VITE_API_URL;

type BlogPostProps = {
  id: string;
  title: string;
  postUser: User;
  comments: Comment[];
  likes: User[];
  summary : string;
  releaseDate: string;
  content: object;
  visualIndex?: number;
  coverImage?: string;
}

const BlogPostCard = ({
  id,
  title,
  releaseDate,
  summary,
  postUser,
  comments,
  likes,
  visualIndex = 0,
  coverImage
}: BlogPostProps) => {
  const formattedDate = (() => {
    const parsed = new Date(releaseDate);
    if (Number.isNaN(parsed.getTime())) return releaseDate;
    return parsed.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  })();

  const {user} = useUser()
  const [liked, setLiked] = useState<boolean>(false)
  const [likeCount, setLikeCount] = useState<number>(likes?.length || 0)
  const [showDeleteMenu, setShowDeleteMenu] = useState<boolean>(false)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [usersLists, setUsersLists] = useState<List[]>([])
  const [listModal, setListModal] = useState<boolean>(false)

  // Check if user has liked this blog
  useEffect(() => {
    if (user?._id && likes) {
      const isLiked = likes.some((like: User | string) => {
        const likeId = typeof like === 'string' ? like : like._id;
        return likeId === user._id;
      });
      setLiked(isLiked);
    }
    setLikeCount(likes?.length || 0);
  }, [user, likes]);

  // Fetch user's lists
  useEffect(() => {
    if (user?._id) {
      (async () => {
        const lists = await getAllList(user._id);
        setUsersLists(lists);
      })();
    }
  }, [user, id]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?._id) return;

    const method = liked ? 'delete' : 'put';

    try {
      const res = await fetch(`${API_URL}/users/like/${id}`, {
        method,
        credentials: 'include'
      });

      if (!res.ok) return;
      
      setLiked(!liked);
      setLikeCount(prev => liked ? prev - 1 : prev + 1);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleNav = () => {
    window.location.href=`/blog/${id}`
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`${API_URL}/posts/${id}`, {
        method: 'delete',
        credentials: 'include'
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to delete post' }));
        throw new Error(errorData.error || 'Failed to delete post');
      }

      // Reload the page or remove the card from view
      window.location.reload();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete post. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteMenu(false);
    }
  };

  const isOwnPost = user?._id === postUser._id;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDeleteMenu) {
        setShowDeleteMenu(false);
      }
      if (listModal) {
        setListModal(false);
      }
    };

    if (showDeleteMenu || listModal) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showDeleteMenu, listModal]);

  return (
    <div className="blog-card" onClick={handleNav}>

      <div className='flex flex-col justify-between py-[10px] gap-[10px] w-full'>
        <div className='flex justify-between w-full'>
          <div className='flex gap-[10px] p-[5px]'>
            <img src={postUser.picture} className="rounded-full" width={48} height={48} />
            <div className='flex flex-col'>
              <span className="text-small">{postUser._id === user?._id ? "Your publication" : postUser.name}</span>
              <span className="text-mini">{formattedDate}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isOwnPost && (
              <div className="relative">
                <button
                  className=""
                  aria-label="Post options"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteMenu(!showDeleteMenu);
                  }}
                >
                  <MoreVertical size={16} />
                </button>
                {showDeleteMenu && (
                  <div className="absolute right-0 top-full mt-2 bg-[#EDEDE9] border border-[#000000] rounded-lg shadow-lg z-50 min-w-[120px]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/edit/${id}`;
                      }}
                      className="w-full px-4 py-2 text-left text-black hover:bg-[#D6D6CD] rounded-t-lg flex items-center gap-2 text-sm transition-colors"
                    >
                      Edit
                    </button>
                    <div className="border-t border-[#000000]"></div>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="w-full px-4 py-2 text-left text-red-600 hover:bg-[#D6D6CD] rounded-b-lg flex items-center gap-2 text-sm transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div>{title}</div>
          <div className="flex gap-[25px]">

            <button
              className={`flex gap-[5px] items-center justify-center${liked ? 'blog-card__stat--liked' : ''}`}
              onClick={handleLike}
              aria-label={liked ? 'Unlike post' : 'Like post'}
              title={liked ? 'Unlike' : 'Like'}
            >
              <ThumbsUp 
                size={16} 
                className={liked ? 'fill-[#E95444]' : ''}
              />
              <div className={liked ? 'text-[#E95444]' : ''}>{likeCount}</div>
            </button>

            <div className="flex gap-[5px] items-center justify-center">
              <MessageCircle size={16}/>
              <div>{comments.length}</div>
            </div>

            <div className="flex items-center justify-center">
              {(() => {
                const isInCollection = usersLists?.some(list => 
                  list.blogs?.some(b => b._id === id)
                );
                const collectionsWithPost = usersLists?.filter(list => 
                  list.blogs?.some(b => b._id === id)
                ) || [];
                
                return (
                  <>
                    <button
                      className="flex"
                      aria-label="Save for later"
                      onClick={(e) => {
                        e.stopPropagation();
                        setListModal(!listModal);
                      }}
                    >
                      <Bookmark 
                        size={16} 
                        className={isInCollection ? 'fill-[#E95444]' : ''}
                      />
                    </button>
                  </>
                );
              })()}

              {listModal && (
                <div className="absolute bottom-full right-0 mb-2 flex flex-col bg-[#EDEDE9] border border-[#000000] gap-3 p-4 w-[250px] text-center text-sm z-50 max-h-[400px] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                  {(() => {
                    const collectionsWithPost = usersLists?.filter(list => 
                      list.blogs?.some(b => b._id === id)
                    ) || [];
                    const isInAnyCollection = collectionsWithPost.length > 0;
                    
                    return (
                      <>
                        {isInAnyCollection && (
                          <div className="mb-2 pb-2 border-b border-[#000000]">
                            <h4 className='text-[#5D64F4] text-xs font-semibold mb-1'>IN COLLECTIONS:</h4>
                            <div className="flex flex-col gap-1">
                              {collectionsWithPost.map((list) => (
                                <div 
                                  key={list._id}
                                  className="flex items-center justify-between p-2 bg-[#D6D6CD] rounded text-left"
                                >
                                  <span className="text-black text-xs flex-1 truncate">{list.name}</span>
                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      await RemoveFromList(list._id, id);
                                      const updatedLists = await getAllList(user?._id || null);
                                      setUsersLists(updatedLists);
                                    }}
                                    className="ml-2 p-1 hover:bg-[#C6C6BD] rounded transition-colors"
                                    title="Remove from collection"
                                  >
                                    <CircleXIcon size={14} className="text-red-600" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div>
                          {isInAnyCollection ? 'ADD TO MORE COLLECTIONS:' : 'ADD BLOG TO COLLECTION:'}
                        </div>
                        {usersLists && usersLists.length > 0 ? (
                          usersLists.map((list, index) => {
                            const isInThisCollection = list.blogs?.some(b => b._id === id);
                            if (isInThisCollection) return null;
                            
                            return (
                              <div 
                                key={list._id ?? index}
                                className='flex gap-2 justify-between items-center'
                              >
                                <div 
                                  className="hover:none w-full text-left px-3 py-2"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {list.name}
                                </div>
                                <div 
                                  className='icon h-fit px-2 py-2'
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    await AddToList(list._id, id);
                                    const updatedLists = await getAllList(user?._id || null);
                                    setUsersLists(updatedLists);
                                  }}
                                >
                                  <CirclePlusIcon size={16}/>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-[#979797] text-xs py-2">No collections yet</div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div> 
            
        </div>
      </div>

      {coverImage && (
        <div>
          <img src={coverImage} alt={title} loading="lazy" width={350}/>
        </div>
      )}
    </div>
  )
}

export default BlogPostCard