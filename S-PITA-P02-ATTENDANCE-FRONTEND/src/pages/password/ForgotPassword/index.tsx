/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../utils/api';

const ForgotPassword = () => {
  const [serverError, setServerError] = useState<null | string>(null);
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState('');

  const formik = useFormik({
    initialValues: { email: '' },
    validationSchema: Yup.object({
      email: Yup.string().email('Email invalide').required('Email requis')
    }),
    onSubmit: async values => {
      setServerError('');

      try {
        const response = await api.post(
          '/auth/forgot-password',
          {
            ...values
          },
          { headers: { 'Content-Type': 'application/json' } }
        );

        if (response.status === 200) {
          setSuccessMessage(response.data.message);
        }
      } catch (error: any) {
        if (error.response.data.message) {
          setServerError(
            error.response.data.message || 'Une erreur est survenue'
          );
        }
      }
    }
  });

  return (
    <div>
      <section className='bg-gray-50 dark:bg-gray-900 '>
        <div className='flex flex-col items-center justify-center px-6 py-8 mx-auto  h-screen lg:py-0'>
          <a
            href='#'
            className='flex flex-col text-center items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white'
          >
            <img
              className='w-20 h-20 mb-2'
              src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJzhChHRV_AoEoU3LP99NpWWugkccb9eE0yA&s'
              alt='logo'
            />
            <span>SYSTÈME POINTAGE PRÉSENCE SIMPLON PITA P02</span>
          </a>
          <div className='w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700'>
            <div className='p-6 space-y-4 md:space-y-6 sm:p-8'>
              <h1 className='text-xl text-center font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white'>
                Réinitialisez de votre mot de passe
              </h1>

              {serverError && (
                <div
                  className='p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400'
                  role='alert'
                >
                  <span className='font-medium'>Une erreur est survenue: </span>{' '}
                  {serverError}
                </div>
              )}
              {successMessage ? (
                <>
                  <p className='text-green-600 text-center'>{successMessage}</p>
                  <button
                    type='button'
                    onClick={() => navigate('/login')}
                    className={`w-full text-white bg-blue-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 `}
                  >
                    Retour à la page de connexion
                  </button>
                </>
              ) : (
                <form
                  onSubmit={formik.handleSubmit}
                  className='space-y-4 md:space-y-6'
                  action='#'
                >
                  <div>
                    <label
                      htmlFor='email'
                      className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'
                    >
                      Adresse email
                    </label>
                    <div className='relative'>
                      <input
                        id='email'
                        type='email'
                        name='email'
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder='••••••••'
                        className={`bg-gray-50 border text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 ${
                          formik.touched.email && formik.errors.email
                            ? 'border-red-500'
                            : 'border-gray-300'
                        } ${
                          formik.touched.email &&
                          !formik.errors.email &&
                          'dark:focus:border-blue-500'
                        }`}
                      />
                    </div>
                    {formik.touched.email && formik.errors.email ? (
                      <div className='text-red-500 text-sm mt-1'>
                        {formik.errors.email}
                      </div>
                    ) : null}
                  </div>

                  <div className='flex flex-row gap-6'>
                    <button
                      type='button'
                      onClick={() => navigate('/login')}
                      className={`w-full text-white bg-blue-500 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800`}
                    >
                      Annuler
                    </button>
                    <button
                      type='submit'
                      disabled={!formik.isValid}
                      className={`w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 ${formik.isValid ? 'bg-green-500' : 'bg-gray-400'}`}
                    >
                      M'envoyer un mail
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ForgotPassword;
