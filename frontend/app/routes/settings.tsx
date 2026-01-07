import React, { useState, useEffect } from 'react';
import { useUser } from '~/context/userContext';
import Sidebar from '~/components/Sidebar';
import updateUser from '~/apiCalls/user/updateUser';
import FetchOwnDetails from '~/apiCalls/user/fetchOwnDetails';
import { Save, User, Mail, Image as ImageIcon, FileText, Briefcase, Upload, X } from 'lucide-react';
import FileInput from '~/components/cropping/FileInput';
import ImageCropper from '~/components/cropping/ImageCropper';
import { createImage, blobToFile } from '~/utils/cropImage';

const API_URL = import.meta.env.VITE_API_URL;

const Settings = () => {
  const { user, setUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>('');
  const [pendingCroppedFile, setPendingCroppedFile] = useState<File | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    given_name: '',
    family_name: '',
    picture: '',
    byline: '',
    about: '',
  });

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      try {
        const userData = await FetchOwnDetails();
        setFormData({
          name: userData.name || '',
          given_name: userData.given_name || '',
          family_name: userData.family_name || '',
          picture: userData.picture || '',
          byline: userData.byline || '',
          about: userData.about || '',
        });
        // Set preview URL if picture exists - show existing profile picture by default
        if (userData.picture) {
          setPreviewUrl(userData.picture);
        } else {
          setPreviewUrl('');
        }
        // Clear any pending cropped file when loading fresh data
        setPendingCroppedFile(null);
      } catch (error) {
        console.error('Failed to load user data:', error);
        setErrorMessage('Failed to load user data. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadUserData();
    }
  }, [user]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      if (imageToCrop.startsWith('blob:')) {
        URL.revokeObjectURL(imageToCrop);
      }
    };
  }, [previewUrl, imageToCrop]);

  // Upload profile picture function
  const uploadProfilePicture = async (file: File): Promise<string> => {
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const filename = `profile-pictures/${user?._id || 'user'}-${timestamp}.${fileExtension}`;
      
      // Get presigned URL
      const presignUrl = `${API_URL}/s3/profile-picture-upload?filename=${encodeURIComponent(filename)}&contentType=${encodeURIComponent(file.type)}`;
      
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

  // Handle image selection from FileInput
  const handleImageSelected = (imageSrc: string) => {
    // Validate that we have an image
    if (!imageSrc) {
      setErrorMessage('Please select an image file');
      return;
    }
    
    setImageToCrop(imageSrc);
    setShowCropper(true);
    setErrorMessage('');
    setSuccessMessage('');
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
      const croppedFile = blobToFile(croppedBlob, `profile-${Date.now()}.jpg`);

      // Validate file size (max 5MB)
      if (croppedFile.size > 5 * 1024 * 1024) {
        setErrorMessage('Cropped image size must be less than 5MB');
        setShowCropper(false);
        setImageToCrop('');
        return;
      }

      // Store the cropped file for later upload (when user clicks Save)
      setPendingCroppedFile(croppedFile);
      
      // Create preview URL from the cropped file
      const previewBlobUrl = URL.createObjectURL(croppedFile);
      setPreviewUrl(previewBlobUrl);
      
      // Clean up
      setShowCropper(false);
      if (imageToCrop.startsWith('blob:')) {
        URL.revokeObjectURL(imageToCrop);
      }
      setImageToCrop('');
    } catch (error) {
      console.error('Crop failed:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to crop image. Please try again.');
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
    if (formData.picture) {
      setPreviewUrl(formData.picture);
    } else {
      setPreviewUrl('');
    }
  };

  // Handle remove picture
  const handleRemovePicture = () => {
    // Clean up preview blob URL if it exists
    if (previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl('');
    setPendingCroppedFile(null);
    setFormData(prev => ({ ...prev, picture: '' }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear messages when user starts typing
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setIsUploading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      // If there's a pending cropped file, upload it first
      let finalPictureUrl = formData.picture;
      
      if (pendingCroppedFile) {
        try {
          finalPictureUrl = await uploadProfilePicture(pendingCroppedFile);
          
          // Clean up the preview blob URL
          if (previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
          }
          
          // Update preview with the uploaded URL
          setPreviewUrl(finalPictureUrl);
          setPendingCroppedFile(null);
        } catch (uploadError) {
          console.error('Failed to upload profile picture:', uploadError);
          setErrorMessage(uploadError instanceof Error ? uploadError.message : 'Failed to upload profile picture. Please try again.');
          setIsSaving(false);
          setIsUploading(false);
          return;
        }
      }

      // Update form data with the final picture URL
      const updatedFormData = {
        ...formData,
        picture: finalPictureUrl,
      };

      const result = await updateUser(updatedFormData);
      
      // Update user context with new data
      if (user) {
        setUser({
          ...user,
          ...updatedFormData,
        });
      }

      // Update formData state
      setFormData(updatedFormData);

      setSuccessMessage('Settings saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to update user:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  };

  // Skeleton Loading Component
  const SkeletonLoader = () => (
    <div className="min-h-screen">
      <div className="flex flex-row gap-6 px-6 py-8 mx-auto max-w-[1600px]">
        {/* Left Sidebar Skeleton */}
        <Sidebar />

        {/* Main Content Skeleton */}
        <div className="flex-grow flex flex-col gap-6">
          {/* Header Skeleton */}
          <div className="flex flex-col gap-2">
            <div className="h-9 w-48 skeleton rounded-lg"></div>
            <div className="h-5 w-96 skeleton rounded-lg"></div>
          </div>

          {/* Form Sections Skeleton */}
          <div className="flex flex-col gap-6">
            {/* Personal Information Section Skeleton */}
            <div className="bg-[#EDEDE9] border border-[#000000] rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-5 h-5 skeleton rounded"></div>
                <div className="h-6 w-48 skeleton rounded-lg"></div>
              </div>

              <div className="flex flex-col gap-5">
                {/* Email Field Skeleton */}
                <div className="flex flex-col gap-2">
                  <div className="h-4 w-32 skeleton rounded"></div>
                  <div className="h-10 w-full bg-[#D6D6CD] border border-[#000000] rounded-lg skeleton"></div>
                  <div className="h-3 w-80 skeleton rounded"></div>
                </div>

                {/* Name Fields Skeleton */}
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <div className="h-4 w-24 skeleton rounded"></div>
                    <div className="h-10 w-full bg-[#D6D6CD] border border-[#000000] rounded-lg skeleton"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Profile Section Skeleton */}
            <div className="bg-[#EDEDE9] border border-[#000000] rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-5 h-5 skeleton rounded"></div>
                <div className="h-6 w-32 skeleton rounded-lg"></div>
              </div>

              <div className="flex flex-col gap-5">
                {/* Profile Picture Skeleton */}
                <div className="flex flex-col gap-4">
                  <div className="h-4 w-32 skeleton rounded"></div>
                  <div className="w-32 h-32 rounded-full skeleton"></div>
                  <div className="h-10 w-40 bg-[#D6D6CD] border border-[#000000] rounded-lg skeleton"></div>
                  <div className="h-3 w-64 skeleton rounded"></div>
                </div>

                {/* Byline Skeleton */}
                <div className="flex flex-col gap-2">
                  <div className="h-4 w-20 skeleton rounded"></div>
                  <div className="h-10 w-full bg-[#D6D6CD] border border-[#000000] rounded-lg skeleton"></div>
                  <div className="h-3 w-24 skeleton rounded"></div>
                </div>

                {/* About Skeleton */}
                <div className="flex flex-col gap-2">
                  <div className="h-4 w-16 skeleton rounded"></div>
                  <div className="h-32 w-full bg-[#D6D6CD] border border-[#000000] rounded-lg skeleton"></div>
                  <div className="h-3 w-24 skeleton rounded"></div>
                </div>
              </div>
            </div>

            {/* Submit Button Skeleton */}
            <div className="flex justify-end gap-4">
              <div className="h-10 w-40 skeleton rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return <SkeletonLoader />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h3>Please log in to access settings.</h3>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="flex flex-row gap-6 px-6 py-8">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-grow flex flex-col gap-6 max-w-[1200px] mx-auto">
          {/* Header */}
            <h1>SETTINGS</h1>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="p-4 bg-green-900/30 border border-green-700 rounded-lg text-green-300">
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300">
              {errorMessage}
            </div>
          )}

          {/* Image Cropper Modal */}
          {showCropper && imageToCrop && (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
              <div className="bg-[#EDEDE9] border border-[#000000] p-6 max-w-2xl w-full">
                <ImageCropper
                  image={imageToCrop}
                  onCropDone={handleCropDone}
                  onCropCancel={handleCropCancel}
                  AR={1}
                />
              </div>
            </div>
          )}

          {/* Settings Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-[50px]">
            {/* Personal Information Section */}
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-5 items-center">
                {/* Profile Picture Upload */}
                <div className="flex flex-col gap-4 w-fit items-center">
                  <label className="flex items-center text-small gap-2 hidden">PROFILE PICTURE</label>
                  
                  {/* Preview */}
                  {previewUrl && (
                    <div className="relative w-fit">
                      <img
                        src={previewUrl}
                        alt="Profile preview"
                        className="w-32 h-32 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleRemovePicture}
                        className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 rounded-full p-1.5 transition-colors"
                        title="Remove picture"
                      >
                        <X size={14} className="text-black" />
                      </button>
                    </div>
                  )}

                  {/* Upload Button */}
                  <div className="flex flex-col items-center gap-2">
                    {!showCropper ? (
                      <FileInput 
                        onImageSelected={handleImageSelected} 
                        onError={(error) => setErrorMessage(error)}
                        type="Profile Picture"
                      />
                    ) : null}
                    {!showCropper && (
                      <p className="text-[#979797] text-mini">
                        SUPPORTED FORMATS: JPG, PNG, GIF. MAX SIZE: 5MB
                      </p>
                    )}
                  </div>
                </div>                
              </div>

              <div className="flex flex-col gap-2">
                  <label htmlFor="byline" className="form-label flex items-center gap-2">
                    BYLINE
                  </label>
                  <input
                    id="byline"
                    name="byline"
                    type="text"
                    value={formData.byline}
                    onChange={handleInputChange}
                    placeholder="e.g., Software Engineer at Company"
                    maxLength={100}
                    className="form-input"
                  />
                  <div className="text-[#979797] text-mini">{formData.byline.length}/100 characters</div>
                </div>

                {/* About */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="about" className="form-label flex items-center gap-2">
                    ABOUT
                  </label>
                  <textarea
                    id="about"
                    name="about"
                    value={formData.about}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself..."
                    rows={6}
                    maxLength={500}
                    className="form-input"
                  />
                  <div className="text-[#979797] text-mini">{formData.about.length}/500 characters</div>
                </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {/* Email (Read-only) */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="form-label flex items-center gap-2">
                    EMAIL ADDRESS
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={user.email || ''}
                    disabled
                    className="form-input cursor-not-allowed text-[#979797] max-w-[400px]"
                  />
                </div>

                {/* Full Name */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="form-label flex items-center gap-2">
                    FULL NAME
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="form-input max-w-[400px]"
                  />
                </div>

                {/* Given Name */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="given_name" className="form-label flex items-center gap-2">
                    FIRST NAME
                  </label>
                  <input
                    id="given_name"
                    name="given_name"
                    type="text"
                    value={formData.given_name}
                    onChange={handleInputChange}
                    placeholder="Enter your first name"
                    className="form-input max-w-[400px]"
                  />
                </div>

                {/* Family Name */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="family_name" className="form-label flex items-center gap-2">
                    LAST NAME
                  </label>
                  <input
                    id="family_name"
                    name="family_name"
                    type="text"
                    value={formData.family_name}
                    onChange={handleInputChange}
                    placeholder="Enter your last name"
                    className="form-input max-w-[400px]"
                    maxLength={50}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <button
                type="submit"
                disabled={isSaving}
                className={`primary-btn ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span>{isSaving ? 'SAVING...' : 'SAVE'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
