const API_URL = import.meta.env.VITE_API_URL;

interface UpdateUserData {
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  byline?: string;
  about?: string;
}

const updateUser = async (data: UpdateUserData) => {
  const response = await fetch(`${API_URL}/users/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to update user' }));
    throw new Error(errorData.message || 'Failed to update user');
  }

  const result = await response.json();
  return result;
};

export default updateUser;


