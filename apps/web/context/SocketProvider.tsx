"use client";   
import React, { useCallback, use, useContext, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client"; 

interface SocketContextType {
    children?: React.ReactNode;
}
interface ISocketContext {
    sendMessage: (message: string) => any;
    messages: string[];
}

const SocketContext = React.createContext<ISocketContext | null>(null);
export const useSocket = () => {
    const state = useContext(SocketContext);
    if (!state) {
        throw new Error("useSocket must be used within a SocketProvider");
    }
    return state;
}
export const SocketProvider: React.FC<SocketContextType> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [messages, setMessages] = useState<string[]>([]);
    
    const sendMessage: ISocketContext["sendMessage"] = (message: string) => {
        console.log("sendMessage", message);
        socket?.emit("event:message", message);
    }

    const onMessageReceived = useCallback((msg: string) => {
        console.log("Message received from server: ", msg);
        try {
            const parsedMsg = JSON.parse(msg);
            setMessages((prev) => [...prev, parsedMsg.message]);
        } catch (e) {
            // If parsing fails, treat it as a plain string message
            setMessages((prev) => [...prev, msg]);
        }
    }, [])

    useEffect(() => {
        const socket = io("http://localhost:8000");
        setSocket(socket);
        socket.on("event:message", onMessageReceived);

        return () => {
            socket.off("event:message", onMessageReceived);
            socket.close();
            setSocket(null); 
        }
    }, []);

    return(
        <SocketContext.Provider value={{ sendMessage, messages }}>
            {children}
        </SocketContext.Provider>
    )
}