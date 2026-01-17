import React from 'react';
import Home from './pages/Home';
import Chat from './pages/Chat';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Home',
    path: '/',
    element: <Home />
  },
  {
    name: 'Chat',
    path: '/chat',
    element: <Chat />
  }
];

export default routes;
