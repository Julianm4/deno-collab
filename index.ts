/*
 * This is a basic example of a test server which provides a logger middleware,
 * a response time middleware, and a basic "Hello World!" middleware.
 */

// Importing some console colors
import {
  green,
  cyan,
  bold,
  yellow,
} from "https://deno.land/std@0.54.0/fmt/colors.ts";

import { Application, send, Router } from "https://deno.land/x/oak@v5.0.0/mod.ts";

import { handleSocket } from './socket.ts'

const app = new Application();
const router = new Router();

router
// .get('/editor/:docId', async (ctx) => {
//   ctx.response.body = "Hello World!"
// })

.get('/', async (ctx) => {
  await send(ctx, ctx.request.url.pathname, {
    root: `${Deno.cwd()}/public`,
    index: "index.html",
  });
})
.get('/ws', handleSocket);


// Logger
app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.headers.get("X-Response-Time");
  console.log(
    `${green(ctx.request.method)} ${cyan(ctx.request.url.pathname)} - ${
      bold(
        String(rt),
        )
      }`,
      );
    });
    
app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.response.headers.set("X-Response-Time", `${ms}ms`);
  });
    

app.use(router.routes());
app.use(router.allowedMethods());

app.use(async (context) => {
  await send(context, context.request.url.pathname, {
    root: `${Deno.cwd()}/public`,
    index: "editor.html",
  });
})

app.addEventListener("listen", ({ hostname, port }) => {
  console.log(
    bold("Start listening on ") + yellow(`${hostname}:${port}`),
  );
});



await app.listen({ hostname: 'localhost', port: 3000 });
console.log(bold("Finished."));


// import { Application, send } from "https://deno.land/x/oak@v5.0.0/mod.ts";




// // await app.listen({ port: 8000 });


// const app = new Application();
// console.log('hello')
// // app.use((ctx) => {
// //   ctx.response.body = "Hello World!";
// // });

// app.use(async (context) => {
//   await send(context, context.request.url.pathname, {
//     root: `${Deno.cwd()}/public`,
//     index: "editor.html",
//   });
// });
// console.log('hello')
// await app.listen({ port: 8000 });
// console.log('Server running')