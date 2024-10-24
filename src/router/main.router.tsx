import MainLayout from '@/components/templates/MainLayout';
import HomePage from '@/pages';
import { RouteObject } from 'react-router-dom';

const MainRouter: RouteObject[] = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
    ],
  },
];

export default MainRouter;
