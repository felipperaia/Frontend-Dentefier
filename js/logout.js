// public/js/logout.js

document.addEventListener('DOMContentLoaded', () => {
  const redirectButton = document.getElementById('redirectButton');
  if (!redirectButton) return;

  redirectButton.addEventListener('click', () => {
    // Limpa todas as infos de autenticação
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('user');

    // Redireciona para a página pública
    window.location.href = 'index.html';
  });
});
