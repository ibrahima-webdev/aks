/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/authContext';
import { api } from '../../utils/api';
import ButtonLoader from '../../components/buttonLoader';

const validationSchema = Yup.object({
  email: Yup.string()
    .email("L'email n'est pas valide")
    .required("L'email est requis"),
  password: Yup.string()
    .required('Le mot de passe est requis')
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .matches(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .matches(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .matches(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
    .matches(
      /[@$!%*?&]/,
      'Le mot de passe doit contenir au moins un caractère spécial (@$!%*?&)'
    )
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<null | string>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema,
    onSubmit: async values => {
      setIsLoading(true);
      try {
        const response = await api.post('/auth/login', {
          email: values.email,
          password: values.password
        });

        localStorage.setItem('user', JSON.stringify(response.data));
        localStorage.setItem('token', response.data.token);
        login(response.data, response.data.token);
        setIsLoading(false);

        navigate('/accueil');
      } catch (error: any) {
        setIsLoading(false);
        if (error.response.data.message) {
          setServerError(error.response.data.message);
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
            className='flex flex-col items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white'
          >
            <img
              className='w-20 h-20 mb-2'
              src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJzhChHRV_AoEoU3LP99NpWWugkccb9eE0yA&s'
              alt='logo'
            />
            SIMPLON P02
          </a>
          <div className='w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700'>
            <div className='p-6 space-y-4 md:space-y-6 sm:p-8'>
              <h1 className='text-xl text-center font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white'>
                Connectez vous a votre compte
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
                    Votre adresse mail
                  </label>
                  <input
                    type='email'
                    name='email'
                    id='email'
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`bg-gray-50 border text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 ${
                      formik.touched.email && formik.errors.email
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                    placeholder='nom@gmail.com'
                  />
                  {formik.touched.email && formik.errors.email ? (
                    <div className='text-red-500 text-sm mt-1'>
                      {formik.errors.email}
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
                      type={showPassword ? 'text' : 'password'}
                      name='password'
                      id='password'
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder='••••••••'
                      className={`bg-gray-50 border text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 ${
                        formik.touched.password && formik.errors.password
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
                      onClick={() => setShowPassword(!showPassword)}
                      className='absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700'
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {formik.touched.password && formik.errors.password ? (
                    <div className='text-red-500 text-sm mt-1'>
                      {formik.errors.password}
                    </div>
                  ) : null}
                </div>
                <div className='flex items-end justify-end'>
                  <a
                    href='/forgot-password'
                    className='text-sm font-medium text-black text-primary-600 hover:underline dark:text-primary-500'
                  >
                    Mot de passe oublié?
                  </a>
                </div>
                <button
                  type='submit'
                  disabled={!formik.isValid || isLoading}
                  className={`w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 ${formik.isValid || !isLoading ? 'bg-blue-500' : 'bg-gray-400'}`}
                >
                  Connexion
                  {isLoading && <ButtonLoader />}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Login;
