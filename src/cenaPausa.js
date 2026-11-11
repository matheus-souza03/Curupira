class CenaPausa extends Phaser.Scene {
  constructor() {
    super('CenaPausa');
  }

  create() {
    const centro = LARGURA_TELA / 2;
    criarVeu(this, 0.55);
    criarTexto(this, centro, 236, 'Pausado', TAMANHO_DISPLAY, TEXTO_PRINCIPAL, PESO_FINO).setOrigin(0.5).setLetterSpacing(4);
    criarTexto(this, centro, 296, 'Esc para continuar', TAMANHO_PEQUENO, TEXTO_SUAVE).setOrigin(0.5);

    this.input.keyboard.once('keydown-ESC', () => {
      const cenaJogo = this.scene.get('CenaJogo');
      cenaJogo.retomadoEm = this.game.getTime();
      cenaJogo.input.keyboard.resetKeys();
      this.scene.resume('CenaJogo');
      this.scene.stop();
    });
  }
}
