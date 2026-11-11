const PALETA_ENTARDECER = { ceuTopo: 0x2b3a5c, horizonte: 0xf0a868, astro: 0xfff0c8 };
const PALETA_NOITE = { ceuTopo: 0x070d1f, horizonte: 0x3a5a8c, astro: 0xe6edff };

const CAMADAS_FLORESTA = [
  { chave: 'camadaSerra', profundidade: 0.1, paralaxe: 0.05, neblina: 230 },
  { chave: 'camadaMorros', profundidade: 0.28, paralaxe: 0.15, neblina: 300 },
  { chave: 'camadaArvores', profundidade: 0.48, paralaxe: 0.3, neblina: 350 },
  { chave: 'camadaMata', profundidade: 0.7, paralaxe: 0.5, neblina: 405 }
];

function misturarCor(corA, corB, proporcao) {
  const inicio = Phaser.Display.Color.ValueToColor(corA);
  const fim = Phaser.Display.Color.ValueToColor(corB);
  const mistura = Phaser.Display.Color.Interpolate.ColorWithColor(inicio, fim, 100, proporcao * 100);
  return Phaser.Display.Color.GetColor(mistura.r, mistura.g, mistura.b);
}

function criarCenario(cena) {
  const ceu = cena.add.graphics().setScrollFactor(0).setDepth(-30);
  const estrelas = cena.add.graphics().setScrollFactor(0).setDepth(-29);
  estrelas.fillStyle(0xffffff, 1);
  for (let i = 0; i < 70; i++) {
    const tamanho = Math.random() < 0.2 ? 2 : 1;
    estrelas.fillRect(Phaser.Math.Between(0, LARGURA_TELA), Phaser.Math.Between(0, 280), tamanho, tamanho);
  }
  const haloSol = cena.add.image(720, 215, 'halo').setScale(3.4).setScrollFactor(0).setDepth(-28);
  const sol = cena.add.circle(720, 215, 36, 0xffffff).setScrollFactor(0).setDepth(-27);
  const haloLua = cena.add.image(240, 110, 'halo').setScale(1.6).setScrollFactor(0).setDepth(-28);
  const lua = cena.add.circle(240, 110, 24, 0xffffff).setScrollFactor(0).setDepth(-27);

  const camadas = CAMADAS_FLORESTA.map((camada, indice) => ({
    ...camada,
    imagem: cena.add.tileSprite(0, 0, LARGURA_TELA, ALTURA_TELA, camada.chave).setOrigin(0).setScrollFactor(0).setDepth(-26 + indice * 2),
    nevoa: cena.add.graphics().setScrollFactor(0).setDepth(-25 + indice * 2)
  }));

  const vagalumes = cena.add.particles(0, 0, 'particula', {
    x: { min: 0, max: LARGURA_TELA },
    y: { min: 60, max: TOPO_CHAO - 20 },
    lifespan: { min: 4000, max: 7000 },
    speedX: { min: -30, max: -10 },
    speedY: { min: -8, max: 8 },
    scale: { min: 0.2, max: 0.5 },
    alpha: { start: 0.5, end: 0 },
    tint: 0xfff3d6,
    frequency: 220
  }).setScrollFactor(0).setDepth(-16);

  return { ceu, estrelas, haloSol, sol, haloLua, lua, camadas, vagalumes };
}

function atualizarCenario(cenario, deslocamento, tempo) {
  const noite = (1 - Math.cos((tempo / DURACAO_CICLO) * Math.PI * 2)) / 2;
  const topo = misturarCor(PALETA_ENTARDECER.ceuTopo, PALETA_NOITE.ceuTopo, noite);
  const horizonte = misturarCor(PALETA_ENTARDECER.horizonte, PALETA_NOITE.horizonte, noite);
  const corAstro = misturarCor(PALETA_ENTARDECER.astro, PALETA_NOITE.astro, noite);

  cenario.ceu.clear();
  cenario.ceu.fillGradientStyle(topo, topo, horizonte, horizonte, 1);
  cenario.ceu.fillRect(0, 0, LARGURA_TELA, ALTURA_TELA);
  cenario.estrelas.setAlpha(noite);

  const alturaSol = 215 + noite * 320;
  cenario.sol.setFillStyle(corAstro).setAlpha(1 - noite).setY(alturaSol);
  cenario.haloSol.setTint(corAstro).setAlpha(1 - noite).setY(alturaSol);
  const alturaLua = 110 + (1 - noite) * 240;
  cenario.lua.setFillStyle(corAstro).setAlpha(noite).setY(alturaLua);
  cenario.haloLua.setTint(corAstro).setAlpha(noite * 0.6).setY(alturaLua);

  cenario.camadas.forEach(camada => {
    camada.imagem.setTint(misturarCor(horizonte, COR_SILHUETA, camada.profundidade));
    camada.imagem.tilePositionX = deslocamento * camada.paralaxe;
    camada.nevoa.clear();
    camada.nevoa.fillGradientStyle(horizonte, horizonte, horizonte, horizonte, 0, 0, 0.55, 0.55);
    camada.nevoa.fillRect(0, camada.neblina - 40, LARGURA_TELA, 120);
    camada.nevoa.fillStyle(horizonte, 0.55);
    camada.nevoa.fillRect(0, camada.neblina + 80, LARGURA_TELA, ALTURA_TELA - camada.neblina - 80);
  });

  return { horizonte, noite };
}
