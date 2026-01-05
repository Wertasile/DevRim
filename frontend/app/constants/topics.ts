// Preset topics that cannot be modified by users
export type Topic = {
  id: string;
  name: string;
  color: string; // Pale/light background color
  borderColor: string; // Border color (slightly darker)
};

export const TOPICS: Topic[] = [
  { id: "video-games", name: "Video Games", color: "#FFE5E5", borderColor: "#FF9999" },
  { id: "technology", name: "Technology", color: "#E5F3FF", borderColor: "#99CCFF" },
  { id: "sports", name: "Sports", color: "#E5FFE5", borderColor: "#99FF99" },
  { id: "music", name: "Music", color: "#FFF5E5", borderColor: "#FFCC99" },
  { id: "movies-tv", name: "Movies & TV", color: "#F0E5FF", borderColor: "#CC99FF" },
  { id: "books", name: "Books", color: "#FFE5F0", borderColor: "#FF99CC" },
  { id: "art-design", name: "Art & Design", color: "#E5FFFF", borderColor: "#99FFFF" },
  { id: "science", name: "Science", color: "#E5E5FF", borderColor: "#9999FF" },
  { id: "food-cooking", name: "Food & Cooking", color: "#FFF0E5", borderColor: "#FFCC99" },
  { id: "travel", name: "Travel", color: "#E5FFE5", borderColor: "#99FF99" },
  { id: "fitness-health", name: "Fitness & Health", color: "#FFE5F5", borderColor: "#FF99CC" },
  { id: "education", name: "Education", color: "#E5F5FF", borderColor: "#99CCFF" },
  { id: "business", name: "Business", color: "#F5E5FF", borderColor: "#CC99FF" },
  { id: "photography", name: "Photography", color: "#FFE5FF", borderColor: "#FF99FF" },
  { id: "fashion", name: "Fashion", color: "#FFF5FF", borderColor: "#FFCCFF" },
  { id: "pets-animals", name: "Pets & Animals", color: "#E5FFF5", borderColor: "#99FFCC" },
  { id: "gaming", name: "Gaming", color: "#FFE5E5", borderColor: "#FF9999" },
  { id: "programming", name: "Programming", color: "#E5E5F5", borderColor: "#9999CC" },
  { id: "anime-manga", name: "Anime & Manga", color: "#FFE5FF", borderColor: "#FF99FF" },
  { id: "comics", name: "Comics", color: "#FFF0E5", borderColor: "#FFCC99" },
];

// Helper function to get topic by name (for backward compatibility with string-based topics)
export const getTopicByName = (name: string): Topic | undefined => {
  return TOPICS.find(topic => topic.name === name);
};

// Helper function to get topic by id
export const getTopicById = (id: string): Topic | undefined => {
  return TOPICS.find(topic => topic.id === id);
};

