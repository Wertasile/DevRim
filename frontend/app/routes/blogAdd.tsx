import React, { useState, useEffect } from 'react'
import NaturalEditor from '~/components/tiptap/naturalEditor'
import { useUser } from '~/context/userContext'
import { useParams } from 'react-router-dom'
import type { Community } from '~/types/types';
import Sidebar from '~/components/Sidebar';
import { X, FileText, Image as ImageIcon } from 'lucide-react';
// @ts-ignore - JSX component
import FileInput from '~/components/cropping/FileInput';
// @ts-ignore - JSX component
import ImageCropper from '~/components/cropping/ImageCropper';
import { createImage, blobToFile } from '~/utils/cropImage';
import type { Route } from './+types/blogAdd';

const API_URL = import.meta.env.VITE_API_URL;

const BlogAdd = ({ params }: Route.ComponentProps) => {

  const {user} = useUser()
  console.log(params)
  
  const [post, setPost] = useState<any | null>(null)
  const [title, setTitle] = useState<string>("")
  const [summary, setSummary] = useState<string>("")
  const [showSummaryInput, setShowSummaryInput] = useState<boolean>(false)
  const [selectedCommunity, setSelectedCommunity] = useState<string>("")
  const [communities, setCommunities] = useState<Community[]>([])
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [coverImage, setCoverImage] = useState<string>("")
  const [showCoverCropper, setShowCoverCropper] = useState<boolean>(false)
  const [imageToCrop, setImageToCrop] = useState<string>("")
  const [pendingCoverFile, setPendingCoverFile] = useState<File | null>(null)

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const response = await fetch(`${API_URL}/communities`, {
          method: 'get',
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setCommunities(data);
        }
      } catch (error) {
        console.error('Failed to fetch communities:', error);
      }
    };
    fetchCommunities();
  }, []);

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

      // Store the cropped file for later upload (when user clicks Publish)
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
    if (coverImage.startsWith('blob:')) {
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

      // Remove title heading from content to avoid duplication
      // The title is stored separately, so we don't need it in content
      let contentWithoutTitle = post;
      if (contentWithoutTitle?.content && Array.isArray(contentWithoutTitle.content)) {
        // Remove the first heading (title) from content
        const contentNodes = contentWithoutTitle.content.filter((node: any, index: number) => {
          // Skip the first heading node (index 0) if it's a heading
          if (index === 0 && node.type === 'heading') {
            return false;
          }
          return true;
        });
        
        // If we removed the title and there's no content left, add an empty paragraph
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
        summary: summary.trim() || '', // Always include summary, empty string if not provided
        coverImage: finalCoverImageUrl || undefined // Include cover image if available
      }
      
      const response = await fetch(`${API_URL}/posts`, {
        method: 'post',
        credentials: 'include',
        headers: {
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to create post' }));
        throw new Error(errorData.error || 'Failed to create post');
      }

      window.location.href = `/community/${selectedCommunity}`
    } catch (error) {
      console.error('Error creating post:', error);
      alert(error instanceof Error ? error.message : 'Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }
  
  return (
    <div className='min-h-screen'>
      <div className='flex flex-row gap-6 p-[5px] mx-auto max-w-[1400px]'>

        {/* Main Content */}
        <div className='flex-grow flex flex-col gap-6'>
          {/* Header Section */}
          <div className='flex flex-col gap-[10px] p-[10px] w-full'>
            
            {/* Top Actions Bar */}
            <div className='flex flex-wrap items-end justify-between gap-4 mb-6 pb-6 border-b-2 border-black/20'>
              {/* Community Selection */}
              <div className='flex-1 min-w-[250px]'>
                <label htmlFor="community" className='form-label mb-2 block'>
                  COMMUNITY <span className='text-[#E95444]'>*</span>
                </label>
                <select
                  id="community"
                  value={selectedCommunity}
                  onChange={(e) => setSelectedCommunity(e.target.value)}
                  required
                  className='form-input w-full hover:border-[#E95444] focus:border-[#E95444] transition-all duration-200'
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
                  {isSubmitting ? 'PUBLISHING...' : 'PUBLISH POST'}
                </button>
              </div>
            </div>

            {/* Summary Input - Conditional */}
            {showSummaryInput && (
              <div className='mb-4'>
                <div className='flex items-center justify-between mb-2'>
                  <label htmlFor="summary" className='form-label'>
                    SUMMARY
                  </label>
                  <button
                    onClick={() => {
                      setShowSummaryInput(false);
                      setSummary('');
                    }}
                    className='p-1 hover:bg-[#EDEDE9] rounded transition-colors'
                    title="Close summary"
                  >
                    <X size={16} className='text-black' />
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
                  className="form-input hover:border-[#E95444] focus:border-[#E95444] transition-all duration-200"
                />
                <p className='text-black/60 text-xs mt-1'>{summary.length}/250 characters</p>
              </div>
            )}

            {/* Cover Image Section */}
            <div className='flex flex-col gap-3'>
              <div className='flex items-center justify-between'>
                <label className='form-label'>COVER IMAGE (OPTIONAL)</label>
                {!coverImage && !showCoverCropper && (
                  <FileInput 
                    onImageSelected={handleCoverImageSelected} 
                    onError={(error: string) => alert(error)}
                    type="Cover Image"
                  />
                )}
              </div>
              {coverImage && (
                <div className='relative w-full border-2 border-[#000000] rounded-lg overflow-hidden'>
                  <img
                    src={coverImage}
                    alt="Cover preview"
                    className='w-full h-auto'
                    style={{ aspectRatio: '2/1', maxHeight: '400px', objectFit:'cover' }}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveCoverImage}
                    className="absolute top-3 right-3 bg-[#E95444] hover:bg-[#D84335] text-white rounded-full p-2 transition-all duration-200 shadow-lg border-2 border-[#000000]"
                    title="Remove cover image"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
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
          <div className='bg-white border-2 border-[#000000] rounded-lg p-6 shadow-md flex-grow'>
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

export default BlogAdd