import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export type BotMessage = { text: string };
export type Product = Record<string, any>;

export interface SocketEventHandlers {
  onBotMessage?: (msg: BotMessage) => void;
  onProduct?: (product: Product) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('http', 'ws') || 'ws://localhost:5000';

export function useSocket(events: SocketEventHandlers = {}) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      events.onConnect?.();
    });
    socket.on('disconnect', () => {
      setConnected(false);
      events.onDisconnect?.();
    });
    socket.on('bot_message', (msg: BotMessage) => {
      events.onBotMessage?.(msg);
    });
    socket.on('product', (product: Product) => {
      events.onProduct?.(product);
    });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendUserMessage = useCallback((text: string) => {
    socketRef.current?.emit('user_message', { text });
  }, []);

  return { connected, sendUserMessage };
}
