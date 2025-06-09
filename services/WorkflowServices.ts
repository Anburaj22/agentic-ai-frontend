import axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;
const metaData = {
  token: 'random-string-passed', //localStorage.getItem('access_token')
  user_name: '',
  user_email: 'palash.gupta@apexon.com'
}

export const addWorkflow = async (data: any) => {
  const url = `${baseUrl}/workflows/`;
  const payload = {...metaData, data}
  const response = await axios.post(url, payload);
  return response.data;
}

export const getWorkflow = async () => {
  const url = `${baseUrl}/workflows/list`;
  const response = await axios.post(url, metaData);
  return response.data;
}

export const getWorkflowById = async (workflowId: number | string) => {
  const url = `${baseUrl}/workflows/details`;
  const payload = {...metaData, workflow_id: workflowId}
  const response = await axios.post(url, payload);
  return response.data;
}

export const executeWorkflow = async (workflowId: number | string) => {
  const url = `${baseUrl}/workflows/${workflowId}/run`;
  const response = await axios.post(url, metaData);
  console.log(response.data);
}

export const deleteWorkflow = async (workflowId: number | string) => {
  const url = `${baseUrl}/workflows/${workflowId}/delete`;
  const response = await axios.post(url, metaData);
  return response;
}
