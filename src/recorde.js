const CHAVE_RECORDE = 'curupiraRecorde';

function lerRecorde() {
  try {
    return Number(localStorage.getItem(CHAVE_RECORDE)) || 0;
  } catch (erro) {
    return 0;
  }
}

function salvarRecorde(pontos) {
  try {
    localStorage.setItem(CHAVE_RECORDE, String(pontos));
  } catch (erro) {
    return;
  }
}
