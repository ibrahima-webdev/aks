import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAuth } from '../../hooks/authContext';
import { api } from '../../utils/api';

type UserModel = {
  date: string | Date;
  email: string;
  name: string;
  reason: string | null;
  status: 'present' | 'absent';
};

const AdminPanel: React.FC = () => {
  const { user } = useAuth();

  const [attendances, setAttendances] = useState<UserModel[]>([]);

  useEffect(() => {
    const getdailyAttendances = async () => {
      try {
        const response = await api.get(
          '/attendance/daily',

          {
            headers: {
              Authorization: `Bearer ${user?.token}`
            }
          }
        );
        if (response.data) {
          const sanitizedData = response.data.map(
            ({ date, email, name, reason, status, _id }: any) => ({
              date,
              email,
              name,
              reason,
              status,
              id: _id
            })
          );
          setAttendances(sanitizedData);
        }
      } catch (error: any) {
        console.error(error.response.data.message);
      }
    };

    getdailyAttendances();
  }, [user?.token]);

  return (
    <>
      <div className='flex justify-end'>
        <Link
          to='/add-user'
          className='inline-flex items-center justify-center rounded-md border border-primary py-4 px-10 text-center font-medium text-primary hover:bg-opacity-90 lg:px-8 xl:px-10'
        >
          Ajouter un utilisateur
        </Link>
      </div>

      <div className='mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5'>
        <div className='col-span-12 xl:col-span-12'>
          <div className='rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1'>
            <h4 className='mb-6 text-xl font-semibold text-black dark:text-white'>
              Liste de présences du jour
            </h4>

            <div className='flex flex-col'>
              <div className='grid grid-cols-3 rounded-sm bg-gray-2 dark:bg-meta-4 sm:grid-cols-5'>
                <div className='p-2.5 xl:p-5'>
                  <h5 className='text-sm font-medium uppercase xsm:text-base'>
                    Noms et Prénoms
                  </h5>
                </div>
                <div className='hidden p-2.5 text-center sm:block xl:p-5'>
                  <h5 className='text-sm font-medium uppercase xsm:text-base'>
                    Email
                  </h5>
                </div>
                <div className='p-2.5 text-center xl:p-5'>
                  <h5 className='text-sm font-medium uppercase xsm:text-base'>
                    Heure de pointage
                  </h5>
                </div>
                <div className='p-2.5 text-center xl:p-5'>
                  <h5 className='text-sm font-medium uppercase xsm:text-base'>
                    Statut
                  </h5>
                </div>
                <div className='hidden p-2.5 text-center sm:block xl:p-5'>
                  <h5 className='text-sm font-medium uppercase xsm:text-base'>
                    Motif
                  </h5>
                </div>
              </div>

              {attendances.length ? (
                attendances.map((attendance, key) => (
                  <div
                    className={`grid grid-cols-3 sm:grid-cols-5 ${
                      key === attendances.length - 1
                        ? ''
                        : 'border-b border-stroke dark:border-strokedark'
                    }`}
                    key={key}
                  >
                    <div className='flex items-center gap-3 p-2.5 xl:p-5'>
                      <div className='flex-shrink-0'>
                        {/* <img src={brand.logo} alt='Brand' /> */}
                      </div>
                      <p className='hidden text-black dark:text-white sm:block'>
                        {attendance.name}
                      </p>
                    </div>

                    <div className='flex items-center justify-center p-2.5 xl:p-5'>
                      <p className='text-black dark:text-white'>
                        {attendance.email}
                      </p>
                    </div>

                    <div className='hidden items-center justify-center p-2.5 sm:flex xl:p-5'>
                      <p className='text-meta-5'>
                        {dayjs(attendance.date).format('DD/MM/YY à HH:mm')}
                      </p>
                    </div>

                    <div className='flex items-center justify-center p-2.5 xl:p-5'>
                      {attendance.status === 'present' ? (
                        <span className='bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300'>
                          {attendance.status}
                        </span>
                      ) : (
                        <span className='bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300'>
                          {attendance.status}
                        </span>
                      )}
                    </div>

                    <div className='hidden items-start justify-start p-2.5 sm:flex xl:p-5'>
                      <p className='text-black dark:text-white'>
                        {attendance.reason}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className='flex items-center justify-center text-base my-8 text-red-600 dark:text-white'>
                  Aucune présence enregistrée encore pour la journée.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminPanel;
