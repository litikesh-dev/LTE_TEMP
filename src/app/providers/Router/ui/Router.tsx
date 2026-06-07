import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { RootLayout } from '@/widgets/layout';
import { Dashboard } from '@/pages/dashboard';
import { MyCourses } from '@/pages/my-courses';
import { CourseDetails } from '@/pages/course-details';
import { ModuleContent } from '@/pages/module-content';
import { ComingSoon } from '@/pages/coming-soon';
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
      {
        path: 'courses/:courseId/modules/:moduleId',
        element: <ModuleContent />,
      },
      {
        path: 'explore',
        element: (
          <ComingSoon
            iconKey="explore"
            title="Explore"
            description="Discover new courses, learning paths, and curated content tailored to your goals. This space is on its way."
          />
        ),
      },
      {
        path: 'achievements',
        element: (
          <ComingSoon
            iconKey="achievements"
            title="Achievements"
            description="Track your badges, milestones, and earned points all in one place. We're putting the finishing touches on it."
          />
        ),
      },
      {
        path: 'progress',
        element: (
          <ComingSoon
            iconKey="progress"
            title="Progress"
            description="Visualize your learning journey with detailed analytics and insights. Stay tuned — it's coming soon."
          />
        ),
      },
      {
        path: 'settings',
        element: (
          <ComingSoon
            iconKey="settings"
            title="Settings"
            description="Manage your account, preferences, and notifications all in one place. We're putting the finishing touches on it."
          />
        ),
      },
      {
        path: 'help',
        element: (
          <ComingSoon
            iconKey="help"
            title="Help & Support"
            description="Find answers, guides, and ways to reach our support team. This space is on its way."
          />
        ),
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
