import apiClient from "./abscribeAPI";

export const addDocumentFeedback = async (documentId, feedbackData) => {
  const response = await apiClient.post(`/documents/${documentId}/feedback`, feedbackData);
  return response.data;
};
  
export const getDocumentFeedbacks = async (documentId) => {
  const response = await apiClient.get(`/documents/${documentId}/feedback`);
  return response.data;
};

export const getDocumentFeedback = async (documentId, feedbackId) => {
  const response = await apiClient.get(`/documents/${documentId}/feedback/${feedbackId}`);
  return response.data;
};

export const removeDocumentFeedback = async (documentId, feedbackId) => { 
  await apiClient.delete(`/documents/${documentId}/feedback/${feedbackId}`);
};
  
export const addChunkFeedback = async (documentId, chunkIndex, feedbackData) => {
  const response = await apiClient.post(`/documents/${documentId}/chunks/${chunkIndex}/feedback`, feedbackData);
  return response.data;
};

export const getChunkFeedbacks = async (documentId, chunkIndex) => {
  const response = await apiClient.get(`/documents/${documentId}/chunks/${chunkIndex}/feedback`);
  return response.data;
};

export const getChunkFeedback = async (documentId, chunkIndex, feedbackId) => {
  const response = await apiClient.get(`/documents/${documentId}/chunks/${chunkIndex}/feedback/${feedbackId}`);
  return response.data;
};

export const removeChunkFeedback = async (documentId, chunkIndex, feedbackId) => {
  await apiClient.delete(`/documents/${documentId}/chunks/${chunkIndex}/feedback/${feedbackId}`);
};

export const addVersionFeedback = async (documentId, versionId, feedbackData) => {
  const response = await apiClient.post(`/documents/${documentId}/versions/${versionId}/feedback`, feedbackData);
  return response.data;
};

export const getVersionFeedbacks = async (documentId, versionId) => {
  const response = await apiClient.get(`/documents/${documentId}/versions/${versionId}/feedback`);
  return response.data;
};

export const getVersionFeedback = async (documentId, versionId, feedbackId) => {
  const response = await apiClient.get(`/documents/${documentId}/versions/${versionId}/feedback/${feedbackId}`);
  return response.data;
};

export const removeVersionFeedback = async (documentId, versionId, feedbackId) => {
  await apiClient.delete(`/documents/${documentId}/versions/${versionId}/feedback/${feedbackId}`);
};
