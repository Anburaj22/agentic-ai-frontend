'use client';

import React from 'react'
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { useFormik } from 'formik';
import * as yup from 'yup';

import PreLoader from './PreLoader';

/** interface: prop type */
interface propsType {
  isOpen: boolean
  manageModal: any
  selectedWorkflow: string
}

/** interface: form data type */
interface FormDataType {
  workflowName: string
  workflowDescription: string
  [key: string]: any
};

/** form validation schema */
const validationSchema = yup.object().shape({
  workflowName: yup
    .string()
    .required('Required'),
  workflowDescription: yup
    .string()
    .required('Required')
    .max(150, 'Maximum 150 characters'),
});

/** component start */
const CloneModal = ({isOpen, manageModal, selectedWorkflow}: propsType) => {

  if (!isOpen) return null

  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const formik = useFormik({
    initialValues: {
      workflowName: '',
      workflowDescription: ''
    },
    validationSchema,
    onSubmit: (values) => {
      console.log(values);
    }
  });

  return (
    <>
      {isLoading ? <PreLoader /> : <></>}
      <div id="fullPageModal"className="h-screen fixed inset-0 z-50 bg-black/50 flex items-center justify-center" style={{zIndex: '999'}}>
        <div className="bg-white bg-white rounded-xl relative p-2 w-1/2">
          <div className="header">
            <div className="close-btn flex justify-between items-center">
              <div className="title w-full text-center"><h5>Clone workflow</h5></div>
              <div className="close">
                <button className='text-gray-500 hover:text-black text-2xl cursor-pointer' onClick={ () => manageModal(false)}>
                  <X />
                </button>
              </div>
            </div>
          </div>
          <div className="body">

            <form className="p-4" onSubmit={formik.handleSubmit}>
              <div className='form-group mb-4'>
                <label className="text-sm text-gray-700 cursor-pointer" htmlFor='workflowName'>Workflow Name</label>
                <input
                  type="text"
                  id='workflowName'
                  name="workflowName"
                  className='text-sm mt-2 w-full px-2 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400'
                  value={formik.values.workflowName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.errors.workflowName && formik.touched.workflowName && (
                  <p className="text-red-800 text-xs mt-1">
                    {formik.errors.workflowName}
                  </p>
                )}
              </div>
              <div className='form-group mb-4'>
                <label className="text-sm text-gray-700 cursor-pointer" htmlFor='workflowDescription'>Workflow Description</label>
                <textarea
                  id='workflowDescription'
                  name='workflowDescription'
                  className='text-sm mt-2 w-full px-2 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400'
                  value={formik.values.workflowDescription}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                ></textarea>
                <span className='info-text text-[10px] italic text-gray-500'>*Only 150 Characters allowed</span>
                {formik.errors.workflowDescription &&
                  formik.touched.workflowDescription && (
                    <p className="text-red-800 text-xs mt-1">
                      {formik.errors.workflowDescription}
                    </p>
                  )}
              </div>
              <div className="form-group mb-4">
                <Button type='submit' className='bg-blue hover:bg-blue-dark w-full'>Clone</Button>
              </div>
            </form>

          </div>
        </div>
      </div>
    </>
  );

}

export default CloneModal;
