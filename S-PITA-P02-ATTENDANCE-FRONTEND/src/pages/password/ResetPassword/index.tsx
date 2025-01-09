/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../../utils/api';

const validationSchema = Yup.object({
  newPassword: Yup.string()
    .required('Mot de passe obligatoire')
    .min(8, 'Le mot de passe doit comporter au moins 8 caractères')
    .matches(/[a-z]/, 'Doit inclure au moins une lettre minuscule')
    .matches(/[A-Z]/, 'Doit inclure au moins une lettre majuscule')
    .matches(/\d/, 'Doit inclure au moins un chiffre')
    .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Doit inclure un caractère spécial'),
  confirmNewPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Les mots de passe ne correspondent pas')
    .required('Confirmation du mot de passe obligatoire')
});

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<null | string>(null);
  const navigate = useNavigate();
  const { token } = useParams();
  const [success, setSuccess] = useState(false);

  const formik = useFormik({
    initialValues: {
      newPassword: '',
      confirmNewPassword: ''
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      setServerError('');

      try {
        const response = await api.post(
          `/auth/reset-password/${token}`,
          {
            newPassword: values.newPassword
          },
          { headers: { 'Content-Type': 'application/json' } }
        );

        if (response) {
          setSuccess(true);
          resetForm();
        }

        setTimeout(() => navigate('/login'), 3000);
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
                Définissez votre nouveau mot de passe
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
                  Mot de passe réinitialisé avec succès ! Redirection...
                </p>
              ) : (
                <form
                  onSubmit={formik.handleSubmit}
                  className='space-y-4 md:space-y-6'
                  action='#'
                >
                  <div>
                    <label
                      htmlFor='newPassword'
                      className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'
                    >
                      Nouveau mot de passe
                    </label>
                    <div className='relative'>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name='newPassword'
                        id='newPassword'
                        value={formik.values.newPassword}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder='•••••••••••••'
                        className={`bg-gray-50 border text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 ${
                          formik.touched.newPassword &&
                          formik.errors.newPassword
                            ? 'border-red-500'
                            : 'border-gray-300'
                        } ${
                          formik.touched.newPassword &&
                          !formik.errors.newPassword &&
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
                    {formik.touched.newPassword && formik.errors.newPassword ? (
                      <div className='text-red-500 text-sm mt-1'>
                        {formik.errors.newPassword}
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <label
                      htmlFor='confirmNewPassword'
                      className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'
                    >
                      Confirmer le mot de passe
                    </label>
                    <div className='relative'>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name='confirmNewPassword'
                        id='confirmNewPassword'
                        value={formik.values.confirmNewPassword}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder='•••••••••••••'
                        className={`bg-gray-50 border text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 ${
                          formik.touched.confirmNewPassword &&
                          formik.errors.confirmNewPassword
                            ? 'border-red-500'
                            : 'border-gray-300'
                        } ${
                          formik.touched.confirmNewPassword &&
                          !formik.errors.confirmNewPassword &&
                          'dark:focus:border-blue-500'
                        }`}
                      />
                      <button
                        type='button'
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className='absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700'
                      >
                        {showConfirmPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                    {formik.touched.confirmNewPassword &&
                    formik.errors.confirmNewPassword ? (
                      <div className='text-red-500 text-sm mt-1'>
                        {formik.errors.confirmNewPassword}
                      </div>
                    ) : null}
                  </div>

                  <button
                    type='submit'
                    disabled={!formik.isValid}
                    className={`w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 ${formik.isValid ? 'bg-blue-500' : 'bg-gray-400'}`}
                  >
                    Valider
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ResetPassword;
