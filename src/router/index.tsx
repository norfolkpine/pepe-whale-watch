import { createBrowserRouter } from 'react-router-dom';
import MainRouter from './main.router';

const router: ReturnType<typeof createBrowserRouter> = createBrowserRouter([
  ...MainRouter,
  {
    path: '*',
    element: <>Page not found</>,
  },
]);

export default router;
