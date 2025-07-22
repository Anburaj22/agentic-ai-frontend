import axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;
const getMetaData = () => {
  if (typeof window !== 'undefined') {
    return {
      token: localStorage.getItem('access_token'),
      user_name: localStorage.getItem('user_full_name'),
      user_email: localStorage.getItem('user_email'),
    };
  }
  return {
    token: '',
    user_name: '',
    user_email: '',
  };
};

export const getTools = async () => {
  const url = `${baseUrl}/tools/`;
  const response = await axios.post(url, getMetaData() );
  return response.data;
}

export const getToolByName = async (toolId: string | number) => {
  const url = `${baseUrl}/tools/tool-name`;
  const data = {...getMetaData(), id: toolId}
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
  const data = {...getMetaData(), file_name: fileName};
  const response = await axios.post(url, data);
  return response.data;
}

export const getAllUploadedFile = async () => {
  const url = `${baseUrl}/data/filenames/`;
  const response = await axios.get(url);
  return response.data;
}
