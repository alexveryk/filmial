export const fetchUsers = async () => {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/users");
    if (!response.ok) {
      throw new Error("Some error");
    }
    const users = await response.json();
    return users;
  } catch (error) {
    console.log(error.message);
  }
};
