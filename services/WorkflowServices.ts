"use client"

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

/** Add workflow */
export const addWorkflow = async (data: any) => {
  const url = `${baseUrl}/workflows/`;
  const payload = {...getMetaData(), data}
  const response = await axios.post(url, payload);
  return response;
}

/** Get all workflow */
export const getWorkflow = async () => {
  const url = `${baseUrl}/workflows/list`;
  const response = await axios.post(url, getMetaData());
  // return response.data;
  return response;
}

/** Get workflow by ID */
export const getWorkflowById = async (workflowId: number | string) => {
  const url = `${baseUrl}/workflows/details`;
  const payload = {...getMetaData(), workflow_id: workflowId}
  const response = await axios.post(url, payload);
  return response;
}

/** Run workflow by ID */
export const executeWorkflow = async (workflowId: number | string, data: any) => {
  const url = `${baseUrl}/workflows/${workflowId}/run`;
  const response = await axios.post(url, data);
  return response;
}

/** Delete workflow by ID */
export const deleteWorkflow = async (workflowId: number | string) => {
  const url = `${baseUrl}/workflows/${workflowId}/delete`;
  const response = await axios.post(url, getMetaData());
  return response;
}

/** Update workflow by ID */
export const updateWorkflow = async (workflowId: number | string, data: any) => {
  const url = `${baseUrl}/workflows/${workflowId}/update`;
  const payload = {...getMetaData(), data};
  const response = await axios.post(url, payload);
  return response;
}