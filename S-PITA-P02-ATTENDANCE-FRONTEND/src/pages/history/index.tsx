import React from 'react';
import StudentsAttendancesList from './adminHistory';
import { useAuth } from '../../hooks/authContext';

const AttendancesHistory: React.FC = () => {
  const { user } = useAuth();
  return (
    <>
      {user?.role === 'admin' ? (
        <StudentsAttendancesList />
      ) : (
        <div>Student History</div>
      )}
    </>
  );
};

export default AttendancesHistory;
