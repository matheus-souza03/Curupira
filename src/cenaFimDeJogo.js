const MENSAGENS_DERROTA = {
  cacadores: 'Os caçadores te alcançaram.',
  rio: 'Você caiu no rio.',
  tiros: 'Você levou três tiros.'
};

class CenaFimDeJogo extends Phaser.Scene {
  constructor() {
    super('CenaFimDeJogo');
  }

  create(dados) {
    const centro = LARGURA_TELA / 2;
    criarVeu(this, 0.65);

    criarTexto(this, centro, 150, MENSAGENS_DERROTA[dados.motivo], TAMANHO_CORPO, TEXTO_SUAVE).setOrigin(0.5);
    criarTexto(this, centro, 214, textoPontos(dados.pontos), TAMANHO_DISPLAY, TEXTO_PRINCIPAL, PESO_FINO).setOrigin(0.5);

    const linhaRecorde = dados.novoRecorde ? 'Novo recorde' : `Recorde: ${textoPontos(dados.recorde)}`;
    criarTexto(this, centro, 270, linhaRecorde, TAMANHO_CORPO, dados.novoRecorde ? TEXTO_DESTAQUE : TEXTO_SUAVE).setOrigin(0.5);
    criarTexto(this, centro, 304, `${formatarNumero(dados.metros)} m  ·  ${textoCacadores(dados.cacadores)}`, TAMANHO_PEQUENO, TEXTO_SUAVE).setOrigin(0.5);

    const chamada = criarTexto(this, centro, 384, 'Pressione espaço para correr de novo', TAMANHO_CORPO).setOrigin(0.5).setAlpha(0);
    const voltar = criarTexto(this, centro, 418, 'Esc para voltar ao menu', TAMANHO_PEQUENO, TEXTO_SUAVE).setOrigin(0.5).setAlpha(0);

    this.time.delayedCall(600, () => {
      chamada.setAlpha(1);
      voltar.setAlpha(1);
      this.tweens.add({ targets: chamada, alpha: 0.4, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.input.keyboard.once('keydown-SPACE', () => this.irPara('CenaJogo'));
      this.input.keyboard.once('keydown-ESC', () => this.irPara('CenaMenu'));
    });
  }

  irPara(cena) {
    this.scene.stop('CenaJogo');
    this.scene.start(cena);
  }
}
