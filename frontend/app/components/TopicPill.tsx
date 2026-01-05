import React from 'react';
import { getTopicByName } from '~/constants/topics';

type TopicPillProps = {
  topicName: string;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'selected' | 'unselected';
};

const TopicPill = ({ 
  topicName, 
  onClick, 
  className = '', 
  size = 'medium',
  variant = 'default'
}: TopicPillProps) => {
  const topic = getTopicByName(topicName);
  
  if (!topic) {
    // Fallback if topic not found
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs border-2 font-medium ${className}`}
        style={{
          backgroundColor: '#f0f0f0',
          borderColor: '#cccccc',
          color: '#1f2735',
        }}
      >
        {topicName}
      </span>
    );
  }

  const sizeClasses = {
    small: 'px-2 py-0.5 text-xs',
    medium: 'px-2 py-1 text-xs',
    large: 'px-3 py-1.5 text-sm',
  };

  const variantStyles = {
    default: {
      backgroundColor: topic.color,
      borderColor: topic.borderColor,
      color: '#1f2735',
    },
    selected: {
      backgroundColor: topic.color,
      borderColor: topic.borderColor,
      color: '#1f2735',
    },
    unselected: {
      backgroundColor: 'white',
      borderColor: topic.borderColor,
      color: '#1f2735',
    },
  };

  return (
    <span
      onClick={onClick}
      className={`${sizeClasses[size]} rounded-full border-2 font-medium transition-all ${
        onClick ? 'cursor-pointer hover:scale-105' : ''
      } ${className}`}
      style={variantStyles[variant]}
    >
      {topic.name}
    </span>
  );
};

export default TopicPill;

