const gel = element => document.querySelector(element);

gel('#login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const response = await axios.post('/api/user/login', {
    username: gel('input[name=username]').value,
    password: gel('input[name=password]').value,
  });
  console.log(response);
});