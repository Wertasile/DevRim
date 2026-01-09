import React, { useState, useEffect } from 'react'
import NaturalEditor from '~/components/tiptap/naturalEditor'
import { useUser } from '~/context/userContext'
import type { Community, Blog } from '~/types/types';
import { X } from 'lucide-react';
// @ts-ignore - JSX component
import FileInput from '~/components/cropping/FileInput';
// @ts-ignore - JSX component
import ImageCropper from '~/components/cropping/ImageCropper';
import { createImage, blobToFile } from '~/utils/cropImage';
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
  const [coverImage, setCoverImage] = useState<string>("")
  const [showCoverCropper, setShowCoverCropper] = useState<boolean>(false)
  const [imageToCrop, setImageToCrop] = useState<string>("")
  const [pendingCoverFile, setPendingCoverFile] = useState<File | null>(null)

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
        
        // Set cover image if it exists
        if (postData.coverImage) {
          setCoverImage(postData.coverImage);
        }
        
        // Set content directly (title is now separate)
        if (postData.content) {
          setPost(postData.content);
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

  // Upload cover image function
  const uploadCoverImage = async (file: File): Promise<string> => {
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const filename = `post-covers/${user?._id || 'user'}-${timestamp}.${fileExtension}`;
      
      // Get presigned URL
      const presignUrl = `${API_URL}/s3/post-cover-upload?filename=${encodeURIComponent(filename)}&contentType=${encodeURIComponent(file.type)}`;
      
      const res = await fetch(presignUrl, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Failed to get presigned URL:', res.status, errorText);
        throw new Error(`Failed to get upload URL: ${res.status} ${errorText}`);
      }
      
      const data = await res.json();
      const { uploadUrl, fileUrl } = data;
      
      if (!uploadUrl) {
        throw new Error('No upload URL received from server');
      }

      // Upload to S3
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!uploadRes.ok) {
        const errorText = await uploadRes.text().catch(() => 'Unknown error');
        console.error('S3 upload failed:', uploadRes.status, errorText);
        throw new Error(`Failed to upload cover image to S3: ${uploadRes.status} ${errorText}`);
      }

      return fileUrl;
      
    } catch (error) {
      console.error('Cover image upload failed:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server. Please check your internet connection.');
      }
      throw error;
    }
  };

  // Handle cover image selection
  const handleCoverImageSelected = (imageSrc: string) => {
    if (!imageSrc) {
      return;
    }
    setImageToCrop(imageSrc);
    setShowCoverCropper(true);
  };

  // Handle cover crop completion
  const handleCoverCropDone = async (croppedAreaPixels: { x: number; y: number; width: number; height: number } | null) => {
    if (!croppedAreaPixels || !imageToCrop) {
      setShowCoverCropper(false);
      setImageToCrop('');
      return;
    }

    try {
      // Create cropped image blob
      const croppedBlob = await createImage(imageToCrop, croppedAreaPixels);
      
      // Convert blob to file
      const croppedFile = blobToFile(croppedBlob, `cover-${Date.now()}.jpg`);

      // Validate file size (max 5MB)
      if (croppedFile.size > 5 * 1024 * 1024) {
        alert('Cropped image size must be less than 5MB');
        setShowCoverCropper(false);
        setImageToCrop('');
        return;
      }

      // Store the cropped file for later upload (when user clicks Save)
      setPendingCoverFile(croppedFile);
      
      // Create preview URL from the cropped file
      const previewBlobUrl = URL.createObjectURL(croppedFile);
      setCoverImage(previewBlobUrl);
      
      // Clean up
      setShowCoverCropper(false);
      if (imageToCrop.startsWith('blob:')) {
        URL.revokeObjectURL(imageToCrop);
      }
      setImageToCrop('');
    } catch (error) {
      console.error('Crop failed:', error);
      alert(error instanceof Error ? error.message : 'Failed to crop image. Please try again.');
      setShowCoverCropper(false);
      setImageToCrop('');
    }
  };

  // Handle cover crop cancellation
  const handleCoverCropCancel = () => {
    setShowCoverCropper(false);
    if (imageToCrop.startsWith('blob:')) {
      URL.revokeObjectURL(imageToCrop);
    }
    setImageToCrop('');
  };

  // Handle remove cover image
  const handleRemoveCoverImage = () => {
    if (coverImage && coverImage.startsWith('blob:')) {
      URL.revokeObjectURL(coverImage);
    }
    setCoverImage('');
    setPendingCoverFile(null);
  };

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
      // Upload cover image if there's a pending file
      let finalCoverImageUrl = coverImage;
      
      if (pendingCoverFile) {
        try {
          finalCoverImageUrl = await uploadCoverImage(pendingCoverFile);
          
          // Clean up the preview blob URL
          if (coverImage.startsWith('blob:')) {
            URL.revokeObjectURL(coverImage);
          }
          
          setCoverImage(finalCoverImageUrl);
          setPendingCoverFile(null);
        } catch (uploadError) {
          console.error('Failed to upload cover image:', uploadError);
          alert(uploadError instanceof Error ? uploadError.message : 'Failed to upload cover image. Please try again.');
          setIsSubmitting(false);
          return;
        }
      }
      
      // Build request body
      // Content already doesn't include title since it's now separate
      const requestBody: any = {
        title: title.trim(),
        content: post,
        communityId: selectedCommunity,
        summary: summary.trim() || ''
      }
      
      // Include cover image: send empty string if removed, URL if exists, undefined if never set
      if (finalCoverImageUrl) {
        requestBody.coverImage = finalCoverImageUrl;
      } else if (originalPost?.coverImage && !coverImage) {
        // User removed existing cover image
        requestBody.coverImage = '';
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
      <div className='min-h-screen bg-[#EDEDE9] flex items-center justify-center'>
        <div className='text-black'>Loading post...</div>
      </div>
    );
  }

  return (
    <div className='min-h-screen'>
      <div className='flex flex-row gap-6 p-[5px] mx-auto max-w-[1400px]'>

        {/* Main Content */}
        <div className='flex-grow flex flex-col gap-6 p-[20px]'>
          {/* Header Section */}
          <div className='flex flex-col gap-[10px] w-full'>
            
            {/* Top Actions Bar */}
            <div className='flex flex-wrap items-center justify-between gap-4'>
              {/* Community Selection */}
              <div className='flex-1 min-w-[280px] max-w-[400px]'>
                <label htmlFor="community" className='hidden'>
                  COMMUNITY <span className='text-[#E95444]'>*</span>
                </label>
                <select
                  id="community"
                  value={selectedCommunity}
                  onChange={(e) => setSelectedCommunity(e.target.value)}
                  required
                  className='community-select w-full px-4 py-2.5 bg-white border-2 border-[#000000] rounded-lg text-black font-medium text-sm cursor-pointer transition-all duration-200 hover:border-[#E95444] focus:outline-none focus:border-[#E95444] focus:ring-2 focus:ring-[#E95444] focus:ring-opacity-20 shadow-[0_2px_0_2px_rgba(0,0,0,1)] hover:shadow-[0_2px_0_2px_rgba(233,84,68,0.5)] focus:shadow-[0_2px_0_2px_rgba(233,84,68,0.8)]'
                >
                  <option value="">Choose a community...</option>
                  {communities.map((community) => (
                    <option key={community._id} value={community._id}>
                      {community.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className='flex gap-3'>
                <button
                  onClick={() => setShowSummaryInput(!showSummaryInput)}
                  className={`primary-btn flex duration-200 ${
                    showSummaryInput 
                      ? 'bg-[#E95444] hover:bg-[#D84335]' 
                      : 'bg-white text-black hover:bg-[#EDEDE9]'
                  }`}
                >
                  {showSummaryInput ? 'HIDE SUMMARY' : 'ADD SUMMARY'}
                </button>
                <button
                  onClick={savePost}
                  disabled={isSubmitting || !selectedCommunity || !title.trim()}
                  className='primary-btn bg-[#E95444] hover:bg-[#D84335] border-2 border-[#000000] rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#E95444] shadow-md hover:shadow-lg'
                >
                  {isSubmitting ? 'SAVING...' : 'SAVE CHANGES'}
                </button>
                <div className='flex items-center justify-between'>
                  <label className='form-label hidden'>COVER IMAGE (OPTIONAL)</label>
                  {!coverImage && !showCoverCropper && (
                    <FileInput 
                      onImageSelected={handleCoverImageSelected} 
                      onError={(error: string) => alert(error)}
                      type="Cover Image"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Cover Image Section */}
              
          </div>

          {/* Cover Image Cropper Modal */}
          {showCoverCropper && imageToCrop && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white border-2 border-[#000000] p-6 max-w-4xl w-full rounded-lg shadow-2xl">
                <div className='flex items-center justify-between mb-4'>
                  <h2 className="text-xl font-semibold text-black">Crop Cover Image (2:1 Aspect Ratio)</h2>
                  <button
                    onClick={handleCoverCropCancel}
                    className='p-2 hover:bg-[#EDEDE9] rounded-lg transition-colors'
                  >
                    <X size={20} className='text-black' />
                  </button>
                </div>
                <ImageCropper
                  image={imageToCrop}
                  onCropDone={handleCoverCropDone}
                  onCropCancel={handleCoverCropCancel}
                  AR={2}
                />
              </div>
            </div>
          )}

          {/* Editor Section */}
          
          <NaturalEditor 
            content={post} 
            handleChange={handleChange}
            onTitleChange={handleTitleChange}
            onSummaryChange={handleSummaryChange}
            titleInput={
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  handleTitleChange(e.target.value);
                }}
                className="leading-tight min-w-full focus:outline-none placeholder:text-[#9ca3af] placeholder:opacity-60 p-8"
                style={{fontSize: '36px', fontWeight: 'bold', fontFamily: 'ManRope'}}
              />
            }
            coverImage={coverImage}
            handleRemoveCoverImage={handleRemoveCoverImage}
            setShowSummaryInput={setShowSummaryInput}
            showSummaryInput={showSummaryInput}
            summary={summary}
            setSummary={setSummary}
          />
          
        </div>
      </div>
    </div>
  )
}

