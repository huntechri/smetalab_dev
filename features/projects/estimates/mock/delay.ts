export const delay = async (min = 300, max = 800) => {
    const timeout = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise((resolve) => setTimeout(resolve, timeout));
};
