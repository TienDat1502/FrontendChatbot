import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { NewChatPage } from '../pages/NewChatPage';
import { ChatPage } from '../pages/ChatPage';
import { WidgetDemoPage } from '../pages/WidgetDemoPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <NewChatPage />,
      },
      {
        path: 'widget-demo',
        element: <WidgetDemoPage />,
      },
      {
        path: 'chat/:conversationId',
        element: <ChatPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
