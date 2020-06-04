export const getDadJokes = async (amount) => {
  const calls = new Array(ammount);
  return Promise.allSettled((calls) =>
    globalThis.fetch("https://icanhazdadjoke.com/")
  );
};
