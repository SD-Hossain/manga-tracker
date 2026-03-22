import createKindeClient from "../lib/kinde-auth-pkce-js.esm.js";

let client = null;

async function getClient() {
  if (client) return client;

  client = await createKindeClient({
    client_id: "0616a78c02c24e6f8b181e984a194182",
    domain: "https://mangatracker.kinde.com",
    redirect_uri: window.location.origin,
    logout_uri: window.location.origin,
    audience: "manga_backend_api",
    is_dangerously_use_local_storage: true
  });

  return client;
}

export async function login() {
  const c = await getClient();
  await c.login();
}

export async function logout() {
  const c = await getClient();
  await c.logout();
  localStorage.removeItem("authToken");
}

export async function initAuth() {
  const c = await getClient();

  const isAuthenticated = await c.isAuthenticated();
  let user = null;

  if (isAuthenticated) {
    user = await c.getUser();
    const token = await c.getToken();
    if (token) {
      localStorage.setItem("authToken", token);
    }
  }

  return { isAuthenticated, user };
}
