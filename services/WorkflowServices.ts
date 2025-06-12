import axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;
const metaData = {
  token: 'random-token', //localStorage.getItem('access_token')
  user_name: 'random-user-name',
  user_email: 'user@apexon.com'
}

/** Add workflow */
export const addWorkflow = async (data: any) => {
  const url = `${baseUrl}/workflows/`;
  const payload = {...metaData, data}
  const response = await axios.post(url, payload);
  return response;
}

/** Get all workflow */
export const getWorkflow = async () => {
  const url = `${baseUrl}/workflows/list`;
  const response = await axios.post(url, metaData);
  // return response.data;
  return response;
}

/** Get workflow by ID */
export const getWorkflowById = async (workflowId: number | string) => {
  const url = `${baseUrl}/workflows/details`;
  const payload = {...metaData, workflow_id: workflowId}
  const response = await axios.post(url, payload);
  return response;
}

/** Run workflow by ID */
export const executeWorkflow = async (workflowId: number | string) => {
  const url = `${baseUrl}/workflows/${workflowId}/run`;
  const response = await axios.post(url, metaData);
  return response;
}

/** Delete workflow by ID */
export const deleteWorkflow = async (workflowId: number | string) => {
  const url = `${baseUrl}/workflows/${workflowId}/delete`;
  const response = await axios.post(url, metaData);
  return response;
}

/** Update workflow by ID */
export const updateWorkflow = async (workflowId: number | string, data: any) => {
  const url = `${baseUrl}/workflows/${workflowId}/update`;
  const payload = {...metaData, data};
  const response = await axios.post(url, payload);
  return response;
}