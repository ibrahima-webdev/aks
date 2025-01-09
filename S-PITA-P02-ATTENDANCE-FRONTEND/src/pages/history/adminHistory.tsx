import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../hooks/authContext';
import Actions from './Actions';
import dayjs from 'dayjs';
import { api } from '../../utils/api';

type UserModel = {
  id: string;
  name: string;
  phoneNumber: string;
  status: 'active' | 'inactive';
};

type AttendanceModel = {
  date: string | Date;
  id: string;
  studentId: string;
  status: 'present' | 'absent';
  name: string;
  email: string;
  reason: string | null;
};

const StudentsAttendancesList = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserModel[]>([]);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceModel[]>(
    []
  );
  const getUsers = useCallback(async () => {
    try {
      const response = await api.get('/user', {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });
      if (response.data.data) {
        const sanitizedData = response.data.data.map(
          ({ name, status, _id, phoneNumber }: any) => ({
            name,
            phoneNumber,
            status,
            id: _id
          })
        );
        setUsers(sanitizedData);
      }
    } catch (error: any) {
      console.log(error.response.data.message);
    }
  }, [user?.token]);

  const getUserAttendances = useCallback(
    async (id: string) => {
      if (!id) {
        return;
      }

      try {
        const response = await api.get(`/attendance/${id}/history`, {
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
    },
    [user?.token]
  );

  // Delete student
  const handleDelete = async (userId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ?')) {
      try {
        const response = await api.delete(`/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${user?.token}`
          }
        });

        if (response.status === 200) {
          alert(response.data.message);
          await getUsers();
        }
      } catch (err) {
        console.error('Error deleting student', err);
      }
    }
  };

  // Mark presence/absence
  const handleAttendance = async (status: 'present' | 'absent', id: string) => {
    if (status === 'present') {
      try {
        const response = await api.post(
          `/attendance`,
          {
            studentId: id,
            role: user?.role,
            status
          },
          {
            headers: {
              Authorization: `Bearer ${user?.token}`
            }
          }
        );

        if (response.status === 200) {
          alert(response.data.message);
        }
      } catch (err: any) {
        alert(err.response.data.message);
      }
    } else {
      const reason = window.prompt('Entrez la raison de la sanction :');

      if (reason) {
        try {
          const response = await api.post(
            `/attendance`,
            {
              studentId: id,
              role: user?.role,
              status: String(status).toLowerCase(),
              reason
            },
            {
              headers: {
                Authorization: `Bearer ${user?.token}`
              }
            }
          );

          if (response.status === 200) {
            alert(response.data.message);
          }
        } catch (err: any) {
          alert(err.response.data.message);
          console.error('Error marking attendance', err);
        }
      }
    }
  };

  const handleSanction = () => {
    alert(
      "Fonctionnalité en cours d'implémentation. Avant que la fonctionnalité ne soit prête, veuillez contacter AKS si vous voulez vraiment sanctionner l'étudiant.😎"
    );
  };

  const handleEdit = () => {
    alert(
      "Fonctionnalité en cours d'implémentation. Avant que la fonctionnalité ne soit prête, veuillez contacter AKS si vous voulez modifier les informations de l'étudiant.😎"
    );
  };

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  return (
    <div className='rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1'>
      <div className='max-w-full'>
        <table className='w-full table-auto'>
          <thead>
            <tr className='bg-gray-2 text-left dark:bg-meta-4'>
              <th className='min-w-[220px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11'>
                Nom et Prénoms
              </th>
              <th className='min-w-[150px] py-4 px-4 font-medium text-black dark:text-white'>
                Numéro de téléphone
              </th>
              <th className='min-w-[120px] py-4 px-4 font-medium text-black dark:text-white'>
                Status
              </th>
              <th className='py-4 px-4 font-medium text-black dark:text-white'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map(({ name, id, phoneNumber, status }, key) => (
              <tr key={key}>
                <td className='border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11'>
                  <h5 className='font-medium text-black dark:text-white'>
                    {name}
                  </h5>
                </td>
                <td className='border-b border-[#eee] py-5 px-4 dark:border-strokedark'>
                  <p className='text-black dark:text-white'>{phoneNumber}</p>
                </td>
                <td className='border-b border-[#eee] py-5 px-4 dark:border-strokedark'>
                  <p
                    className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium ${
                      status === 'active'
                        ? 'bg-success text-success'
                        : 'bg-danger text-danger'
                    }`}
                  >
                    {status === 'active' ? 'Actif' : 'Inactif'}
                  </p>
                </td>

                <td className='border-b border-[#eee] py-5 px-4 dark:border-strokedark'>
                  <Actions
                    studentName={name}
                    handleEdit={handleEdit}
                    handleDelete={() => handleDelete(id)}
                    handleAttendance={status => handleAttendance(status, id)}
                    attendanceHistory={attendanceHistory}
                    getUserAttendances={() => getUserAttendances(id)}
                    handleSanction={handleSanction}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentsAttendancesList;
