import axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;
const metaData = {
  token: 'random-string-passed', //localStorage.getItem('access_token')
  user_name: '',
  user_email: ''
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
