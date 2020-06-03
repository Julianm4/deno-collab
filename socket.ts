// import { WebSocket, acceptWebSocket, isWebSocketCloseEvent, acceptable } from 'https://deno.land/std@v1.0.3/ws/mod.ts'
import { WebSocket, acceptWebSocket, isWebSocketCloseEvent, acceptable } from 'https://deno.land/std@0.53.0/ws/mod.ts'
import { v4 } from 'https://deno.land/std@0.53.0/uuid/mod.ts'


const users = new Map<string, WebSocket>()

export const handleSocket = async (ctx: any) => {
  if (acceptable(ctx.request.serverRequest)) {
    const { conn, r: bufReader, w: bufWriter, headers } = ctx.request.serverRequest;
    const socket = await acceptWebSocket({
      conn,
      bufReader,
      bufWriter,
      headers,
    })

    await socketEventHandlers(socket);
  } else {
    throw new Error('Error when connecting websocket');
  }
}

export const broadcast = async (message: string, userId: string = '') => {
	users.forEach((ws, id, users) => {
		if (userId !== id) {
			ws.send(message)
		}
	})
}


export const socketEventHandlers = async (ws: WebSocket): Promise<void> => {
  // Register user connection
  const userId = v4.generate()

  users.set(userId, ws)
  await broadcast(`> User with the id ${userId} is connected`)

	// Wait for new messages
	try { 
	 	for await (const event of ws) {
			const message = typeof event === 'string' ? event : ''

			await broadcast(message, userId)
			console.log(`Message: ${JSON.stringify(message)}`)

			// Unregister user conection
			if (!message && isWebSocketCloseEvent(event)) {
			users.delete(userId)
			  await broadcast(`> User with the id ${userId} is disconnected`)
			}
		} 
	} catch (err) {
		console.log(err)
	}
}