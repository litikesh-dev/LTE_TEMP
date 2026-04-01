import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { RootLayout } from '@/widgets/layout';
import { Dashboard } from '@/pages/dashboard';
import { MyCourses } from '@/pages/my-courses';
import { CourseDetails } from '@/pages/course-details';
import { NotFound } from '@/pages/not-found';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'courses',
        element: <MyCourses />,
      },
      {
        path: 'courses/:courseId',
        element: <CourseDetails />,
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
