import { Server as SocketIOServer } from 'socket.io';
import { type NextRequest } from 'next/server';
import { type Server as HttpServer } from 'http';

// A type assertion to tell TypeScript that our response object will have a custom 'socket' property.
// This is necessary because we are modifying the base HTTP server object.
type ResponseWithSocket = NextRequest & {
  socket: {
    server: HttpServer & {
      io?: SocketIOServer;
    };
  };
};

// We are exporting this function as GET, but it could be any method.
// Its purpose is to initialize the socket server and then do nothing.
export async function GET(req: NextRequest) {
  // The 'res' object here is not a standard response object, but a cast to our custom type.
  // We're doing this to get access to the underlying HTTP server.
  const res = req as unknown as ResponseWithSocket;

  if (!res.socket.server.io) {
    console.log('New Socket.io server initializing...');
    // Create a new Socket.IO server and attach it to the existing HTTP server.
    const io = new SocketIOServer(res.socket.server, {
      path: '/api/socket',
      addTrailingSlash: false,
    });
    res.socket.server.io = io;

    io.on('connection', socket => {
      console.log(`User connected: ${socket.id}`);

      socket.on('join_business_room', (businessId: string) => {
        socket.join(businessId);
        console.log(`User ${socket.id} joined room ${businessId}`);
      });

      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
      });
    });
  } else {
    console.log('Socket.io server already running.');
  }

  // We need to end the response to avoid a timeout, but we don't send any content.
  // This route's only job is to get the server running.
  // In a real application, you might use a different approach or return a status.
  // For now, returning a 200 OK is sufficient.
  return new Response('Socket server initialized', { status: 200 });
}
