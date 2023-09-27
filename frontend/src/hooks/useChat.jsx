import { useEffect, useRef, useState } from "react";
import socketIOClient from "socket.io-client";
import { useSelector } from 'react-redux'

const JOIN_ROOM = "joinRoom"
const ROOM_INFO = "roomInfo";
const NEW_CHAT_MESSAGE_EVENT = "newChatMessage"; // Name of the event
const SOCKET_SERVER_URL = "http://localhost:4001";

const useChat = (roomId) => {
  // Sent and received messages
  const [messages, setMessages] = useState([]); 
  const socketRef = useRef();
  const username = useSelector(state => state.usersInRoom[0])
  const [loggedInUsers, setLoggedInUsers] = useState([])

  useEffect(() => {
    socketRef.current = socketIOClient(SOCKET_SERVER_URL, {
      query: { roomId },
    });
    
    socketRef.current.emit(JOIN_ROOM, { username, roomId })

    socketRef.current.on(ROOM_INFO, ({ room, users }) => {
      setLoggedInUsers(users)
    })

    socketRef.current.on(NEW_CHAT_MESSAGE_EVENT, (message) => {
      const incomingMessage = {
        ...message,
        ownedByCurrentUser: message.senderId === socketRef.current.id,
      };
      setMessages((messages) => [...messages, incomingMessage]);
    });
    
    return () => {
      socketRef.current.disconnect();
    };
  }, [username]);

  const sendMessage = (messageBody) => {
    socketRef.current.emit(NEW_CHAT_MESSAGE_EVENT, {
      body: messageBody,
      senderId: socketRef.current.id,
      senderName: username
    });
  };

  return { messages, sendMessage, loggedInUsers };
};

export default useChat;