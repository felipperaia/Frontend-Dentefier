// frontend/public/js/main.js
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const formData = new FormData(loginForm);
    const data = {
      username: formData.get('username'),
      password: formData.get('password')
    };

    try {
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',              // ← envia e recebe o cookie HttpOnly
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await resp.json();
      if (!resp.ok) {
        return alert(result.message || 'Erro ao realizar login');
      }

      // guarda apenas os dados do usuário para a UI
      localStorage.setItem('user', JSON.stringify(result.user));
      // redireciona usando rota estática (mesma origem)
      window.location.href = '/tela_inicio.html';
    } catch (err) {
      console.error('Erro no login:', err);
      alert('Falha no login. Tente novamente.');
    }
  });
});
