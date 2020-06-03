const watcher = Deno.watchFs("./");
for await (const event of watcher) {
  console.log(">>>> event", event);
  // { kind: "create", paths: [ "/foo.txt" ] }
}

// import { watch } from "https://deno.land/x/watch/mod.ts";


// for await (const changes of watch("newFile.txt")) {
//   console.log(changes.added);
//   console.log(changes.modified);
//   console.log(changes.deleted);
// }