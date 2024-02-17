import apiClient from "./abscribeAPI";

const getChunks = async (documentId) => {
  const response = await apiClient.get(`/documents/${documentId}/chunks`);
  return response.data;
};

const addChunk = async (documentId, chunk_data) => {
  const response = await apiClient.post(`/documents/${documentId}/chunks`, {
    chunk_data,
  });
  return response.data;
};

const addChunks = async (documentId, chunkDataArray) => {
  const addedChunks = [];

  for (const chunkData of chunkDataArray) {
    const addedChunk = await addChunk(documentId, chunkData);
    addedChunks.push(addedChunk);
  }

  return addedChunks;
};

const getChunk = async (documentId, chunk_index) => {
  const response = await apiClient.get(
    `/documents/${documentId}/chunks/${chunk_index}`
  );
  return response.data;
};

const removeChunk = async (documentId, chunk_index) => {
  const response = await apiClient.delete(
    `/documents/${documentId}/chunks/${chunk_index}`
  );
  return response.data;
};

export { getChunks, addChunk, addChunks, getChunk, removeChunk };
