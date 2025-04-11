"use client";   
import React, { useContext, useEffect } from "react";
import io from "socket.io-client"; 

interface SocketContextType {
    children?: React.ReactNode;
}
interface ISocketContext {
    sendMessage: (message: string) => any;
}

const SocketContext = React.createContext<ISocketContext | null>(null);
export const useSocket = () => {
    const state = useContext(SocketContext);
    if (!state) {
        throw new Error("useSocket must be used within a SocketProvider");
    }
    return state;
}
export const SockerProvider: React.FC<SocketContextType> = ({ children }) => {
    const sendMessage: ISocketContext["sendMessage"] = (message: string) => {
        console.log("sendMessage", message);
    }

    useEffect(() => {
        const socket = io("http://localhost:8000");
        socket.on("event:message", (message: string) => {
            console.log("message", message);
        });

        return () => {
            socket.off("event:message");
        }
    }, []);

    return(
        <SocketContext.Provider value={{ sendMessage }}>
            {children}
        </SocketContext.Provider>
    )
}