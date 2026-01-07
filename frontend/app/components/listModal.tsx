import React, { useEffect, useState } from 'react'
import fetchList from '~/apiCalls/list/fetchList';
import type { List, User } from '~/types/types'
import { Edit, Trash2, X } from 'lucide-react'
import EditListModal from './EditListModal'
import RemoveFromList from '~/apiCalls/list/removeFromList'

type ListModalProps = {
    list : List | undefined;
    setViewListModal: React.Dispatch<React.SetStateAction<boolean>>
    setLists?: React.Dispatch<React.SetStateAction<List[] | undefined>>
    profile?: User | undefined
    user?: User | undefined
}

const API_URL = import.meta.env.VITE_API_URL;

const ListModal = ({list, setViewListModal, setLists, profile, user}: ListModalProps) => {

  const [listData, setListData] = useState<List>()
  const [editListModal, setEditListModal] = useState(false)
  const [deletingListId, setDeletingListId] = useState<string | null>(null)
  const [removingPostId, setRemovingPostId] = useState<string | null>(null)
  
  const fetchListData = async (listId: string) => {
    console.log("ACTIVATED LIST MODAL")
    const data = await fetchList(listId)
    console.log(data)
    setListData(data)
  }

  const fetchLists = async () => {
    if (!profile?._id || !setLists) return
    const response = await fetch(`${API_URL}/lists/user/${profile._id}`, {
        method: 'get',
        credentials: 'include'
    })
    const data = await response.json()
    setLists(data)
  }

  const handleDeleteList = async () => {
    if (!listData?._id) return
    
    if (!confirm('Are you sure you want to delete this collection? This action cannot be undone.')) {
        return
    }

    setDeletingListId(listData._id)
    try {
        const response = await fetch(`${API_URL}/lists/${listData._id}`, {
            method: 'delete',
            credentials: 'include'
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Failed to delete collection' }));
            throw new Error(errorData.error || 'Failed to delete collection');
        }

        if (setLists && profile) {
            await fetchLists()
        }
        setViewListModal(false)
    } catch (error) {
        console.error('Error deleting list:', error);
        alert(error instanceof Error ? error.message : 'Failed to delete collection. Please try again.');
    } finally {
        setDeletingListId(null)
    }
  }

  const handleRemovePost = async (postId: string) => {
    if (!listData?._id) return
    
    setRemovingPostId(postId)
    try {
        await RemoveFromList(listData._id, postId)
        await fetchListData(listData._id)
        if (setLists && profile) {
            await fetchLists()
        }
    } catch (error) {
        console.error('Error removing post from list:', error);
        alert('Failed to remove post from collection. Please try again.');
    } finally {
        setRemovingPostId(null)
    }
  }

  useEffect(() => {
    if (list?._id) {
      fetchListData(list._id)
    }
  }, [list])
  
  const isOwnList = user && listData && (typeof listData.user === 'string' ? listData.user === user._id : listData.user._id === user._id)

  return (
    <>
      <div className='fixed z-50 flex h-[100vh] w-[100vw] justify-center items-center bg-black/60 backdrop-blur-sm' onClick={() => setViewListModal(false)}>
          <div className='w-[500px] max-h-[600px] bg-[#EDEDE9] border border-[#000000] flex flex-col gap-4 p-6 shadow-xl' onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3>{listData?.name}</h3>
              <div className="flex items-center gap-2">
                {isOwnList && (
                  <>
                    <button
                      onClick={() => {
                        setEditListModal(true)
                      }}
                      className='p-1.5 hover:bg-[#D6D6CD] rounded-lg transition-colors'
                      title="Edit collection"
                    >
                      <Edit size={16} className='text-[#979797] hover:text-black' />
                    </button>
                    <button
                      onClick={handleDeleteList}
                      disabled={deletingListId === listData?._id}
                      className='p-1.5 hover:bg-[#D6D6CD] rounded-lg transition-colors disabled:opacity-50'
                      title="Delete collection"
                    >
                      <Trash2 size={16} className='text-red-600 hover:text-red-700' />
                    </button>
                  </>
                )}
                <button 
                  onClick={() => setViewListModal(false)}
                  className="icon"
                >
                  <X size={20}/>
                </button>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 overflow-y-auto max-h-[450px]">
              {listData?.blogs && listData.blogs.length > 0 ? (
                listData.blogs.map( (blog, index)  => (
                  <div 
                    key={blog._id || index} 
                    className="group flex items-center justify-between p-3 hover:bg-[#D6D6CD] rounded-lg border border-[#000000] transition-colors" 
                  >
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => {window.location.href=`/blog/${blog._id}`}}
                    >
                      <div className="text-black font-medium">{blog.title}</div>
                      {blog.summary && (
                        <div className="text-[#979797] text-sm mt-1 line-clamp-2">{blog.summary}</div>
                      )}
                    </div>
                    {isOwnList && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemovePost(blog._id)
                        }}
                        disabled={removingPostId === blog._id}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-[#C6C6BD] rounded transition-all disabled:opacity-50"
                        title="Remove from collection"
                      >
                        <Trash2 size={14} className='text-red-600 hover:text-red-700' />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-[#979797] text-center py-8">No blogs in this collection</div>
              )}
            </div>
          </div>
      </div>
      {editListModal && listData && setLists && profile &&
        <EditListModal 
          setEditListModal={setEditListModal} 
          editListModal={editListModal} 
          setLists={setLists} 
          profile={profile} 
          list={listData} 
        />
      }
    </>
  )
}

export default ListModal