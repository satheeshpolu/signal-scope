import { createBrowserRouter } from 'react-router-dom';
import InstrumentsPage from '@/features/instruments/pages/InstrumentsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <InstrumentsPage />,
  },
  // {
  //   path: '/instruments/:symbol',
  //   element: <InspectPage />,
  // },
]);
