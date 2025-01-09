import { useCallback, useEffect, useState } from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button, Modal, Timeline } from 'flowbite-react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { useAuth } from '../../hooks/authContext';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { api } from '../../utils/api';
import ButtonLoader from '../../components/buttonLoader';

const validationSchema = Yup.object().shape({
  status: Yup.array()
    .min(1, 'Veuillez sélectionner au moins un statut.')
    .test(
      'uniquePresence',
      'Vous ne pouvez pas sélectionner Présent et Absent en même temps.',
      value => !(value?.includes('Present') && value.includes('Absent'))
    ),
  reason: Yup.string().when('status', (status, schema) => {
    if (status && status.includes('Absent')) {
      return schema.required("Le motif est requis en cas d'absence.");
    }
    return schema;
  })
});

type AttendanceModel = {
  date: string | Date;
  id: string;
  studentId: string;
  status: 'present' | 'absent';
  name: string;
  email: string;
  reason: string | null;
};

const StudentPanel: React.FC = () => {
  const { user } = useAuth();
  const [isWeekend, setIsWeekend] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [showReason, setShowReason] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [position, setPosition] = useState<{
    longitude: number;
    latitude: number;
  } | null>(null);
  const [searchDate, setSearchDate] = useState('');
  const [error, setError] = useState('');
  const [filteredResult, setFilteredResult] = useState<AttendanceModel | null>(
    null
  );
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceModel[]>(
    []
  );
  const [serverError, setServerError] = useState<null | string>(null);
  const [successMessage, setSuccessMessage] = useState<null | string>(null);
  const [errorOnPosition, setErrorOnPosition] = useState<null | string>(null);

  const initialValues: {
    presence: boolean;
    absence: boolean;
    status: ('Present' | 'Absent')[];
    reason: string;
  } = {
    status: [],
    reason: '',
    presence: false,
    absence: false
  };

  var options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  };
  function success(pos: any) {
    const { latitude, longitude } = pos.coords;
    setPosition({ longitude, latitude });
  }

  function errors(err: any) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
  }

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then(function (result) {
          if (result.state === 'granted') {
            //If granted then you can directly call your function here
            navigator.geolocation.getCurrentPosition(success, errors, options);
          } else if (result.state === 'prompt') {
            //If prompt then the user will be asked to give permission
            navigator.geolocation.getCurrentPosition(success, errors, options);
          } else if (result.state === 'denied') {
            setErrorOnPosition(
              'Vous devez activer votre localisation dans votre navigateur afin de pouvoir marquer votre présence ou absence. Rechargez la page si nécessaire après activation de la localisation'
            );
          }
        });
    } else {
      setErrorOnPosition(
        "La géolocalisation n'est pas supporté par votre navigateur"
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getUserAttendances = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    try {
      const response = await api.get(`/attendance/${user.id}/history`, {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });

      if (response.data.data) {
        const sanitizedData: AttendanceModel[] = response.data.data.map(
          ({ name, date, status, reason, email, _id, studentId }: any) => ({
            name,
            date,
            status,
            reason,
            email,
            studentId,
            id: _id
          })
        );

        setAttendanceHistory(
          sanitizedData.map(item => ({
            ...item,
            date: dayjs(item.date).format('DD/MM/YYYY')
          }))
        );
      }
    } catch (error: any) {
      console.log(error.response.data.message);
    }
  }, [user?.id, user?.token]);

  useEffect(() => {
    if (successMessage) {
      setTimeout(() => setSuccessMessage(''), 5000);
    }

    if (serverError) {
      setTimeout(() => setServerError(''), 5000);
    }
  }, [successMessage, serverError]);

  useEffect(() => {
    const today = new Date();
    const day = today.getDay(); // 0 = Dimanche, 6 = Samedi
    if (day === 0 || day === 6) {
      setIsWeekend(true);
    }
  }, []);

  // Handle search
  const handleSearch = (e: any) => {
    e.preventDefault();
    setError('');

    if (!e.target.value) {
      setError('Veuillez entrer une date valide.');
      return;
    }
    setSearchDate(e.target.value);

    const result = attendanceHistory.find(
      record => record.date === dayjs(e.target.value).format('DD/MM/YYYY')
    );

    if (result) {
      setFilteredResult(result);
    } else {
      setFilteredResult(null);
      setError('Aucun enregistrement trouvé pour cette date.');
    }
  };

  const handleClearSearch = () => {
    setSearchDate('');
    setFilteredResult(null);
    setError('');
  };

  const getAttendances = async () => {
    setOpenModal(true);
    await getUserAttendances();
  };

  return (
    <div>
      <div className='mx-auto max-w-270'>
        <Breadcrumb pageName='Marquez votre statut' />
        <div className='grid grid-cols-12 gap-8 items-center justify-center'>
          <div className='col-span-12 xl:col-span-12'>
            <div className='flex items-end justify-end mb-3'>
              <Link
                to='#'
                onClick={getAttendances}
                className='inline-flex items-center justify-center rounded-md border border-primary py-4 px-10 text-center font-medium text-primary hover:bg-opacity-90 lg:px-8 xl:px-10'
              >
                Voir mon historique
              </Link>
            </div>
            <div className='rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark'>
              <div className='border-b border-stroke py-4 px-7 dark:border-strokedark'>
                <h3 className='font-medium text-black dark:text-white'>
                  Marquez votre présence ou absence
                </h3>
              </div>

              {isWeekend ? (
                <>
                  <div className='alert alert-warning p-4 mb-4 text-center rounded bg-yellow-100 border-l-4 border-yellow-500'>
                    <p className='text-yellow-700 font-semibold'>
                      🌟 Coooolll ! Mais désolé, vous ne pouvez pas marquer
                      votre présence ni votre absence le week-end.
                      Rejoignez-nous dès lundi ! 😊
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {errorOnPosition ? (
                    <>
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
                        <span className='sr-only'>Info</span>
                        <div>
                          <span className='font-medium'>Erreur: </span>{' '}
                          {errorOnPosition}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
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
                          <span className='sr-only'>Info</span>
                          <div>
                            <span className='font-medium'>Erreur: </span>{' '}
                            {serverError}
                          </div>
                        </div>
                      )}
                      <div className='p-7'>
                        <Formik
                          initialValues={initialValues}
                          validationSchema={validationSchema}
                          onSubmit={async (values, actions) => {
                            setIsSubmitting(true);
                            try {
                              const response = await api.post(
                                '/attendance',
                                {
                                  studentId: user?.id,
                                  role: user?.role,
                                  status: String(values.status).toLowerCase(),
                                  reason: values.reason,
                                  latitude: position?.latitude,
                                  longitude: position?.longitude
                                },
                                {
                                  headers: {
                                    Authorization: `Bearer ${user?.token}`
                                  }
                                }
                              );
                              setSuccessMessage(response.data.message);
                              setIsSubmitting(false);
                              actions.resetForm();
                            } catch (error: any) {
                              setIsSubmitting(false);
                              actions.resetForm();
                              setServerError(error.response.data.message);
                            }
                          }}
                        >
                          {({ values, setFieldValue }) => (
                            <Form>
                              <div className='flex flex-col  justify-center'>
                                <div className='mb-10 flex flex-row justify-center gap-4.5 sm:flex-row'>
                                  <label
                                    htmlFor='presence'
                                    className='flex cursor-pointer select-none items-center'
                                  >
                                    <div className='relative flex flex-row'>
                                      <Field
                                        type='checkbox'
                                        id='presence'
                                        name='presence'
                                        onChange={(e: any) => {
                                          setFieldValue(
                                            'presence',
                                            e.target.checked
                                          );
                                          if (e.target.checked) {
                                            setFieldValue('status', [
                                              'Present'
                                            ]);
                                          } else {
                                            setFieldValue(
                                              'status',
                                              values.status.filter(
                                                item => item !== 'Present'
                                              )
                                            );
                                          }

                                          if (values.absence) {
                                            setFieldValue(
                                              'absence',
                                              !values.absence
                                            );
                                          }
                                        }}
                                        className='sr-only'
                                      />

                                      <div className='block h-8 w-14 rounded-full bg-meta-9 dark:bg-[#5A616B]'></div>
                                      <div
                                        className={`dot absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white transition ${
                                          values.presence &&
                                          '!right-1 !translate-x-full !bg-primary dark:!bg-white'
                                        }`}
                                      >
                                        <span
                                          className={`hidden ${values.presence && '!block'}`}
                                        >
                                          <svg
                                            className='fill-white dark:fill-black'
                                            width='11'
                                            height='8'
                                            viewBox='0 0 11 8'
                                            fill='none'
                                            xmlns='http://www.w3.org/2000/svg'
                                          >
                                            <path
                                              d='M10.0915 0.951972L10.0867 0.946075L10.0813 0.940568C9.90076 0.753564 9.61034 0.753146 9.42927 0.939309L4.16201 6.22962L1.58507 3.63469C1.40401 3.44841 1.11351 3.44879 0.932892 3.63584C0.755703 3.81933 0.755703 4.10875 0.932892 4.29224L0.932878 4.29225L0.934851 4.29424L3.58046 6.95832C3.73676 7.11955 3.94983 7.2 4.1473 7.2C4.36196 7.2 4.55963 7.11773 4.71406 6.9584L10.0468 1.60234C10.2436 1.4199 10.2421 1.1339 10.0915 0.951972ZM4.2327 6.30081L4.2317 6.2998C4.23206 6.30015 4.23237 6.30049 4.23269 6.30082L4.2327 6.30081Z'
                                              fill=''
                                              stroke=''
                                              strokeWidth='0.4'
                                            ></path>
                                          </svg>
                                        </span>
                                        <span
                                          className={`${values.presence && 'hidden'}`}
                                        >
                                          <svg
                                            className='h-4 w-4 stroke-current'
                                            fill='none'
                                            viewBox='0 0 24 24'
                                            xmlns='http://www.w3.org/2000/svg'
                                          >
                                            <path
                                              strokeLinecap='round'
                                              strokeLinejoin='round'
                                              strokeWidth='2'
                                              d='M6 18L18 6M6 6l12 12'
                                            ></path>
                                          </svg>
                                        </span>
                                      </div>
                                      <span className='ml-4 flex justify-center items-center'>
                                        Présent
                                      </span>
                                    </div>
                                  </label>
                                  <label
                                    htmlFor='absence'
                                    className='flex cursor-pointer select-none items-center'
                                  >
                                    <div className='relative flex flex-row'>
                                      <Field
                                        type='checkbox'
                                        id='absence'
                                        name='absence'
                                        onChange={(e: any) => {
                                          setFieldValue(
                                            'absence',
                                            e.target.checked
                                          );

                                          if (e.target.checked) {
                                            setFieldValue('status', ['Absent']);
                                          } else {
                                            setFieldValue(
                                              'status',
                                              values.status.filter(
                                                item => item !== 'Absent'
                                              )
                                            );
                                          }

                                          if (values.presence) {
                                            setFieldValue(
                                              'presence',
                                              !values.presence
                                            );
                                          }
                                        }}
                                        className='sr-only'
                                      />
                                      <div className='block h-8 w-14 rounded-full bg-meta-9 dark:bg-[#5A616B]'></div>
                                      <div
                                        className={`dot absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white transition ${
                                          values.absence &&
                                          '!right-1 !translate-x-full !bg-primary dark:!bg-white'
                                        }`}
                                      >
                                        <span
                                          className={`hidden ${values.absence && '!block'}`}
                                        >
                                          <svg
                                            className='fill-white dark:fill-black'
                                            width='11'
                                            height='8'
                                            viewBox='0 0 11 8'
                                            fill='none'
                                            xmlns='http://www.w3.org/2000/svg'
                                          >
                                            <path
                                              d='M10.0915 0.951972L10.0867 0.946075L10.0813 0.940568C9.90076 0.753564 9.61034 0.753146 9.42927 0.939309L4.16201 6.22962L1.58507 3.63469C1.40401 3.44841 1.11351 3.44879 0.932892 3.63584C0.755703 3.81933 0.755703 4.10875 0.932892 4.29224L0.932878 4.29225L0.934851 4.29424L3.58046 6.95832C3.73676 7.11955 3.94983 7.2 4.1473 7.2C4.36196 7.2 4.55963 7.11773 4.71406 6.9584L10.0468 1.60234C10.2436 1.4199 10.2421 1.1339 10.0915 0.951972ZM4.2327 6.30081L4.2317 6.2998C4.23206 6.30015 4.23237 6.30049 4.23269 6.30082L4.2327 6.30081Z'
                                              fill=''
                                              stroke=''
                                              strokeWidth='0.4'
                                            ></path>
                                          </svg>
                                        </span>
                                        <span
                                          className={`${values.absence && 'hidden'}`}
                                        >
                                          <svg
                                            className='h-4 w-4 stroke-current'
                                            fill='none'
                                            viewBox='0 0 24 24'
                                            xmlns='http://www.w3.org/2000/svg'
                                          >
                                            <path
                                              strokeLinecap='round'
                                              strokeLinejoin='round'
                                              strokeWidth='2'
                                              d='M6 18L18 6M6 6l12 12'
                                            ></path>
                                          </svg>
                                        </span>
                                      </div>
                                      <label
                                        className='ml-4 flex justify-center items-center'
                                        htmlFor='absence'
                                      >
                                        Absent
                                      </label>
                                    </div>
                                  </label>
                                </div>

                                <div className='-mt-5 mb-5 flex items-center justify-center text-sm'>
                                  <ErrorMessage
                                    name='status'
                                    component='div'
                                    className='text-red-500 text-sm mt-1'
                                  />
                                </div>
                              </div>
                              {values.absence && (
                                <div className='mb-5.5'>
                                  <label
                                    className='mb-3 block text-sm font-medium text-black dark:text-white'
                                    htmlFor='reason'
                                  >
                                    Motif d'absence
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
                                        <g
                                          opacity='0.8'
                                          clipPath='url(#clip0_88_10224)'
                                        >
                                          <path
                                            fillRule='evenodd'
                                            clipRule='evenodd'
                                            d='M1.56524 3.23223C2.03408 2.76339 2.66997 2.5 3.33301 2.5H9.16634C9.62658 2.5 9.99967 2.8731 9.99967 3.33333C9.99967 3.79357 9.62658 4.16667 9.16634 4.16667H3.33301C3.11199 4.16667 2.90003 4.25446 2.74375 4.41074C2.58747 4.56702 2.49967 4.77899 2.49967 5V16.6667C2.49967 16.8877 2.58747 17.0996 2.74375 17.2559C2.90003 17.4122 3.11199 17.5 3.33301 17.5H14.9997C15.2207 17.5 15.4326 17.4122 15.5889 17.2559C15.7452 17.0996 15.833 16.8877 15.833 16.6667V10.8333C15.833 10.3731 16.2061 10 16.6663 10C17.1266 10 17.4997 10.3731 17.4997 10.8333V16.6667C17.4997 17.3297 17.2363 17.9656 16.7674 18.4344C16.2986 18.9033 15.6627 19.1667 14.9997 19.1667H3.33301C2.66997 19.1667 2.03408 18.9033 1.56524 18.4344C1.0964 17.9656 0.833008 17.3297 0.833008 16.6667V5C0.833008 4.33696 1.0964 3.70107 1.56524 3.23223Z'
                                            fill=''
                                          />
                                          <path
                                            fillRule='evenodd'
                                            clipRule='evenodd'
                                            d='M16.6664 2.39884C16.4185 2.39884 16.1809 2.49729 16.0056 2.67253L8.25216 10.426L7.81167 12.188L9.57365 11.7475L17.3271 3.99402C17.5023 3.81878 17.6008 3.5811 17.6008 3.33328C17.6008 3.08545 17.5023 2.84777 17.3271 2.67253C17.1519 2.49729 16.9142 2.39884 16.6664 2.39884ZM14.8271 1.49402C15.3149 1.00622 15.9765 0.732178 16.6664 0.732178C17.3562 0.732178 18.0178 1.00622 18.5056 1.49402C18.9934 1.98182 19.2675 2.64342 19.2675 3.33328C19.2675 4.02313 18.9934 4.68473 18.5056 5.17253L10.5889 13.0892C10.4821 13.196 10.3483 13.2718 10.2018 13.3084L6.86847 14.1417C6.58449 14.2127 6.28409 14.1295 6.0771 13.9225C5.87012 13.7156 5.78691 13.4151 5.85791 13.1312L6.69124 9.79783C6.72787 9.65131 6.80364 9.51749 6.91044 9.41069L14.8271 1.49402Z'
                                            fill=''
                                          />
                                        </g>
                                        <defs>
                                          <clipPath id='clip0_88_10224'>
                                            <rect
                                              width='20'
                                              height='20'
                                              fill='white'
                                            />
                                          </clipPath>
                                        </defs>
                                      </svg>
                                    </span>
                                    <Field
                                      as='textarea'
                                      id='reason'
                                      name='reason'
                                      rows='3'
                                      className={`w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary`}
                                      placeholder="Entrez votre motif d'absence"
                                    />
                                  </div>

                                  <div className='-mt-5 mb-5 flex items-center justify-center text-sm'>
                                    <ErrorMessage
                                      name='reason'
                                      component='div'
                                      className='text-red-500 text-sm mt-1'
                                    />
                                  </div>
                                </div>
                              )}

                              {successMessage && (
                                <div
                                  className='p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400'
                                  role='alert'
                                >
                                  <span className='font-medium'>Info: </span>
                                  {successMessage}.
                                </div>
                              )}

                              <div className='flex justify-center gap-4.5'>
                                <button
                                  disabled={
                                    (!values.presence && !values.absence) ||
                                    (values.absence && values.reason === '')
                                  }
                                  className={`flex justify-center rounded py-2 px-6 font-medium text-gray hover:bg-opacity-90 ${
                                    (!values.presence && !values.absence) ||
                                    (values.absence && values.reason === '')
                                      ? 'bg-gray-400'
                                      : 'bg-primary'
                                  }`}
                                  type='submit'
                                >
                                  Enregistrer
                                  {isSubmitting && <ButtonLoader />}
                                </button>
                              </div>
                            </Form>
                          )}
                        </Formik>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODALLLLLLL */}
      <Modal
        className='z-999999'
        show={openModal}
        onClose={() => setOpenModal(false)}
      >
        <Modal.Header>VOTRE SITUATION...</Modal.Header>
        <Modal.Body>
          <div className='space-y-6'>
            <p className='text-lg leading-relaxed text-black dark:text-white'>
              Vous totalisez{' '}
              <span className='text-lg font-medium'>
                {' '}
                {
                  attendanceHistory.filter(item => item.status === 'present')
                    .length
                }{' '}
                PRÉSENCE(S)
              </span>{' '}
              et{' '}
              <span className='text-lg font-medium'>
                {' '}
                {
                  attendanceHistory.filter(item => item.status === 'absent')
                    .length
                }{' '}
                ABSENCE(S).
              </span>
            </p>
            <div className='sm:block'>
              <div>
                <label
                  htmlFor='search-date'
                  className='text-black dark:text-white'
                >
                  Rechercher une date particulière...
                </label>
                <div className='relative gap-5 flex items-center justify-center'>
                  <input
                    type='date'
                    id='search-date'
                    value={searchDate}
                    onChange={e => handleSearch(e)}
                    placeholder='Rechercher une date particulière exemple 12/12/2024'
                    className='w-full bg-transparent pl-9 pr-4 text-black focus:outline-none dark:text-white xl:w-125'
                  />
                  <button
                    type='button'
                    onClick={handleClearSearch}
                    className='inline-flex items-center justify-center border border-primary py-2 px-5 text-center font-medium text-primary hover:bg-opacity-90 lg:px-5 xl:px-5'
                  >
                    Réinitialiser
                  </button>
                </div>
              </div>
            </div>

            {/* Timelineeeeeee */}
            <Timeline className='overflow-x-auto h-100'>
              {filteredResult ? (
                <>
                  <Timeline.Item>
                    <Timeline.Point />
                    <Timeline.Content>
                      <Timeline.Time className='text-black dark:text-white'>
                        Le {filteredResult.date.toString()}
                      </Timeline.Time>
                      <Timeline.Title
                        className={`rounded bg-opacity-10 py-1 px-3 text-lg font-medium ${
                          filteredResult.status === 'present'
                            ? 'bg-success text-success'
                            : 'bg-danger text-danger'
                        }`}
                      >
                        J'étais {filteredResult.status.toUpperCase()}
                      </Timeline.Title>
                      {filteredResult.reason && (
                        <div className='mt-3'>
                          <Button
                            onClick={() => setShowReason(prev => !prev)}
                            color='gray'
                          >
                            {showReason ? 'Fermer' : 'Voir le motif'}
                          </Button>
                          {showReason && (
                            <Timeline.Body className='text-black dark:text-white'>
                              {filteredResult.reason}
                            </Timeline.Body>
                          )}
                        </div>
                      )}
                    </Timeline.Content>
                  </Timeline.Item>
                </>
              ) : error ? (
                <span className='text-red-500 text-lg flex items-center justify-center'>
                  {error}
                </span>
              ) : (
                <>
                  {attendanceHistory.map(item => (
                    <Timeline.Item>
                      <Timeline.Point />
                      <Timeline.Content>
                        <Timeline.Time className='text-black dark:text-white'>
                          Le{' '}
                          <span className='font-medium'>
                            {item.date.toString()}:
                          </span>
                        </Timeline.Time>
                        <Timeline.Title
                          className={`rounded bg-opacity-10 py-1 px-3 text-lg font-medium ${
                            item.status === 'present'
                              ? 'bg-success text-success'
                              : 'bg-danger text-danger'
                          }`}
                        >
                          j'étais {item.status.toUpperCase()}
                        </Timeline.Title>
                        {item.reason && (
                          <div className='mt-3'>
                            <Button
                              onClick={() => setShowReason(prev => !prev)}
                              color='gray'
                            >
                              {showReason ? 'Fermer' : 'Voir mon motif'}
                            </Button>
                            {showReason && (
                              <Timeline.Body className='text-black dark:text-white'>
                                {item.reason}
                              </Timeline.Body>
                            )}
                          </div>
                        )}
                      </Timeline.Content>
                    </Timeline.Item>
                  ))}
                </>
              )}
            </Timeline>
          </div>
        </Modal.Body>
        <Modal.Footer className='flex items-end justify-end'>
          <Button color='gray' onClick={() => setOpenModal(false)}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default StudentPanel;
