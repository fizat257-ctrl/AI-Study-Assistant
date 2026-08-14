const SUPABASE_URL = "https://ftqkinmdgeyzlmmpqdix.supabase.co";
const SUPABASE_KEY = "sb_publishable_DUCP9cBpiKd1XNbrXMI3mw_ro88dwAz";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


// ==================================================
// ELEMENTS
// ==================================================

const authForm = document.getElementById("authForm");
const authButton = document.getElementById("authButton");
const switchButton = document.getElementById("switchButton");
const switchText = document.getElementById("switchText");
const formTitle = document.getElementById("formTitle");
const message = document.getElementById("message");

let isLogin = false;


// ==================================================
// CHECK EXISTING LOGIN
// ==================================================

async function checkExistingSession() {

  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  if (session) {
    window.location.href = "index.html";
  }
}

checkExistingSession();


// ==================================================
// SWITCH LOGIN / SIGN UP
// ==================================================

switchButton.addEventListener("click", () => {

  isLogin = !isLogin;

  message.textContent = "";

  if (isLogin) {

    formTitle.textContent = "Welcome back";

    authButton.textContent = "Login";

    switchText.textContent =
      "Don't have an account?";

    switchButton.textContent =
      "Sign Up";

  } else {

    formTitle.textContent =
      "Create your account";

    authButton.textContent =
      "Sign Up";

    switchText.textContent =
      "Already have an account?";

    switchButton.textContent =
      "Login";
  }

});


// ==================================================
// SIGN UP / LOGIN
// ==================================================

authForm.addEventListener("submit", async (event) => {

  event.preventDefault();

  const email =
    document.getElementById("email").value.trim();

  const password =
    document.getElementById("password").value;


  if (!email || !password) {

    message.textContent =
      "Please enter your email and password.";

    return;
  }


  message.textContent =
    "Please wait...";

  authButton.disabled = true;


  try {

    // ==================================================
    // LOGIN
    // ==================================================

    if (isLogin) {

      const { error } =
        await supabaseClient.auth.signInWithPassword({
          email: email,
          password: password
        });


      if (error) {

        message.textContent =
          error.message;

        authButton.disabled = false;

        return;
      }


      message.textContent =
        "Login successful!";


      setTimeout(() => {

        window.location.href =
          "index.html";

      }, 700);


    }

    // ==================================================
    // SIGN UP
    // ==================================================

    else {

      const { data, error } =
        await supabaseClient.auth.signUp({
          email: email,
          password: password
        });


      if (error) {

        message.textContent =
          error.message;

        authButton.disabled = false;

        return;
      }


      // Email confirmation is required
      if (data.user && !data.session) {

        message.textContent =
          "Account created! Please check your email and confirm your account.";

        authButton.disabled = false;

        return;
      }


      // Account created and logged in
      message.textContent =
        "Account created successfully!";


      setTimeout(() => {

        window.location.href =
          "index.html";

      }, 700);

    }

  } catch (error) {

    console.error(error);

    message.textContent =
      "Something went wrong. Please try again.";

    authButton.disabled = false;

  }

});