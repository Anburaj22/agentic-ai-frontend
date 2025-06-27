import axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;
const metaData = {
  token: 'random-token', //localStorage.getItem('access_token')
  user_name: 'random-user-name',
  user_email: 'user@apexon.com'
}

export const getTools = async () => {
  const url = `${baseUrl}/tools/`;
  const response = await axios.post(url, metaData);
  return response.data;
}

export const getToolByName = async (toolId: string | number) => {
  const url = `${baseUrl}/tools/tool-name`;
  const data = {...metaData, id: toolId}
  const response = await axios.post(url, data);
  return response.data;
}

export const fileUploadForTool = async (formData: any) => {
  const url = `${baseUrl}/data/upload/`;
  const response = await axios.post(url, formData);
  return response.data;
}

export const getUploadedFileByName = async ( fileName: String) => {
  const url = `${baseUrl}/data/get_files/`;
  const data = {...metaData, file_name: fileName};
  const response = await axios.post(url, data);
  return response.data;
}

export const getAllUploadedFile = async () => {
  const url = `${baseUrl}/data/filenames/`;
  const response = await axios.get(url);
  return response.data;
}
