/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../utils/api';
import ButtonLoader from '../../../components/buttonLoader';

const validationSchema = Yup.object({
  password: Yup.string()
    .min(8, 'Le mot de passe doit comporter au moins 8 caractères')
    .matches(/[a-z]/, 'Doit inclure au moins une lettre minuscule')
    .matches(/[A-Z]/, 'Doit inclure au moins une lettre majuscule')
    .matches(/\d/, 'Doit inclure au moins un chiffre')
    .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Doit inclure un caractère spécial')
    .required('Le mot de passe est obligatoire'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Les mots de passe ne correspondent pas')
    .required('Confirmation du mot de passe obligatoire')
});

const SetPassword = () => {
  const [show, setShow] = useState({ password: false, confirmPassword: false });
  const [serverError, setServerError] = useState<null | string>(null);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isAlreadyDefined, setIsAlreadyDefined] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const [success, setSuccess] = useState(false);
  const token = new URLSearchParams(window.location.search).get('t');

  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await api.post('/auth/verify-token', {
          token
        });
        if (response.status === 200) {
          setIsTokenValid(true); // Token is valid
        }
      } catch (error) {
        setIsTokenValid(false);
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [navigate, token]);

  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: ''
    },
    validationSchema,
    onSubmit: async values => {
      setServerError('');
      setIsSubmitting(true);
      try {
        const response = await api.post(
          '/auth/save-password',
          {
            token,
            password: values.password
          },
          { headers: { 'Content-Type': 'application/json' } }
        );

        if (response) {
          setSuccess(true);
        }
        setIsSubmitting(false);

        setTimeout(() => navigate('/login'), 3000);
      } catch (error: any) {
        setIsSubmitting(false);

        if (error.response.status === 403) {
          setIsAlreadyDefined(true);
        }

        if (error.response.data.message) {
          setServerError(
            error.response.data.message || 'Une erreur est survenue'
          );
        }
      }
    }
  });

  if (loading) return <div>Chargement...</div>;

  if (!isTokenValid) {
    return (
      <div>
        <section className='bg-gray-50 dark:bg-gray-900 '>
          <div className='flex flex-col items-center justify-center px-6 py-8 mx-auto  h-screen lg:py-0'>
            <div className='w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700'>
              <div className='p-6 space-y-4 md:space-y-6 sm:p-8'>
                <h1 className='text-xl text-center font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white'>
                  Définissez votre mot de passe
                </h1>

                <div>
                  <div
                    className='p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400'
                    role='alert'
                  >
                    <span className='font-medium'>
                      Une erreur est survenue:{' '}
                    </span>{' '}
                    Votre lien a expiré ou vous avez déjà défini votre mot de
                    passe. Veuillez vous connecter ou réinitialiser votre mot de
                    passe.
                  </div>
                  <div className='flex flex-col items-center justify-center gap-3'>
                    <button
                      type='button'
                      onClick={() => navigate('/login')}
                      className={`w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 bg-blue-500`}
                    >
                      Me connecter
                    </button>
                    <button
                      type='button'
                      onClick={() => navigate('/forgot-password')}
                      className={`w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 bg-blue-500`}
                    >
                      Réinitialiser mon mot de passe
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <section className='bg-gray-50 dark:bg-gray-900 '>
        <div className='flex flex-col items-center justify-center px-6 py-8 mx-auto  h-screen lg:py-0'>
          <a
            href='#'
            className='flex flex-col items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white'
          >
            <img
              className='w-20 h-20 mb-2'
              src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJzhChHRV_AoEoU3LP99NpWWugkccb9eE0yA&s'
              alt='logo'
            />
            SYSTÈME POINTAGE PRÉSENCE SIMPLON PITA P02
          </a>
          <div className='w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700'>
            <div className='p-6 space-y-4 md:space-y-6 sm:p-8'>
              <h1 className='text-xl text-center font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white'>
                Définissez votre mot de passe
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
              {success ? (
                <p className='text-green-600 text-center'>
                  Mot de passe défini avec succès ! Redirection...
                </p>
              ) : (
                <>
                  {isAlreadyDefined ? (
                    <>
                      <button
                        type='button'
                        onClick={() => navigate('/forgot-password')}
                        className={`w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 ${formik.isValid ? 'bg-blue-500' : 'bg-gray-400'}`}
                      >
                        Réinitialiser le mot de passe
                      </button>
                    </>
                  ) : (
                    <>
                      <form
                        onSubmit={formik.handleSubmit}
                        className='space-y-4 md:space-y-6'
                        action='#'
                      >
                        <div>
                          <label
                            htmlFor='password'
                            className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'
                          >
                            Mot de passe
                          </label>
                          <div className='relative'>
                            <input
                              type={show.password ? 'text' : 'password'}
                              name='password'
                              id='password'
                              value={formik.values.password}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              placeholder='••••••••'
                              className={`bg-gray-50 border text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 ${
                                formik.touched.password &&
                                formik.errors.password
                                  ? 'border-red-500'
                                  : 'border-gray-300'
                              } ${
                                formik.touched.password &&
                                !formik.errors.password &&
                                'dark:focus:border-blue-500'
                              }`}
                            />
                            <button
                              type='button'
                              onClick={() =>
                                setShow(prev => ({
                                  ...prev,
                                  password: !prev.password
                                }))
                              }
                              className='absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700'
                            >
                              {show.password ? '🙈' : '👁️'}
                            </button>
                          </div>
                          {formik.touched.password && formik.errors.password ? (
                            <div className='text-red-500 text-sm mt-1'>
                              {formik.errors.password}
                            </div>
                          ) : null}
                        </div>

                        <div>
                          <label
                            htmlFor='password'
                            className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'
                          >
                            Mot de passe
                          </label>
                          <div className='relative'>
                            <input
                              type={show.confirmPassword ? 'text' : 'password'}
                              name='confirmPassword'
                              id='confirmPassword'
                              value={formik.values.confirmPassword}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              placeholder='••••••••'
                              className={`bg-gray-50 border text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 ${
                                formik.touched.confirmPassword &&
                                formik.errors.confirmPassword
                                  ? 'border-red-500'
                                  : 'border-gray-300'
                              } ${
                                formik.touched.confirmPassword &&
                                !formik.errors.confirmPassword &&
                                'dark:focus:border-blue-500'
                              }`}
                            />
                            <button
                              type='button'
                              onClick={() =>
                                setShow(prev => ({
                                  ...prev,
                                  confirmPassword: !prev.confirmPassword
                                }))
                              }
                              className='absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700'
                            >
                              {show.confirmPassword ? '🙈' : '👁️'}
                            </button>
                          </div>
                          {formik.touched.confirmPassword &&
                          formik.errors.confirmPassword ? (
                            <div className='text-red-500 text-sm mt-1'>
                              {formik.errors.confirmPassword}
                            </div>
                          ) : null}
                        </div>

                        <button
                          type='submit'
                          disabled={!formik.isValid}
                          className={`w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 ${formik.isValid ? 'bg-blue-500' : 'bg-gray-400'}`}
                        >
                          Définir le mot de passe
                          {isSubmitting && <ButtonLoader />}
                        </button>
                      </form>
                    </>
                  )}{' '}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SetPassword;
