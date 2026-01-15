import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { TOPICS } from '~/constants/topics';
import TopicPill from '~/components/TopicPill';
import type { Community, Announcement } from '~/types/types';
// @ts-expect-error - FileInput is a .jsx file without type definitions
import FileInput from '~/components/cropping/FileInput';
// @ts-expect-error - ImageCropper is a .jsx file without type definitions
import ImageCropper from '~/components/cropping/ImageCropper';
import { createImage, blobToFile } from '~/utils/cropImage';

type EditCommunityModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  community: Community | null;
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const EditCommunityModal = ({ isOpen, onClose, onSuccess, community }: EditCommunityModalProps) => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [picturePreview, setPicturePreview] = useState<string>('');
  const [rules, setRules] = useState<string[]>(['']);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [announcementTitle, setAnnouncementTitle] = useState<string>('');
  const [announcementContent, setAnnouncementContent] = useState<string>('');
  const [showAnnouncementForm, setShowAnnouncementForm] = useState<boolean>(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isCreatingAnnouncement, setIsCreatingAnnouncement] = useState<boolean>(false);
  const [showCropper, setShowCropper] = useState<boolean>(false);
  const [imageToCrop, setImageToCrop] = useState<string>('');
  const [pendingCroppedFile, setPendingCroppedFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>('');
  const [showCoverCropper, setShowCoverCropper] = useState<boolean>(false);
  const [coverImageToCrop, setCoverImageToCrop] = useState<string>('');
  const [pendingCoverFile, setPendingCoverFile] = useState<File | null>(null);

  useEffect(() => {
    if (community) {
      setTitle(community.title || '');
      setDescription(community.description || '');
      setPicturePreview(community.picture || '');
      setCoverImagePreview(community.coverImage || '');
      setRules(community.rules && community.rules.length > 0 ? community.rules : ['']);
      setSelectedTopics(community.topics || []);
      setAnnouncements(community.announcements || []);
      setPendingCroppedFile(null);
      setPendingCoverFile(null);
    }
  }, [community]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (picturePreview.startsWith('blob:')) {
        URL.revokeObjectURL(picturePreview);
      }
      if (imageToCrop.startsWith('blob:')) {
        URL.revokeObjectURL(imageToCrop);
      }
      if (coverImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(coverImagePreview);
      }
      if (coverImageToCrop.startsWith('blob:')) {
        URL.revokeObjectURL(coverImageToCrop);
      }
    };
  }, [picturePreview, imageToCrop, coverImagePreview, coverImageToCrop]);

  const toggleTopic = (topicName: string) => {
    setSelectedTopics(prev => 
      prev.includes(topicName) 
        ? prev.filter(name => name !== topicName)
        : [...prev, topicName]
    );
  };

  // Handle image selection from FileInput
  const handleImageSelected = (imageSrc: string) => {
    if (!imageSrc) {
      return;
    }
    setImageToCrop(imageSrc);
    setShowCropper(true);
  };

  // Handle crop completion - only create preview, don't upload yet
  const handleCropDone = async (croppedAreaPixels: { x: number; y: number; width: number; height: number } | null) => {
    if (!croppedAreaPixels || !imageToCrop) {
      setShowCropper(false);
      setImageToCrop('');
      return;
    }

    try {
      // Create cropped image blob
      const croppedBlob = await createImage(imageToCrop, croppedAreaPixels);
      
      // Convert blob to file
      const croppedFile = blobToFile(croppedBlob, `community-${Date.now()}.jpg`);

      // Validate file size (max 5MB)
      if (croppedFile.size > 5 * 1024 * 1024) {
        alert('Cropped image size must be less than 5MB');
        setShowCropper(false);
        setImageToCrop('');
        return;
      }

      // Store the cropped file for later upload (when user clicks Save)
      setPendingCroppedFile(croppedFile);
      
      // Create preview URL from the cropped file
      const previewBlobUrl = URL.createObjectURL(croppedFile);
      setPicturePreview(previewBlobUrl);
      
      // Clean up
      setShowCropper(false);
      if (imageToCrop.startsWith('blob:')) {
        URL.revokeObjectURL(imageToCrop);
      }
      setImageToCrop('');
    } catch (error) {
      console.error('Crop failed:', error);
      alert(error instanceof Error ? error.message : 'Failed to crop image. Please try again.');
      setShowCropper(false);
      setImageToCrop('');
    }
  };

  // Handle crop cancellation
  const handleCropCancel = () => {
    setShowCropper(false);
    if (imageToCrop.startsWith('blob:')) {
      URL.revokeObjectURL(imageToCrop);
    }
    setImageToCrop('');
    // Restore preview to existing picture if available
    if (community?.picture) {
      setPicturePreview(community.picture);
    } else {
      setPicturePreview('');
    }
  };

  // Handle remove picture
  const handleRemovePicture = () => {
    // Clean up preview blob URL if it exists
    if (picturePreview.startsWith('blob:')) {
      URL.revokeObjectURL(picturePreview);
    }
    setPicturePreview('');
    setPendingCroppedFile(null);
  };

  // Handle cover image selection from FileInput
  const handleCoverImageSelected = (imageSrc: string) => {
    if (!imageSrc) {
      return;
    }
    setCoverImageToCrop(imageSrc);
    setShowCoverCropper(true);
  };

  // Handle cover crop completion
  const handleCoverCropDone = async (croppedAreaPixels: { x: number; y: number; width: number; height: number } | null) => {
    if (!croppedAreaPixels || !coverImageToCrop) {
      setShowCoverCropper(false);
      setCoverImageToCrop('');
      return;
    }

    try {
      // Create cropped image blob
      const croppedBlob = await createImage(coverImageToCrop, croppedAreaPixels);
      
      // Convert blob to file
      const croppedFile = blobToFile(croppedBlob, `community-cover-${Date.now()}.jpg`);

      // Validate file size (max 5MB)
      if (croppedFile.size > 5 * 1024 * 1024) {
        alert('Cropped image size must be less than 5MB');
        setShowCoverCropper(false);
        setCoverImageToCrop('');
        return;
      }

      // Store the cropped file for later upload (when user clicks Save)
      setPendingCoverFile(croppedFile);
      
      // Create preview URL from the cropped file
      const previewBlobUrl = URL.createObjectURL(croppedFile);
      setCoverImagePreview(previewBlobUrl);
      
      // Clean up
      setShowCoverCropper(false);
      if (coverImageToCrop.startsWith('blob:')) {
        URL.revokeObjectURL(coverImageToCrop);
      }
      setCoverImageToCrop('');
    } catch (error) {
      console.error('Crop failed:', error);
      alert(error instanceof Error ? error.message : 'Failed to crop image. Please try again.');
      setShowCoverCropper(false);
      setCoverImageToCrop('');
    }
  };

  // Handle cover crop cancellation
  const handleCoverCropCancel = () => {
    setShowCoverCropper(false);
    if (coverImageToCrop.startsWith('blob:')) {
      URL.revokeObjectURL(coverImageToCrop);
    }
    setCoverImageToCrop('');
    // Restore preview to existing cover image if available
    if (community?.coverImage) {
      setCoverImagePreview(community.coverImage);
    } else {
      setCoverImagePreview('');
    }
  };

  // Handle remove cover image
  const handleRemoveCoverImage = () => {
    // Clean up preview blob URL if it exists
    if (coverImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(coverImagePreview);
    }
    setCoverImagePreview('');
    setPendingCoverFile(null);
  };

  const addRule = () => {
    setRules([...rules, '']);
  };

  const updateRule = (index: number, value: string) => {
    const newRules = [...rules];
    newRules[index] = value;
    setRules(newRules);
  };

  const removeRule = (index: number) => {
    if (rules.length > 1) {
      setRules(rules.filter((_, i) => i !== index));
    }
  };

  const uploadPicture = async (file: File): Promise<string> => {
    try {
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const filename = `community-pictures/${timestamp}.${fileExtension}`;
      
      const presignUrl = `${API_URL}/s3/community-image-upload?filename=${encodeURIComponent(filename)}&contentType=${encodeURIComponent(file.type)}`;
      
      const res = await fetch(presignUrl, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to get upload URL: ${res.status} ${errorText}`);
      }
      
      const data = await res.json();
      const { uploadUrl, fileUrl } = data;
      
      if (!uploadUrl) {
        throw new Error('No upload URL received from server');
      }

      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!uploadRes.ok) {
        const errorText = await uploadRes.text().catch(() => 'Unknown error');
        throw new Error(`Failed to upload picture to S3: ${uploadRes.status} ${errorText}`);
      }

      return fileUrl;
      
    } catch (error) {
      console.error('Picture upload failed:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server. Please check your internet connection.');
      }
      throw error;
    }
  };

  const uploadCoverImage = async (file: File): Promise<string> => {
    try {
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const filename = `community-covers/${timestamp}.${fileExtension}`;
      
      const presignUrl = `${API_URL}/s3/community-image-upload?filename=${encodeURIComponent(filename)}&contentType=${encodeURIComponent(file.type)}`;
      
      const res = await fetch(presignUrl, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to get upload URL: ${res.status} ${errorText}`);
      }
      
      const data = await res.json();
      const { uploadUrl, fileUrl } = data;
      
      if (!uploadUrl) {
        throw new Error('No upload URL received from server');
      }

      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!uploadRes.ok) {
        const errorText = await uploadRes.text().catch(() => 'Unknown error');
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

  const handleCreateAnnouncement = async () => {
    if (!announcementTitle.trim() || !announcementContent.trim()) {
      alert('Please fill in both title and content for the announcement');
      return;
    }

    if (!community?._id) return;

    setIsCreatingAnnouncement(true);
    try {
      const response = await fetch(`${API_URL}/announcements`, {
        method: 'post',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: announcementTitle.trim(),
          content: announcementContent.trim(),
          communityId: community._id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to create announcement' }));
        throw new Error(errorData.error || 'Failed to create announcement');
      }

      const newAnnouncement = await response.json();
      setAnnouncements([...announcements, newAnnouncement]);
      setAnnouncementTitle('');
      setAnnouncementContent('');
      setShowAnnouncementForm(false);
      
      // Refresh community data by calling onSuccess
      onSuccess();
    } catch (error) {
      console.error('Error creating announcement:', error);
      alert(error instanceof Error ? error.message : 'Failed to create announcement. Please try again.');
    } finally {
      setIsCreatingAnnouncement(false);
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/announcements/${announcementId}`, {
        method: 'delete',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to delete announcement' }));
        throw new Error(errorData.error || 'Failed to delete announcement');
      }

      setAnnouncements(announcements.filter(a => a._id !== announcementId));
      
      // Refresh community data by calling onSuccess
      onSuccess();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete announcement. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    if (!community?._id) return;

    setIsSubmitting(true);

    try {
      let pictureUrl = community?.picture || '';
      let coverImageUrl = community?.coverImage || '';
      
      // If there's a pending cropped file, upload it first
      if (pendingCroppedFile) {
        try {
          pictureUrl = await uploadPicture(pendingCroppedFile);
          
          // Clean up the preview blob URL
          if (picturePreview.startsWith('blob:')) {
            URL.revokeObjectURL(picturePreview);
          }
          
          // Update preview with the uploaded URL
          setPicturePreview(pictureUrl);
          setPendingCroppedFile(null);
        } catch (uploadError) {
          console.error('Failed to upload community picture:', uploadError);
          const errorMessage = uploadError instanceof Error ? uploadError.message : 'Failed to upload community picture. Please try again.';
          alert(errorMessage);
          setIsSubmitting(false);
          return;
        }
      }

      // If there's a pending cover file, upload it
      if (pendingCoverFile) {
        try {
          coverImageUrl = await uploadCoverImage(pendingCoverFile);
          
          // Clean up the preview blob URL
          if (coverImagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(coverImagePreview);
          }
          
          // Update preview with the uploaded URL
          setCoverImagePreview(coverImageUrl);
          setPendingCoverFile(null);
        } catch (uploadError) {
          console.error('Failed to upload cover image:', uploadError);
          const errorMessage = uploadError instanceof Error ? uploadError.message : 'Failed to upload cover image. Please try again.';
          alert(errorMessage);
          setIsSubmitting(false);
          return;
        }
      } else if (!coverImagePreview && community?.coverImage) {
        // If cover image was removed, set to empty string
        coverImageUrl = '';
      }

      // Filter out empty rules
      const validRules = rules.filter(rule => rule.trim().length > 0);

      // Update community
      const response = await fetch(`${API_URL}/communities/${community._id}`, {
        method: 'put',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          picture: pictureUrl,
          coverImage: coverImageUrl || undefined,
          rules: validRules,
          topics: selectedTopics,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to update community' }));
        throw new Error(errorData.error || errorData.details || 'Failed to update community');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating community:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update community. Please try again.';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      if (community) {
        setTitle(community.title || '');
        setDescription(community.description || '');
        setPicturePreview(community.picture || '');
        setCoverImagePreview(community.coverImage || '');
        setRules(community.rules && community.rules.length > 0 ? community.rules : ['']);
        setSelectedTopics(community.topics || []);
        setAnnouncements(community.announcements || []);
      }
      setPendingCroppedFile(null);
      setPendingCoverFile(null);
      setAnnouncementTitle('');
      setAnnouncementContent('');
      setShowAnnouncementForm(false);
      setShowCropper(false);
      setShowCoverCropper(false);
      if (imageToCrop.startsWith('blob:')) {
        URL.revokeObjectURL(imageToCrop);
      }
      if (coverImageToCrop.startsWith('blob:')) {
        URL.revokeObjectURL(coverImageToCrop);
      }
      setImageToCrop('');
      setCoverImageToCrop('');
      onClose();
    }
  };

  if (!isOpen || !community) return null;

  return (
    <div className="fixed top-0 left-0 z-50 flex h-[100vh] w-[100vw] justify-center items-center bg-black/60 backdrop-blur-sm" onClick={handleClose}>
      <div
        className="w-full max-w-2xl max-h-[90vh] bg-[#EDEDE9] border border-[#1f2735] flex flex-col gap-4 p-6 shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2>EDIT COMMUNITY</h2>
          <button
            onClick={handleClose}
            className="icon bg-[#E95444]"
            disabled={isSubmitting}
          >
            <X size={20}/>
          </button>
        </div>

        {/* Image Cropper Modal */}
        {showCropper && imageToCrop && (
          <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-[#EDEDE9] via-[#F5F5F1] to-[#EDEDE9] border-2 border-[#000000] p-6 max-w-2xl w-full rounded-lg shadow-2xl">
              <ImageCropper
                image={imageToCrop}
                onCropDone={handleCropDone}
                onCropCancel={handleCropCancel}
                AR={1}
              />
            </div>
          </div>
        )}

        {/* Cover Image Cropper Modal */}
        {showCoverCropper && coverImageToCrop && (
          <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-[#EDEDE9] via-[#F5F5F1] to-[#EDEDE9] border-2 border-[#000000] p-6 max-w-4xl w-full rounded-lg shadow-2xl">
              <ImageCropper
                image={coverImageToCrop}
                onCropDone={handleCoverCropDone}
                onCropCancel={handleCoverCropCancel}
                AR={4}
              />
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex overflow-y-auto">
          <div className="flex flex-col gap-[50px] p-[10px] w-full">

            {/* Cover Image Upload */}
            <div className="flex flex-col gap-4">
              <label className="text-black font-medium text-sm">Community Cover Image</label>
              <p className="text-[#979797] text-xs">4:1 aspect ratio • Max 1028x256px</p>
              
              {/* Preview */}
              {coverImagePreview && (
                <div className="relative w-full group">
                  <img
                    src={coverImagePreview}
                    alt="Cover preview"
                    className="w-full max-w-[1028px] h-auto object-cover border-2 border-[#000000] rounded-lg"
                    style={{ aspectRatio: '4/1', maxHeight: '256px' }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveCoverImage}
                    className="absolute top-2 right-2 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-600 rounded-full p-1.5 transition-all duration-300 hover:scale-110 hover:shadow-lg border-2 border-black"
                    title="Remove cover image"
                  >
                    <X size={14} className="text-white" />
                  </button>
                </div>
              )}

              {/* Upload Button */}
              <div className="flex flex-col gap-2">
                {!showCoverCropper ? (
                  <FileInput 
                    onImageSelected={handleCoverImageSelected} 
                    onError={(error: string) => alert(error)}
                    type="Community Cover Image"
                  />
                ) : null}
                {!showCoverCropper && (
                  <p className="text-[#979797] text-mini hover:text-[#FEC72F] transition-colors duration-200">
                    SUPPORTED FORMATS: JPG, PNG, GIF. MAX SIZE: 5MB
                  </p>
                )}
              </div>
            </div>

            {/* Picture Upload */}
            <div className="flex flex-col gap-4 items-center">
              <label className="text-black font-medium text-sm">Community Picture</label>
              
              {/* Preview */}
              {picturePreview && (
                <div className="relative w-fit group">
                  <img
                    src={picturePreview}
                    alt="Community preview"
                    className="w-32 h-32 rounded-full object-cover border-4 border-transparent group-hover:border-[#FEC72F] transition-all duration-300 group-hover:ring-4 group-hover:ring-[#FEC72F]/30 group-hover:shadow-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleRemovePicture}
                    className="absolute -top-2 -right-2 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-600 rounded-full p-1.5 transition-all duration-300 hover:scale-110 hover:shadow-lg border-2 border-black"
                    title="Remove picture"
                  >
                    <X size={14} className="text-white" />
                  </button>
                </div>
              )}

              {/* Upload Button */}
              <div className="flex flex-col items-center gap-2">
                {!showCropper ? (
                  <FileInput 
                    onImageSelected={handleImageSelected} 
                    onError={(error: string) => alert(error)}
                    type="Community Picture"
                  />
                ) : null}
                {!showCropper && (
                  <p className="text-[#979797] text-mini hover:text-[#FEC72F] transition-colors duration-200">
                    SUPPORTED FORMATS: JPG, PNG, GIF. MAX SIZE: 5MB
                  </p>
                )}
              </div>
            </div>

            {/* Title */}
            <div className="flex flex-col gap-2">
              <label htmlFor="title" className="form-label">
                Community Title <span className="text-red-400">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter community title"
                maxLength={50}
                required
                className="input-decor"
              />
              <span className="text-[#979797] text-xs">{title.length}/50</span>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <label htmlFor="description" className="form-label">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your community"
                maxLength={250}
                rows={4}
                required
                className="input-decor"
              />
              <span className="text-[#979797] text-xs">{description.length}/250</span>
            </div>

            {/* Topics */}
            <div className="flex flex-col gap-2">
              <label className="text-black font-medium text-sm">Topics</label>
              <p className="text-[#979797] text-xs">Select topics that describe your community</p>
              <div className="flex flex-wrap gap-2">
                {TOPICS.map((topic) => (
                  <TopicPill
                    key={topic.id}
                    topicName={topic.name}
                    onClick={() => toggleTopic(topic.name)}
                    size="medium"
                    variant={selectedTopics.includes(topic.name) ? 'selected' : 'unselected'}
                    className={selectedTopics.includes(topic.name) ? 'font-semibold' : 'opacity-70 hover:opacity-100'}
                  />
                ))}
              </div>
            </div>

            {/* Rules */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-black font-medium text-sm">Rules</label>
                <button
                  type="button"
                  onClick={addRule}
                  className="primary-btn flex gap-[5px] items-center bg-[#E95444]"
                >
                  <Plus size={16} />
                  ADD RULE
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {rules.map((rule, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={rule}
                      onChange={(e) => updateRule(index, e.target.value)}
                      placeholder={`Rule ${index + 1}`}
                      maxLength={100}
                      className="input-decor"
                    />
                    {rules.length > 0 && index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeRule(index)}
                        className="icon bg-[#E95444]"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Announcements Section */}
            <div className="flex flex-col gap-2 border-t border-[#000000] py-4">
              <div className="flex items-center justify-between">
                <label className="text-black font-medium text-sm">Announcements</label>
                <button
                  type="button"
                  onClick={() => setShowAnnouncementForm(!showAnnouncementForm)}
                  className="icon bg-[#E95444]"
                >
                  <Plus size={16} style={{transform: showAnnouncementForm ? 'rotate(45deg)' : 'rotate(0deg)'}}/>
                  
                </button>
              </div>

              {/* Announcement Form */}
              {showAnnouncementForm && (
                <div className="flex flex-col gap-2 ">
                  <input
                    type="text"
                    value={announcementTitle}
                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                    placeholder="Announcement Title"
                    maxLength={100}
                    className="input-decor"
                  />
                  <textarea
                    value={announcementContent}
                    onChange={(e) => setAnnouncementContent(e.target.value)}
                    placeholder="Announcement Content"
                    maxLength={500}
                    rows={3}
                    className="input-decor"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleCreateAnnouncement}
                      disabled={isCreatingAnnouncement}
                      className="primary-btn bg-[#E95444]"
                    >
                      {isCreatingAnnouncement ? 'CREATING...' : 'CREATE'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAnnouncementForm(false);
                        setAnnouncementTitle('');
                        setAnnouncementContent('');
                      }}
                      disabled={isCreatingAnnouncement}
                      className="secondary-btn"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              )}

              {/* Existing Announcements */}
              {announcements.length > 0 && (
                <div className="flex flex-col gap-2">
                  {announcements.map((announcement) => (
                    <div key={announcement._id} className="flex items-start justify-between p-3 bg-[#EDEDE9] border border-[#000000] rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold text-black mb-1">{announcement.title}</h4>
                        <p className="text-sm text-black">{announcement.content}</p>
                        <p className="text-xs text-[#979797] mt-1">
                          By {typeof announcement.createdBy === 'object' ? announcement.createdBy.name : 'Unknown'} • {new Date(announcement.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteAnnouncement(announcement._id)}
                        className="p-2 bg-[#EDEDE9] border border-[#000000] rounded-lg hover:bg-[#D6D6CD] transition-colors ml-2"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-[#000000] pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="secondary-btn"
            disabled={isSubmitting}
          >
            CANCEL
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="primary-btn bg-[#E95444]"
            disabled={isSubmitting}
          >
            <span>{isSubmitting ? 'SAVING...' : 'SAVE CHANGES'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditCommunityModal;

