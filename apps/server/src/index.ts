import http from "http";
import SocketService from "./services/socket";

async function startServer() {
    const socketService = new SocketService();
    const httpServer = http.createServer();
    const PORT = process.env.PORT || 8000;

    socketService.getIo().attach(httpServer);
    console.log("SocketService attached to httpServer");
    socketService.initListeners();

    httpServer.listen(PORT, () => {
        console.log(`httpServer is running on port ${PORT}`);
    });
}

startServer();