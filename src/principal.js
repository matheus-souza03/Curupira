const configuracao = {
  type: Phaser.AUTO,
  parent: 'jogo',
  width: LARGURA_TELA,
  height: ALTURA_TELA,
  backgroundColor: '#0b0807',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: GRAVIDADE }, debug: false }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [CenaMenu, CenaJogo, CenaFimDeJogo, CenaPausa]
};

const jogo = new Phaser.Game(configuracao);
