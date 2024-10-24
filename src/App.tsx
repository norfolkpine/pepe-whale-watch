import { RouterProvider } from 'react-router-dom';
import router from './router';
import { ThemeProvider } from './components/molecules/providers';
import { Toast, ToastProvider } from './components/atoms';

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <ToastProvider>
        <RouterProvider router={router} />
        <Toast />
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
