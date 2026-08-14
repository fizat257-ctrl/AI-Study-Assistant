const { data: { session } } = await supabaseClient.auth.getSession();

if (!session) {
  window.location.href = "auth.html";
}