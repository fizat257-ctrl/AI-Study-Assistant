const SUPABASE_URL = "https://ftqkinmdgeyzlmmpqdix.supabase.co";
const SUPABASE_KEY = "sb_publishable_DUCP9cBpiKd1XNbrXMI3mw_ro88dwAz";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const authForm = document.getElementById("authForm");
const authButton = document.getElementById("authButton");
const switchButton = document.getElementById("switchButton");
const switchText = document.getElementById("switchText");
const formTitle = document.getElementById("formTitle");
const message = document.getElementById("message");

let isLogin = false;

switchButton.addEventListener("click", () => {
  isLogin = !isLogin;

  if (isLogin) {
    formTitle.textContent = "Welcome back";
    authButton.textContent = "Login";
    switchText.textContent = "Don't have an account?";
    switchButton.textContent = "Sign Up";
  } else {
    formTitle.textContent = "Create your account";
    authButton.textContent = "Sign Up";
    switchText.textContent = "Already have an account?";
    switchButton.textContent = "Login";
  }

  message.textContent = "";
});

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  message.textContent = "Please wait...";

  if (isLogin) {
    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      message.textContent = error.message;
      return;
    }

    message.textContent = "Login successful!";

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);

  } else {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password
    });

    if (error) {
      message.textContent = error.message;
      return;
    }

    if (data.user && !data.session) {
      message.textContent =
        "Account created! Please check your email to confirm your account.";
    } else {
      message.textContent = "Account created successfully!";

      setTimeout(() => {
        window.location.href = "index.html";
      }, 1000);
    }
  }
});