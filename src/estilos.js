const FONTE_TEXTO = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Roboto, Arial, sans-serif';
const PESO_FINO = '300';
const PESO_NORMAL = '400';

const TAMANHO_TITULO = 96;
const TAMANHO_DISPLAY = 56;
const TAMANHO_CORPO = 22;
const TAMANHO_PEQUENO = 16;

const TEXTO_PRINCIPAL = '#f6efe6';
const TEXTO_SUAVE = '#d2c4b6';
const TEXTO_DESTAQUE = '#e63926';
const TEXTO_DOURADO = '#ffd27a';

function criarTexto(cena, x, y, conteudo, tamanho, cor = TEXTO_PRINCIPAL, peso = PESO_NORMAL) {
  return cena.add.text(x, y, conteudo, {
    fontFamily: FONTE_TEXTO,
    fontSize: `${tamanho}px`,
    fontStyle: peso,
    color: cor,
    resolution: 2
  }).setShadow(0, 2, 'rgba(0, 0, 0, 0.45)', 10, false, true);
}

function criarVeu(cena, opacidade) {
  return cena.add.rectangle(LARGURA_TELA / 2, ALTURA_TELA / 2, LARGURA_TELA, ALTURA_TELA, COR_SOMBRA_TELA, opacidade);
}

function criarFaixaSuperior(cena, altura, opacidade) {
  const faixa = cena.add.graphics().setScrollFactor(0).setDepth(99);
  faixa.fillGradientStyle(COR_SOMBRA_TELA, COR_SOMBRA_TELA, COR_SOMBRA_TELA, COR_SOMBRA_TELA, opacidade, opacidade, 0, 0);
  faixa.fillRect(0, 0, LARGURA_TELA, altura);
  return faixa;
}

function formatarNumero(numero) {
  return numero.toLocaleString('pt-BR');
}

function textoPontos(quantidade) {
  return `${formatarNumero(quantidade)} ${quantidade === 1 ? 'ponto' : 'pontos'}`;
}

function textoCacadores(quantidade) {
  return `${quantidade} ${quantidade === 1 ? 'caçador derrubado' : 'caçadores derrubados'}`;
}
