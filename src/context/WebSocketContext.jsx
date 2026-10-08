import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './AuthContext';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const { token, isAuthenticated, user } = useAuth();
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastTaskUpdate, setLastTaskUpdate] = useState(null);
  const stompClientRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
      setConnected(false);
      return;
    }

    const socketFactory = () => new SockJS('/ws');

    const client = new Client({
      webSocketFactory: socketFactory,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        // Uncomment for debug logs: console.log('[STOMP]', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      setConnected(true);

      // Subscribe to private notifications queue
      client.subscribe('/user/queue/notifications', (message) => {
        const newNotification = JSON.parse(message.body);
        setNotifications((prev) => [newNotification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });
    };

    client.onDisconnect = () => {
      setConnected(false);
    };

    client.onStompError = (frame) => {
      console.error('STOMP Error:', frame.headers['message'], frame.body);
    };

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, [token, isAuthenticated]);

  const subscribeToProject = (projectId, callback) => {
    if (stompClientRef.current && stompClientRef.current.connected) {
      return stompClientRef.current.subscribe(`/topic/project/${projectId}`, (message) => {
        const updateEvent = JSON.parse(message.body);
        setLastTaskUpdate(updateEvent);
        if (callback) callback(updateEvent);
      });
    }
    return null;
  };

  return (
    <WebSocketContext.Provider
      value={{
        connected,
        notifications,
        unreadCount,
        setUnreadCount,
        lastTaskUpdate,
        subscribeToProject,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
