import { useState } from 'react';
import { Button, Dropdown, Modal, Timeline } from 'flowbite-react';
import { HiCurrencyDollar, HiTrash, HiCheck, HiEye } from 'react-icons/hi';
import dayjs from 'dayjs';

type AttendanceModel = {
  date: string | Date;
  id: string;
  studentId: string;
  status: 'present' | 'absent';
  name: string;
  email: string;
  reason: string | null;
};

type Props = {
  handleDelete: () => void;
  handleAttendance: (status: 'present' | 'absent') => void;
  getUserAttendances: () => Promise<void>;
  handleSanction: () => void;
  handleEdit: () => void;
  attendanceHistory: AttendanceModel[];
  studentName: string;
};

const Actions: React.FC<Props> = ({
  handleDelete,
  handleAttendance,
  getUserAttendances,
  handleSanction,
  handleEdit,
  attendanceHistory,
  studentName
}) => {
  const [openModal, setOpenModal] = useState(false);
  const [showReason, setShowReason] = useState(false);
  const [error, setError] = useState('');
  const [filteredResult, setFilteredResult] = useState<AttendanceModel | null>(
    null
  );
  const [searchDate, setSearchDate] = useState('');

  const getAttendances = async () => {
    setOpenModal(true);
    await getUserAttendances();
  };

  // const studentName = attendanceHistory[0]?.name.toUpperCase();

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

  return (
    <>
      <Dropdown
        renderTrigger={() => (
          <button
            className='inline-flex items-center p-2 text-sm font-medium text-center text-gray-900 bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-600'
            type='button'
          >
            <svg
              className='w-5 h-5'
              aria-hidden='true'
              xmlns='http://www.w3.org/2000/svg'
              fill='currentColor'
              viewBox='0 0 16 3'
            >
              <path d='M2 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm6.041 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM14 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z' />
            </svg>
          </button>
        )}
      >
        <Dropdown.Item onClick={getAttendances} icon={HiEye}>
          Voir son historique de présence/absence
        </Dropdown.Item>
        <Dropdown.Item onClick={handleEdit} icon={HiEye}>
          Modifier ses informations
        </Dropdown.Item>
        <Dropdown.Item
          onClick={() => handleAttendance('present')}
          icon={HiCheck}
        >
          Marquer présent pour aujourd'hui
        </Dropdown.Item>
        <Dropdown.Item
          onClick={() => handleAttendance('absent')}
          icon={HiCurrencyDollar}
        >
          Marquer absent pour aujourd'hui
        </Dropdown.Item>
        <Dropdown.Item onClick={handleDelete} icon={HiTrash}>
          Supprimer
        </Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item onClick={handleSanction} icon={HiTrash}>
          Sanctionner
        </Dropdown.Item>
      </Dropdown>

      {/* MODALLLLLLL SHOULD BE REFACTO */}
      <Modal
        className='z-999999'
        show={openModal}
        onClose={() => setOpenModal(false)}
      >
        <Modal.Header>SITUATION DE L'ÉTUDIANT {studentName}</Modal.Header>
        <Modal.Body>
          <div className='space-y-6'>
            <p className='text-lg leading-relaxed text-black dark:text-white'>
              {studentName} totalise{' '}
              <span className='text-lg font-medium'>
                {
                  attendanceHistory.filter(item => item.status === 'present')
                    .length
                }{' '}
                PRÉSENCE(S)
              </span>{' '}
              et{' '}
              <span className='text-lg font-medium'>
                {
                  attendanceHistory.filter(item => item.status === 'absent')
                    .length
                }{' '}
                ABSENCE(S)
              </span>
            </p>

            <div className='sm:block '>
              <form>
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
              </form>
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
                        l'étudiant a été {filteredResult.status.toUpperCase()}
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
                          l'étudiant a été {item.status.toUpperCase()}
                        </Timeline.Title>
                        {item.reason && (
                          <div className='mt-3'>
                            <Button
                              onClick={() => setShowReason(prev => !prev)}
                              color='gray'
                            >
                              {showReason ? 'Fermer' : 'Voir le motif'}
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
    </>
  );
};

export default Actions;
