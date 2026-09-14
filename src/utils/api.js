const BASE_URL = 'https://forum-api.dicoding.dev/v1';

async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('token');

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, config);
  const responseJson = await response.json();

  if (!response.ok) {
    throw new Error(responseJson.message || 'Something went wrong');
  }

  return responseJson;
}

// Auth API
export const register = async ({ name, email, password }) => {
  const response = await fetchWithAuth(`${BASE_URL}/register`, {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  return response;
};

export const login = async ({ email, password }) => {
  const response = await fetchWithAuth(`${BASE_URL}/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return response;
};

export const getOwnProfile = async () => {
  const response = await fetchWithAuth(`${BASE_URL}/users/me`);
  return response;
};

// Threads API
export const getThreads = async () => {
  const response = await fetchWithAuth(`${BASE_URL}/threads`);
  return response;
};

export const getThreadDetail = async (threadId) => {
  const response = await fetchWithAuth(`${BASE_URL}/threads/${threadId}`);
  return response;
};

export const createThread = async ({ title, body, category = '' }) => {
  const response = await fetchWithAuth(`${BASE_URL}/threads`, {
    method: 'POST',
    body: JSON.stringify({ title, body, category }),
  });
  return response;
};

// Comments API
export const createComment = async (threadId, content) => {
  const response = await fetchWithAuth(`${BASE_URL}/threads/${threadId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
  return response;
};

// Votes API
export const upVoteThread = async (threadId) => {
  const response = await fetchWithAuth(`${BASE_URL}/threads/${threadId}/up-vote`, {
    method: 'POST',
  });
  return response;
};

export const downVoteThread = async (threadId) => {
  const response = await fetchWithAuth(`${BASE_URL}/threads/${threadId}/down-vote`, {
    method: 'POST',
  });
  return response;
};

export const neutralizeVoteThread = async (threadId) => {
  const response = await fetchWithAuth(`${BASE_URL}/threads/${threadId}/neutral-vote`, {
    method: 'POST',
  });
  return response;
};

export const upVoteComment = async (threadId, commentId) => {
  const response = await fetchWithAuth(
    `${BASE_URL}/threads/${threadId}/comments/${commentId}/up-vote`,
    {
      method: 'POST',
    },
  );
  return response;
};

export const downVoteComment = async (threadId, commentId) => {
  const response = await fetchWithAuth(
    `${BASE_URL}/threads/${threadId}/comments/${commentId}/down-vote`,
    {
      method: 'POST',
    },
  );
  return response;
};

export const neutralizeVoteComment = async (threadId, commentId) => {
  const response = await fetchWithAuth(
    `${BASE_URL}/threads/${threadId}/comments/${commentId}/neutral-vote`,
    {
      method: 'POST',
    },
  );
  return response;
};

// Leaderboard API
export const getLeaderboards = async () => {
  const response = await fetchWithAuth(`${BASE_URL}/leaderboards`);
  return response;
};

// Users API
export const getUsers = async () => {
  const response = await fetchWithAuth(`${BASE_URL}/users`);
  return response;
};

export const getUserById = async (userId) => {
  const response = await fetchWithAuth(`${BASE_URL}/users`);
  const { users } = response.data;
  return users.find((user) => user.id === userId);
};
