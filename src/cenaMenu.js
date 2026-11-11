class CenaMenu extends Phaser.Scene {
  constructor() {
    super('CenaMenu');
  }

  create() {
    gerarTexturas(this);
    criarAnimacoes(this);
    this.cenario = criarCenario(this);
    this.deslocamento = 0;

    this.add.rectangle(LARGURA_TELA / 2, TOPO_CHAO + 40, LARGURA_TELA, 80, COR_SILHUETA).setDepth(1);
    this.grama = this.add.tileSprite(0, TOPO_CHAO + 1, LARGURA_TELA, 14, 'grama').setOrigin(0, 1).setDepth(1);

    const curupira = this.add.sprite(600, TOPO_CHAO, 'curupira1').setOrigin(0.5, 1).setDepth(4).play('correr');
    criarCabelo(this).setPosition(curupira.x + 2, curupira.y - 55);
    this.add.sprite(360, TOPO_CHAO, 'cacador1').setOrigin(0.5, 1).setDepth(3).play('cacadorCorrer');
    this.add.sprite(300, TOPO_CHAO, 'cacador2').setOrigin(0.5, 1).setDepth(3).play('cacadorCorrer');

    const centro = LARGURA_TELA / 2;
    criarFaixaSuperior(this, 300, 0.35).setDepth(0);
    criarTexto(this, centro, 124, 'CURUPIRA', TAMANHO_TITULO, TEXTO_PRINCIPAL, PESO_FINO).setOrigin(0.5).setLetterSpacing(18).setDepth(10);
    criarTexto(this, centro, 196, 'Fuja dos caçadores e proteja a mata.', TAMANHO_CORPO, TEXTO_PRINCIPAL).setOrigin(0.5).setDepth(10);

    const recorde = lerRecorde();
    if (recorde > 0) {
      criarTexto(this, centro, 230, `Recorde: ${textoPontos(recorde)}`, TAMANHO_PEQUENO, TEXTO_SUAVE).setOrigin(0.5).setDepth(10);
    }

    const chamada = criarTexto(this, centro, 490, 'Pressione espaço para começar', TAMANHO_CORPO).setOrigin(0.5).setDepth(10);
    this.tweens.add({ targets: chamada, alpha: 0.4, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    criarTexto(this, centro, 522, '↑  pular        ↓  deslizar        espaço  atirar        esc  pausar', TAMANHO_PEQUENO, TEXTO_SUAVE).setOrigin(0.5).setDepth(10);

    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('CenaJogo');
    });
  }

  update(tempo, delta) {
    this.deslocamento += delta * 0.32;
    this.grama.tilePositionX = this.deslocamento;
    atualizarCenario(this.cenario, this.deslocamento, 0);
  }
}
