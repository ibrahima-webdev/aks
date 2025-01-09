import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import 'react-phone-number-input/style.css';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input/input';
import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/authContext';
import { api } from '../../utils/api';
import ButtonLoader from '../../components/buttonLoader';

const validationSchema = Yup.object({
  email: Yup.string()
    .email("L'email n'est pas valide.")
    .required("L'email est requis."),
  fullName: Yup.string().required('Le champ ne peut pas être vide.'),
  phoneNumber: Yup.string()
    .required('Le numéro de téléphone est requis.')
    .test(
      'is-valid-phone',
      'Numéro de téléphone invalide pour le pays.',
      value => isValidPhoneNumber(value)
    ),
  role: Yup.string()
    .required('Veuillez sélectionner un rôle.')
    .oneOf(['Admin', 'Student'], 'Le rôle sélectionné est invalide.')
});

const AddStudent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [serverError, setServerError] = useState<null | string>(null);
  const [successMessage, setSuccessMessage] = useState<null | string>(null);

  const formik = useFormik({
    initialValues: {
      email: '',
      fullName: '',
      phoneNumber: '',
      role: ''
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      setIsLoading(true);

      try {
        const response = await api.post(
          '/user/add',
          {
            email: values.email,
            name: values.fullName,
            phoneNumber: values.phoneNumber,
            role: values.role.toLowerCase()
          },
          {
            headers: {
              Authorization: `Bearer ${user?.token}`
            }
          }
        );

        if (response.status === 201 && response.data.message) {
          setIsLoading(false);
          setSuccessMessage(response.data.message);
          resetForm();
        }
      } catch (error: any) {
        setIsLoading(false);
        resetForm();
        if (error.response.data.message) {
          setServerError(error.response.data.message);
        }
      }
    }
  });

  useEffect(() => {
    if (serverError) {
      setTimeout(() => setServerError(''), 5000);
    }

    if (successMessage) {
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  }, [serverError, successMessage]);

  return (
    <>
      <div className='mx-auto max-w-270'>
        <Breadcrumb pageName='Ajouter un utilisateur' />
        <div className='grid grid-cols-12 gap-8 items-center justify-center'>
          <div className='col-span-12 xl:col-span-12'>
            <div className='rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark'>
              <div className='border-b border-stroke py-4 px-7 dark:border-strokedark'>
                <h3 className='font-medium text-black dark:text-white'>
                  Information de l'utilisateur
                </h3>
              </div>

              {serverError && (
                <div
                  className='flex items-center p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400'
                  role='alert'
                >
                  <svg
                    className='flex-shrink-0 inline w-4 h-4 me-3'
                    aria-hidden='true'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path d='M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z' />
                  </svg>
                  <div>
                    <span className='font-medium'>Erreur: </span> {serverError}
                  </div>
                </div>
              )}
              {successMessage && (
                <div
                  className='p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400'
                  role='alert'
                >
                  <span className='font-medium'>Info Succès: </span>
                  {successMessage}.
                </div>
              )}
              <div className='p-7'>
                <form onSubmit={formik.handleSubmit}>
                  <div className='mb-5.5 flex flex-col gap-5.5 sm:flex-row'>
                    <div className='w-full sm:w-1/2'>
                      <label
                        className='mb-3 block text-sm font-medium text-black dark:text-white'
                        htmlFor='fullName'
                      >
                        Nom complet
                      </label>
                      <div className='relative'>
                        <span className='absolute left-4.5 top-4'>
                          <svg
                            className='fill-current'
                            width='20'
                            height='20'
                            viewBox='0 0 20 20'
                            fill='none'
                            xmlns='http://www.w3.org/2000/svg'
                          >
                            <g opacity='0.8'>
                              <path
                                fillRule='evenodd'
                                clipRule='evenodd'
                                d='M3.72039 12.887C4.50179 12.1056 5.5616 11.6666 6.66667 11.6666H13.3333C14.4384 11.6666 15.4982 12.1056 16.2796 12.887C17.061 13.6684 17.5 14.7282 17.5 15.8333V17.5C17.5 17.9602 17.1269 18.3333 16.6667 18.3333C16.2064 18.3333 15.8333 17.9602 15.8333 17.5V15.8333C15.8333 15.1703 15.5699 14.5344 15.1011 14.0655C14.6323 13.5967 13.9964 13.3333 13.3333 13.3333H6.66667C6.00363 13.3333 5.36774 13.5967 4.8989 14.0655C4.43006 14.5344 4.16667 15.1703 4.16667 15.8333V17.5C4.16667 17.9602 3.79357 18.3333 3.33333 18.3333C2.8731 18.3333 2.5 17.9602 2.5 17.5V15.8333C2.5 14.7282 2.93899 13.6684 3.72039 12.887Z'
                                fill=''
                              />
                              <path
                                fillRule='evenodd'
                                clipRule='evenodd'
                                d='M9.99967 3.33329C8.61896 3.33329 7.49967 4.45258 7.49967 5.83329C7.49967 7.214 8.61896 8.33329 9.99967 8.33329C11.3804 8.33329 12.4997 7.214 12.4997 5.83329C12.4997 4.45258 11.3804 3.33329 9.99967 3.33329ZM5.83301 5.83329C5.83301 3.53211 7.69849 1.66663 9.99967 1.66663C12.3009 1.66663 14.1663 3.53211 14.1663 5.83329C14.1663 8.13448 12.3009 9.99996 9.99967 9.99996C7.69849 9.99996 5.83301 8.13448 5.83301 5.83329Z'
                                fill=''
                              />
                            </g>
                          </svg>
                        </span>
                        <input
                          className={`w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary ${
                            formik.touched.fullName && formik.errors.fullName
                              ? 'border-red-500'
                              : 'border-gray-300'
                          }`}
                          type='text'
                          name='fullName'
                          id='fullName'
                          value={formik.values.fullName}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          placeholder='Ibrahim Bah'
                        />
                        {formik.touched.fullName && formik.errors.fullName ? (
                          <div className='text-red-500 text-sm mt-1'>
                            {formik.errors.fullName}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className='w-full sm:w-1/2'>
                      <label
                        className='mb-3 block text-sm font-medium text-black dark:text-white'
                        htmlFor='phoneNumber'
                      >
                        Numéro de téléphone
                      </label>
                      <PhoneInput
                        id='phoneNumber'
                        name='phoneNumber'
                        international
                        defaultCountry='GN'
                        value={formik.values.phoneNumber}
                        onChange={value =>
                          formik.setFieldValue('phoneNumber', value)
                        }
                        placeholder='000 00 00 00'
                        onBlur={formik.handleBlur}
                        className={`w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary ${
                          formik.touched.phoneNumber &&
                          formik.errors.phoneNumber
                            ? 'border-red-500'
                            : 'border-gray-300'
                        }`}
                      />
                      {formik.touched.phoneNumber &&
                      formik.errors.phoneNumber ? (
                        <div className='text-red-500 text-sm mt-1'>
                          {formik.errors.phoneNumber}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className='mb-5.5'>
                    <label
                      className='mb-3 block text-sm font-medium text-black dark:text-white'
                      htmlFor='email'
                    >
                      Addresse Email
                    </label>
                    <div className='relative'>
                      <span className='absolute left-4.5 top-4'>
                        <svg
                          className='fill-current'
                          width='20'
                          height='20'
                          viewBox='0 0 20 20'
                          fill='none'
                          xmlns='http://www.w3.org/2000/svg'
                        >
                          <g opacity='0.8'>
                            <path
                              fillRule='evenodd'
                              clipRule='evenodd'
                              d='M3.33301 4.16667C2.87658 4.16667 2.49967 4.54357 2.49967 5V15C2.49967 15.4564 2.87658 15.8333 3.33301 15.8333H16.6663C17.1228 15.8333 17.4997 15.4564 17.4997 15V5C17.4997 4.54357 17.1228 4.16667 16.6663 4.16667H3.33301ZM0.833008 5C0.833008 3.6231 1.9561 2.5 3.33301 2.5H16.6663C18.0432 2.5 19.1663 3.6231 19.1663 5V15C19.1663 16.3769 18.0432 17.5 16.6663 17.5H3.33301C1.9561 17.5 0.833008 16.3769 0.833008 15V5Z'
                              fill=''
                            />
                            <path
                              fillRule='evenodd'
                              clipRule='evenodd'
                              d='M0.983719 4.52215C1.24765 4.1451 1.76726 4.05341 2.1443 4.31734L9.99975 9.81615L17.8552 4.31734C18.2322 4.05341 18.7518 4.1451 19.0158 4.52215C19.2797 4.89919 19.188 5.4188 18.811 5.68272L10.4776 11.5161C10.1907 11.7169 9.80879 11.7169 9.52186 11.5161L1.18853 5.68272C0.811486 5.4188 0.719791 4.89919 0.983719 4.52215Z'
                              fill=''
                            />
                          </g>
                        </svg>
                      </span>
                      <input
                        className={`w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary ${
                          formik.touched.email && formik.errors.email
                            ? 'border-red-500'
                            : 'border-gray-300'
                        }`}
                        type='email'
                        name='email'
                        id='email'
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder='devidjond45@gmail.com'
                      />
                      {formik.touched.email && formik.errors.email ? (
                        <div className='text-red-500 text-sm mt-1'>
                          {formik.errors.email}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <label
                      className='mb-3 block text-sm font-medium text-black dark:text-white'
                      htmlFor='email'
                    >
                      Rôle de l'utilisateur
                    </label>
                    <div className='mb-5.5 flex flex-col gap-5.5 sm:flex-row'>
                      <div className='w-full sm:w-1/2 flex items-center ps-4 border border-gray-200 rounded dark:border-gray-700'>
                        <input
                          id='Admin'
                          type='radio'
                          value='Admin'
                          name='role'
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          checked={formik.values.role === 'Admin'}
                          className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
                        />
                        <label
                          htmlFor='Admin'
                          className='w-full py-4 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300'
                        >
                          Admin
                        </label>
                      </div>
                      <div className='w-full sm:w-1/2 flex items-center ps-4 border border-gray-200 rounded dark:border-gray-700'>
                        <input
                          id='Student'
                          type='radio'
                          value='Student'
                          name='role'
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          checked={formik.values.role === 'Student'}
                          className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
                        />
                        <label
                          htmlFor='Student'
                          className='w-full py-4 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300'
                        >
                          Étudiant
                        </label>
                      </div>
                    </div>
                    {formik.touched.role && formik.errors.role && (
                      <div className='text-red-500 text-sm mb-4'>
                        {formik.errors.role}
                      </div>
                    )}
                  </div>

                  <div className='flex justify-center gap-4.5'>
                    <button
                      onClick={() => navigate('/accueil')}
                      className='flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white'
                      type='button'
                    >
                      Annuler
                    </button>
                    <button
                      disabled={isLoading}
                      className={`flex justify-center rounded py-2 px-6 font-medium text-gray hover:bg-opacity-90 ${isLoading ? 'bg-gray-500' : 'bg-primary'}`}
                      type='submit'
                    >
                      Enregistrer
                      {isLoading && <ButtonLoader />}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddStudent;
