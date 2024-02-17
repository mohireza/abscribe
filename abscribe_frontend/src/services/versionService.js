import apiClient from "./abscribeAPI";

const addVersion = async (documentId, chunk_index, version_data) => {
  const response = await apiClient.post(
    `/documents/${documentId}/chunks/${chunk_index}/versions`,
    { version_data }
  );
  return response.data;
};

const updateVersion = async (documentId, chunk_index, version_index, version_data) => {
  const response = await apiClient.put(
    `/documents/${documentId}/chunks/${chunk_index}/versions`,
    { version_index, version_data }
  );
  return response.data;
};



const removeVersion = async (documentId, chunk_index, version_index) => {
  const response = await apiClient.delete(
    `/documents/${documentId}/chunks/${chunk_index}/versions/${version_index}`
  );
  return response.data;
};

// const removeVersion = async (documentId, chunk_index, version_index) => {
//   const response = await apiClient.delete(
//     `/documents/${documentId}/chunks/${chunk_index}/versions?version_index=${version_index}`
//   );
//   return response.data;
// };

export { addVersion, updateVersion, removeVersion };
