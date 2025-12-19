import React, { useState, useEffect } from 'react'
import NaturalEditor from '~/components/tiptap/naturalEditor'
import { useUser } from '~/context/userContext'
import type { Community, Blog } from '~/types/types';
import Sidebar from '~/components/Sidebar';
import { X, FileText } from 'lucide-react';
import type { Route } from './+types/blogEdit';

const API_URL = import.meta.env.VITE_API_URL;

export default function BlogEdit({ params }: Route.ComponentProps) {

  const {user} = useUser()

  const [post, setPost] = useState<any | null>(null)
  const [title, setTitle] = useState<string>("")
  const [summary, setSummary] = useState<string>("")
  const [showSummaryInput, setShowSummaryInput] = useState<boolean>(false)
  const [selectedCommunity, setSelectedCommunity] = useState<string>("")
  const [communities, setCommunities] = useState<Community[]>([])
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [originalPost, setOriginalPost] = useState<Blog | null>(null)

  // Fetch post data and communities
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch post
        const postResponse = await fetch(`${API_URL}/posts/${params.postId}`, {
          method: 'post',
          credentials: 'include',
        });
        
        if (!postResponse.ok) {
          throw new Error('Failed to fetch post');
        }
        
        const postData = await postResponse.json();
        setOriginalPost(postData);
        
        // Set initial values
        setTitle(postData.title || '');
        setSummary(postData.summary || '');
        if (postData.summary) {
          setShowSummaryInput(true);
        }
        
        // Reconstruct content with title as first heading
        if (postData.content) {
          const contentWithTitle = {
            type: 'doc',
            content: [
              {
                type: 'heading',
                attrs: { level: 1 },
                content: [{ type: 'text', text: postData.title || '' }]
              },
              ...(postData.content.content || [])
            ]
          };
          setPost(contentWithTitle);
        }
        
        // Set community if available from post data
        if (postData.community && postData.community._id) {
          setSelectedCommunity(postData.community._id);
        }
        
        // Fetch communities
        const communitiesResponse = await fetch(`${API_URL}/communities`, {
          method: 'get',
          credentials: 'include',
        });
        
        if (communitiesResponse.ok) {
          const communitiesData = await communitiesResponse.json();
          setCommunities(communitiesData);
          
          // If community wasn't set from post data, find it manually
          if (!selectedCommunity) {
            for (const comm of communitiesData) {
              if (comm.posts && Array.isArray(comm.posts)) {
                const postIds = comm.posts.map((p: Blog | string) => 
                  typeof p === 'string' ? p : p._id
                );
                if (postIds.includes(params.postId)) {
                  setSelectedCommunity(comm._id);
                  break;
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        alert('Failed to load post. Redirecting...');
        window.location.href = '/blog';
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.postId]);

  // Verify user owns the post
  useEffect(() => {
    if (originalPost && user) {
      const postUserId = typeof originalPost.user === 'string' 
        ? originalPost.user 
        : originalPost.user._id;
      
      if (postUserId !== user._id) {
        alert('You can only edit your own posts');
        window.location.href = `/blog/${params.postId}`;
      }
    }
  }, [originalPost, user, params.postId]);

  const handleChange = (content: any) => {
    setPost(content)
  }

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
  }

  const handleSummaryChange = (newSummary: string) => {
    setSummary(newSummary)
  }

  const savePost = async() => {
    if (!selectedCommunity) {
      alert('Please select a community');
      return;
    }

    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    setIsSubmitting(true);

    try {
      // Remove title heading from content to avoid duplication
      let contentWithoutTitle = post;
      if (contentWithoutTitle?.content && Array.isArray(contentWithoutTitle.content)) {
        const contentNodes = contentWithoutTitle.content.filter((node: any, index: number) => {
          if (index === 0 && node.type === 'heading') {
            return false;
          }
          return true;
        });
        
        if (contentNodes.length === 0) {
          contentNodes.push({
            type: 'paragraph',
            content: []
          });
        }
        
        contentWithoutTitle = {
          ...contentWithoutTitle,
          content: contentNodes
        };
      }
      
      // Build request body
      const requestBody: any = {
        title: title.trim(),
        content: contentWithoutTitle,
        communityId: selectedCommunity,
        summary: summary.trim() || ''
      }
      
      const response = await fetch(`${API_URL}/posts/${params.postId}`, {
        method: 'put',
        credentials: 'include',
        headers: {
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to update post' }));
        throw new Error(errorData.error || 'Failed to update post');
      }

      window.location.href = `/blog/${params.postId}`
    } catch (error) {
      console.error('Error updating post:', error);
      alert(error instanceof Error ? error.message : 'Failed to update post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }
  
  if (isLoading) {
    return (
      <div className='min-h-screen bg-[#0a1118] flex items-center justify-center'>
        <div className='text-[#9aa4bd]'>Loading post...</div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[#0a1118]'>
      <div className='flex flex-row gap-6 px-6 py-8 mx-auto max-w-[1400px]'>
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className='flex-grow flex flex-col gap-6'>
          {/* Header */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-lg bg-[#5D64F4] flex items-center justify-center'>
                <FileText size={20} className='text-white' />
              </div>
              <h1 className='text-white text-2xl font-bold'>Edit Post</h1>
            </div>
            <div className='flex items-center gap-3'>
              <button
                onClick={() => setShowSummaryInput(!showSummaryInput)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  showSummaryInput 
                    ? 'bg-[#5D64F4] text-white' 
                    : 'bg-[#121b2a] border border-[#1f2735] text-[#9aa4bd] hover:border-[#31415f]'
                }`}
              >
                {showSummaryInput ? 'Hide Summary' : 'Add Summary'}
              </button>
              <button
                onClick={savePost}
                disabled={isSubmitting || !selectedCommunity || !title.trim()}
                className='px-6 py-2 bg-[#5D64F4] hover:bg-[#4d54e4] rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Community Selection - Required */}
          <div className='bg-[#0f1926] border border-[#1f2735] rounded-lg p-4'>
            <label htmlFor="community" className='text-white font-medium text-sm mb-2 block'>
              Select Community <span className='text-red-400'>*</span>
            </label>
            <select
              id="community"
              value={selectedCommunity}
              onChange={(e) => setSelectedCommunity(e.target.value)}
              required
              className='w-full px-4 py-3 bg-[#121b2a] border border-[#1f2735] rounded-lg text-white placeholder-[#9aa4bd] focus:outline-none focus:border-[#31415f] transition-colors'
            >
              <option value="">Choose a community...</option>
              {communities.map((community) => (
                <option key={community._id} value={community._id}>
                  {community.title}
                </option>
              ))}
            </select>
            {!selectedCommunity && (
              <p className='text-[#9aa4bd] text-xs mt-2'>You must select a community to publish your post</p>
            )}
          </div>

          {/* Summary Input - Conditional */}
          {showSummaryInput && (
            <div className='bg-[#0f1926] border border-[#1f2735] rounded-lg p-4'>
              <div className='flex items-center justify-between mb-2'>
                <label htmlFor="summary" className='text-white font-medium text-sm'>
                  Summary
                </label>
                <button
                  onClick={() => {
                    setShowSummaryInput(false);
                    setSummary('');
                  }}
                  className='text-[#9aa4bd] hover:text-white transition-colors'
                >
                  <X size={16} />
                </button>
              </div>
              <input
                type='text'
                id='summary'
                name="summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder='Add a brief summary of your post (optional)'
                maxLength={250}
                className='w-full px-4 py-2 bg-[#121b2a] border border-[#1f2735] rounded-lg text-white placeholder-[#9aa4bd] focus:outline-none focus:border-[#31415f] transition-colors'
              />
              <p className='text-[#9aa4bd] text-xs mt-1'>{summary.length}/250</p>
            </div>
          )}

          {/* Editor */}
          <div className='flex-grow'>
            <NaturalEditor 
              content={post} 
              handleChange={handleChange}
              onTitleChange={handleTitleChange}
              onSummaryChange={handleSummaryChange}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

