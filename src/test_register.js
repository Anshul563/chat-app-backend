// Native fetch is available in Node 18+

const register = async () => {
  const url = "http://localhost:5003/api/auth/register";
  console.log("Registering at", url);

  const body = {
    firstName: "Test",
    lastName: "User",
    username: `testuser_${Date.now()}`,
    email: `testuser_${Date.now()}@example.com`,
    password: "password123",
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Fetch Error:", error);
  }
};

register();
