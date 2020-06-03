import { serve } from "https://deno.land/std@v0.52.0/http/server.ts";
import {
  acceptWebSocket,
  WebSocket,
} from "https://deno.land/std@v0.52.0/ws/mod.ts";

const { PORT = "8080" } = Deno.env.toObject();

async function socketLoop(socket: WebSocket): Promise<void> {
	let id: string = "";
	const it = socket[Symbol.asyncIterator]();
	while (true) {
	  try {
		const { done, value } = await it.next();
		if (done) {
		  break;
		}
		if (typeof value !== "string") {
		  // ignore
		  continue;
		}
  
		const msg = JSON.parse(value)
		if (msg.type === "init") {
		  id = msg.id;
		  console.log('init')
		  //   handleInit(socket, msg);
		} else if (msg.type === "op") {
			console.log('op')
			//   handleOp(socket, msg);
		} else {
			console.log('handle mode')
		//   handleMode(socket, msg);
		}
	  } catch (e) {
		console.log(`failed to receive frame: ${e}`);
		await socket.close(1000).catch(console.error);
	  }
	}
  
	console.log("client disconnected", socket.conn.remoteAddr);
	// docs.get(id)?.clients.delete(socket);
  }

async function wsServer() {
	for await (const req of serve(`:${PORT}`)) {
	  const { headers, conn } = req;
	  const addr = conn.remoteAddr;
	  try {
		const socket = await acceptWebSocket({
		  conn,
		  headers,
		  bufReader: req.r,
		  bufWriter: req.w,
		});
		console.log("Socket", addr, "connected");
		socketLoop(socket);
	  } catch (e) {
		console.log("ERROR: socket", addr, "failed to connect.", e);
	  }
	}
  }
  
  console.log("listening on", PORT);
  wsServer();