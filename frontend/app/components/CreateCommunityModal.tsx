import React, { useState } from 'react';
import { X, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { TOPICS } from '~/constants/topics';
import TopicPill from '~/components/TopicPill';

type CreateCommunityModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const CreateCommunityModal = ({ isOpen, onClose, onSuccess }: CreateCommunityModalProps) => {

  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [picture, setPicture] = useState<File | null>(null);
  const [picturePreview, setPicturePreview] = useState<string>('');
  const [rules, setRules] = useState<string[]>(['']);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  const toggleTopic = (topicName: string) => {
    setSelectedTopics(prev => 
      prev.includes(topicName) 
        ? prev.filter(name => name !== topicName)
        : [...prev, topicName]
    );
  };

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
      // Generate unique filename
      const timestamp = Date.now();
      const filename = `community-pictures/${timestamp}-${file.name}`;
      
      // Get presigned URL
      const presignUrl = `${API_URL}/s3/community-image-upload?filename=${encodeURIComponent(filename)}&contentType=${encodeURIComponent(file.type)}`;
      console.log('Requesting presigned URL from:', presignUrl);
      
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
      console.log('Presigned URL response:', data);
      const { uploadUrl, fileUrl, key } = data;
      
      if (!uploadUrl) {
        throw new Error('No upload URL received from server');
      }

      // Upload to S3
      console.log('Uploading to S3:', uploadUrl);
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

      console.log('Upload successful, file URL:', fileUrl);
      return fileUrl;
      
    } catch (error) {
      console.error('Picture upload failed:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server. Please check your internet connection.');
      }
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      let pictureUrl = '';
      
      // Upload picture if provided
      if (picture) {
        pictureUrl = await uploadPicture(picture);
      }

      // Filter out empty rules
      const validRules = rules.filter(rule => rule.trim().length > 0);

      // Create community
      const response = await fetch(`${API_URL}/communities`, {
        method: 'post',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          picture: pictureUrl,
          rules: validRules,
          moderators: [],
          members: [],
          posts: [],
          topics: selectedTopics,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to create community' }));
        throw new Error(errorData.error || errorData.details || 'Failed to create community');
      }

      // Reset form
      setTitle('');
      setDescription('');
      setPicture(null);
      setPicturePreview('');
      setRules(['']);
      setSelectedTopics([]);
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating community:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create community. Please try again.';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setTitle('');
      setDescription('');
      setPicture(null);
      setPicturePreview('');
      setRules(['']);
      setSelectedTopics([]);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed z-50 flex h-[100vh] w-[100vw] justify-center items-center bg-black/60 backdrop-blur-sm" onClick={handleClose}>
      <div
        className="w-full max-w-2xl max-h-[90vh] bg-[#EDEDE9] border border-[#1f2735] flex flex-col gap-4 p-6 shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3>CREATE COMMUNITY</h3>
          <button
            onClick={handleClose}
            className="icon"
            disabled={isSubmitting}
          >
            <X size={20}/>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex overflow-y-auto">
          <div className="flex flex-col gap-3 w-full">
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
                className="form-input"
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
                className="form-input"
              />
              <span className="text-[#979797] text-xs">{description.length}/250</span>
            </div>

            {/* Picture Upload */}
            <div className="flex flex-col gap-2">
              <label>Community Picture</label>
              <div className="flex flex-col gap-3">
                {picturePreview ? (
                  <div className="relative">
                    <img
                      src={picturePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border border-[#1f2735]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPicture(null);
                        setPicturePreview('');
                      }}
                      className="absolute top-2 right-2 p-2 bg-[#121b2a] border border-[#1f2735] rounded-lg hover:bg-[#1f2735] transition-colors"
                    >
                      <X size={16} className="text-white" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#000000] rounded-lg cursor-pointer hover:border-[#5D64F4] transition-colors bg-[#EDEDE9]">
                    <div className="flex flex-col items-center gap-2">
                      <ImageIcon size={24} className="text-[#000000]" />
                      <span className="text-[#000000] text-sm">Click to upload picture</span>
                      <span className="text-[#979797] text-xs">PNG, JPG up to 10MB</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePictureChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
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
              {selectedTopics.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-[#979797] text-xs">Selected:</span>
                  {selectedTopics.map((topicName) => (
                    <TopicPill
                      key={topicName}
                      topicName={topicName}
                      size="medium"
                      variant="selected"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Rules */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label>Rules</label>
                <button
                  type="button"
                  onClick={addRule}
                  className="primary-btn flex gap-[5px] items-center"
                >
                  <Plus size={16} />
                  Add Rule
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
                      className="flex-1 px-4 py-2 bg-[#EDEDE9] border border-[#000000] rounded-lg text-black placeholder-[#979797] focus:outline-none focus:border-[#5D64F4]"
                    />
                    {rules.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRule(index)}
                        className="p-2 bg-[#EDEDE9] border border-[#000000] rounded-lg hover:bg-[#D6D6CD] transition-colors"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-[#000000] pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 bg-[#EDEDE9] border border-[#000000] rounded-lg text-black hover:bg-[#D6D6CD] transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-6 py-2 primary-btn rounded-lg"
            disabled={isSubmitting}
          >
            <span>{isSubmitting ? 'Creating...' : 'Create Community'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCommunityModal;

