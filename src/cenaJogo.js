class CenaJogo extends Phaser.Scene {
  constructor() {
    super('CenaJogo');
  }

  create() {
    gerarTexturas(this);
    criarAnimacoes(this);
    this.cenario = criarCenario(this);

    this.velocidade = VELOCIDADE_INICIAL;
    this.distanciaBando = DISTANCIA_BANDO_MAXIMA;
    this.distanciaAlvo = DISTANCIA_BANDO_MAXIMA;
    this.vidas = VIDAS_INICIAIS;
    this.flechas = FLECHAS_INICIAIS;
    this.cacadoresDerrubados = 0;
    this.metros = 0;
    this.tempoDecorrido = 0;
    this.fimDeJogo = false;
    this.deslizando = false;
    this.invulneravelAte = 0;
    this.ultimoDisparo = 0;
    this.proximoCacador = 0;
    this.proximoTiroGeral = 0;
    this.retomadoEm = 0;
    this.recorde = lerRecorde();
    this.avisouRecorde = false;
    this.perigosNoChao = [];
    this.decoracoes = [];
    this.aguas = [];

    this.grupoChao = this.physics.add.staticGroup();
    this.grupoPlataformas = this.physics.add.staticGroup();
    this.grupoObstaculos = this.physics.add.staticGroup();
    this.grupoColetaveis = this.physics.add.group({ allowGravity: false, immovable: true });
    this.grupoCacadores = this.physics.add.group();
    this.grupoFlechas = this.physics.add.group({ allowGravity: false });
    this.grupoTiros = this.physics.add.group({ allowGravity: false });

    this.criarChao(-1400, 2700);
    this.criarRio(1300, 140);
    this.proximoX = 1440;

    this.jogador = this.physics.add.sprite(0, TOPO_CHAO, 'curupira1').setOrigin(0.5, 1).setDepth(4);
    this.cabelo = criarCabelo(this);
    this.ajustarCorpoJogador();
    this.posicionarCabelo();
    this.jogador.anims.play('correr');

    this.cameras.main.startFollow(this.jogador, true, 1, 0, DESLOCAMENTO_CAMERA, TOPO_CHAO - ALTURA_TELA / 2);
    this.cameras.main.setScroll(this.cameras.main.scrollX, 0);

    this.physics.add.collider(this.jogador, this.grupoChao);
    this.physics.add.collider(this.jogador, this.grupoPlataformas);
    this.physics.add.collider(this.grupoCacadores, this.grupoChao);
    this.physics.add.overlap(this.jogador, this.grupoObstaculos, (jogador, obstaculo) => this.baterObstaculo(obstaculo));
    this.physics.add.overlap(this.jogador, this.grupoTiros, (jogador, tiro) => this.serAtingido(tiro));
    this.physics.add.overlap(this.jogador, this.grupoColetaveis, (jogador, coletavel) => this.coletarFlechas(coletavel));
    this.physics.add.overlap(this.grupoFlechas, this.grupoCacadores, (flecha, cacador) => this.acertarCacador(flecha, cacador));

    this.teclas = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on('keydown-ESC', this.pausar, this);

    this.criarCacador(POSICOES_NO_BANDO[0] + 260);
    this.criarCacador(POSICOES_NO_BANDO[1] + 260);

    this.criarHud();
    this.mostrarDica();
  }

  update(tempo, delta) {
    if (this.fimDeJogo) {
      return;
    }
    const segundos = delta / 1000;
    this.tempoDecorrido += delta;
    this.metros = Math.max(0, Math.floor(this.jogador.x / PIXELS_POR_METRO));
    this.velocidade = Math.min(VELOCIDADE_MAXIMA, VELOCIDADE_INICIAL + this.metros * AUMENTO_VELOCIDADE_POR_METRO);
    this.jogador.setVelocityX(this.velocidade);

    this.controlarJogador(tempo);
    this.atualizarCacadores(tempo, segundos);
    this.animarColetaveis(tempo);
    this.gerarPercurso();
    this.limparForaDaTela();
    this.verificarDerrota();
    this.atualizarHud();
    this.posicionarCabelo();

    const luz = atualizarCenario(this.cenario, this.cameras.main.scrollX, this.tempoDecorrido);
    this.pintarAguas(luz.horizonte);
  }

  controlarJogador(tempo) {
    const corpo = this.jogador.body;
    const noChao = corpo.blocked.down || corpo.touching.down;

    if (Phaser.Input.Keyboard.JustDown(this.teclas.up) && noChao) {
      this.jogador.setVelocityY(FORCA_PULO);
    }
    if (Phaser.Input.Keyboard.JustDown(this.teclas.space)) {
      this.atirar(tempo);
    }
    if (!this.teclas.up.isDown && corpo.velocity.y < -280) {
      this.jogador.setVelocityY(-280);
    }
    if (!noChao && this.teclas.down.isDown) {
      this.jogador.setVelocityY(Math.max(corpo.velocity.y, VELOCIDADE_QUEDA_RAPIDA));
    }

    const querDeslizar = this.teclas.down.isDown && noChao;
    if (querDeslizar !== this.deslizando) {
      this.deslizando = querDeslizar;
      this.ajustarCorpoJogador();
    }

    if (!this.deslizando) {
      if (noChao) {
        this.jogador.anims.play('correr', true);
      } else if (this.jogador.texture.key !== 'curupiraPulo') {
        this.jogador.anims.stop();
        this.jogador.setTexture('curupiraPulo');
      }
    }
  }

  ajustarCorpoJogador() {
    if (this.deslizando) {
      this.jogador.anims.stop();
      this.jogador.setTexture('curupiraDeslizando');
      this.jogador.body.setSize(44, 24, false).setOffset(6, 6);
    } else {
      this.jogador.setTexture('curupira1');
      this.jogador.body.setSize(22, 58, false).setOffset(9, 6);
    }
  }

  posicionarCabelo() {
    const [deslocamentoX, deslocamentoY] = this.deslizando ? [-18, -24] : [2, -55];
    this.cabelo.setPosition(this.jogador.x + deslocamentoX, this.jogador.y + deslocamentoY);
  }

  atirar(tempo) {
    if (tempo - this.ultimoDisparo < INTERVALO_DISPARO) {
      return;
    }
    this.ultimoDisparo = tempo;
    if (this.flechas <= 0) {
      this.mostrarTextoFlutuante(this.jogador.x, this.jogador.y - 84, 'Sem flechas', TEXTO_SUAVE);
      return;
    }
    this.flechas--;
    const altura = this.deslizando ? 14 : 36;
    const flecha = this.grupoFlechas.create(this.jogador.x - 14, this.jogador.y - altura, 'flecha').setDepth(5);
    flecha.setVelocityX(this.velocidade - VELOCIDADE_FLECHA);
  }

  cacadoresVivos() {
    return this.grupoCacadores.getChildren().filter(cacador => !cacador.derrubado);
  }

  criarCacador(atrasoInicial) {
    const vivos = this.cacadoresVivos();
    const posicaoNoBando = POSICOES_NO_BANDO.find(posicao => !vivos.some(cacador => cacador.posicaoNoBando === posicao));
    if (posicaoNoBando === undefined) {
      return;
    }
    const cacador = this.grupoCacadores.create(this.jogador.x - this.distanciaBando - atrasoInicial, TOPO_CHAO - 1, 'cacador1');
    cacador.setOrigin(0.5, 1).setDepth(3);
    cacador.body.setSize(24, 72, false).setOffset(13, 6);
    cacador.posicaoNoBando = posicaoNoBando;
    cacador.atraso = atrasoInicial;
    cacador.derrubado = false;
    cacador.aviso = null;
    cacador.proximoTiro = this.time.now + Phaser.Math.Between(2000, 3500);
    cacador.anims.play('cacadorCorrer');
  }

  atualizarCacadores(tempo, segundos) {
    this.distanciaAlvo = Math.min(DISTANCIA_BANDO_MAXIMA, this.distanciaAlvo + RECUPERACAO_BANDO * segundos);
    this.distanciaBando = Phaser.Math.Linear(this.distanciaBando, this.distanciaAlvo, 0.1);

    const vivos = this.cacadoresVivos();
    const quantidadeDesejada = Math.min(POSICOES_NO_BANDO.length, 2 + Math.floor(this.metros / 500));
    if (vivos.length < quantidadeDesejada && tempo > this.proximoCacador) {
      this.criarCacador(ATRASO_CHEGADA);
      this.proximoCacador = tempo + 2500;
    }

    vivos.forEach(cacador => {
      if (cacador.y > ALTURA_TELA + 80) {
        this.removerAviso(cacador);
        cacador.destroy();
        return;
      }
      cacador.atraso = Math.max(cacador.posicaoNoBando, cacador.atraso - VELOCIDADE_CHEGADA * segundos);
      cacador.x = this.jogador.x - this.distanciaBando - cacador.atraso;
      if (cacador.aviso) {
        cacador.aviso.x = cacador.x + 22;
      }
      const noChao = cacador.body.blocked.down || cacador.body.touching.down;
      if (noChao && this.temPerigoAFrente(cacador.x)) {
        cacador.setVelocityY(FORCA_PULO);
      }
      const naTela = cacador.x > this.cameras.main.scrollX + 40;
      if (noChao && naTela && !cacador.aviso && tempo > cacador.proximoTiro && tempo > this.proximoTiroGeral) {
        this.prepararTiro(cacador);
      }
    });
  }

  temPerigoAFrente(x) {
    return this.perigosNoChao.some(perigo => perigo.inicio - x > 0 && perigo.inicio - x < 50);
  }

  prepararTiro(cacador) {
    const alturaTiro = Phaser.Math.Between(0, 1) === 0 ? 14 : 48;
    cacador.aviso = this.add.image(cacador.x + 22, TOPO_CHAO - alturaTiro, 'brilho')
      .setDepth(6)
      .setTint(COR_PERIGO)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setScale(0.4);
    this.tweens.add({ targets: cacador.aviso, scale: 1.3, duration: TEMPO_AVISO, ease: 'Quad.easeIn' });
    this.proximoTiroGeral = this.time.now + TEMPO_AVISO + 500;
    this.time.delayedCall(TEMPO_AVISO, () => this.dispararCacador(cacador, alturaTiro));
  }

  dispararCacador(cacador, alturaTiro) {
    this.removerAviso(cacador);
    if (!cacador.active || cacador.derrubado || this.fimDeJogo) {
      return;
    }
    const fatorDificuldade = Math.max(0.45, 1 - this.metros / 2500);
    cacador.proximoTiro = this.time.now + Phaser.Math.Between(1800, 3600) * fatorDificuldade;
    const tiro = this.grupoTiros.create(cacador.x + 24, TOPO_CHAO - alturaTiro, 'tiro').setDepth(5).setTint(COR_PERIGO);
    tiro.setVelocityX(this.velocidade + VELOCIDADE_TIRO);
  }

  removerAviso(cacador) {
    if (cacador.aviso) {
      this.tweens.killTweensOf(cacador.aviso);
      cacador.aviso.destroy();
      cacador.aviso = null;
    }
  }

  acertarCacador(flecha, cacador) {
    if (cacador.derrubado) {
      return;
    }
    flecha.destroy();
    this.removerAviso(cacador);
    cacador.derrubado = true;
    cacador.body.enable = false;
    cacador.anims.stop();
    this.cacadoresDerrubados++;
    this.distanciaAlvo = Math.min(DISTANCIA_BANDO_MAXIMA, this.distanciaAlvo + BONUS_RECUO);
    this.proximoCacador = this.time.now + 3500;
    this.mostrarTextoFlutuante(cacador.x, cacador.y - 96, `+${PONTOS_POR_CACADOR}`, TEXTO_PRINCIPAL);
    this.tweens.add({
      targets: cacador,
      angle: -90,
      alpha: 0,
      duration: 700,
      ease: 'Quad.easeIn',
      onComplete: () => cacador.destroy()
    });
  }

  coletarFlechas(coletavel) {
    const x = coletavel.x;
    const y = coletavel.y;
    coletavel.destroy();
    this.flechas = Math.min(FLECHAS_MAXIMAS, this.flechas + FLECHAS_POR_COLETA);
    this.mostrarTextoFlutuante(x, y - 28, FLECHAS_POR_COLETA === 1 ? '+1 flecha' : `+${FLECHAS_POR_COLETA} flechas`, TEXTO_DOURADO);
  }

  tropecar() {
    if (this.fimDeJogo || this.time.now < this.invulneravelAte) {
      return false;
    }
    this.invulneravelAte = this.time.now + TEMPO_INVULNERAVEL;
    this.distanciaAlvo -= PERDA_TROPECO;
    this.cameras.main.shake(160, 0.006);
    this.tweens.add({
      targets: this.jogador,
      alpha: 0.35,
      duration: 90,
      yoyo: true,
      repeat: 4,
      onComplete: () => this.jogador.setAlpha(1)
    });
    return true;
  }

  baterObstaculo(obstaculo) {
    if (obstaculo.atingido) {
      return;
    }
    obstaculo.atingido = true;
    this.tropecar();
  }

  serAtingido(tiro) {
    tiro.destroy();
    if (!this.tropecar()) {
      return;
    }
    this.vidas--;
    if (this.vidas <= 0) {
      this.terminar('tiros');
    }
  }

  gerarPercurso() {
    const limite = this.cameras.main.scrollX + LARGURA_TELA + 300;
    while (this.proximoX < limite) {
      this.gerarTrecho();
    }
  }

  gerarTrecho() {
    const inicio = this.proximoX;
    const largura = Phaser.Math.Between(700, 1300);
    this.criarChao(inicio, largura);
    let posicao = inicio + 260;
    while (posicao < inicio + largura - 220) {
      this.criarElemento(posicao);
      posicao += Phaser.Math.Between(Math.round(this.velocidade * 1.0), Math.round(this.velocidade * 1.7));
    }
    const larguraRio = Phaser.Math.Between(Math.round(this.velocidade * 0.25), Math.round(this.velocidade * 0.45));
    this.criarRio(inicio + largura, larguraRio);
    this.proximoX = inicio + largura + larguraRio;
  }

  criarElemento(posicao) {
    const sorteio = Phaser.Math.Between(1, 100);
    if (sorteio <= 24) {
      this.criarObstaculoBaixo(posicao, 'pedra');
    } else if (sorteio <= 38) {
      this.criarObstaculoBaixo(posicao, 'tronco');
    } else if (sorteio <= 58) {
      this.criarGalhoBaixo(posicao);
    } else if (sorteio <= 78) {
      this.criarArvore(posicao);
    } else if (sorteio <= 92) {
      this.criarFlechaColetavel(posicao, TOPO_CHAO - 30);
    }
  }

  criarChao(inicio, largura) {
    const chao = this.add.rectangle(inicio + largura / 2, TOPO_CHAO + 40, largura, 80, COR_SILHUETA).setDepth(1);
    this.grupoChao.add(chao);
    this.decoracoes.push(this.add.tileSprite(inicio, TOPO_CHAO + 1, largura, 14, 'grama').setOrigin(0, 1).setDepth(1));
  }

  criarRio(inicio, largura) {
    this.perigosNoChao.push({ inicio, fim: inicio + largura });
    const centro = inicio + largura / 2;
    const agua = this.add.rectangle(centro, 515, largura + 24, 50, COR_AGUA).setDepth(0);
    const reflexo = this.add.rectangle(centro, 491, largura + 24, 2, COR_BRILHO_AGUA).setDepth(0).setAlpha(0.8);
    this.aguas.push({ agua, reflexo });
    this.decoracoes.push(agua, reflexo);
  }

  pintarAguas(horizonte) {
    const corAgua = misturarCor(horizonte, COR_SILHUETA, 0.3);
    this.aguas.forEach(({ agua, reflexo }) => {
      agua.setFillStyle(corAgua);
      reflexo.setFillStyle(horizonte);
    });
  }

  criarObstaculoBaixo(posicao, textura) {
    const obstaculo = this.grupoObstaculos.create(posicao, TOPO_CHAO, textura).setOrigin(0.5, 1).setDepth(2);
    obstaculo.refreshBody();
    this.perigosNoChao.push({ inicio: posicao - obstaculo.width / 2, fim: posicao + obstaculo.width / 2 });
  }

  criarGalhoBaixo(posicao) {
    const galho = this.grupoObstaculos.create(posicao, 0, 'galhoBaixo').setOrigin(0.5, 0).setDepth(2);
    galho.refreshBody();
  }

  criarArvore(posicao) {
    const largura = Phaser.Math.Between(170, 280);
    const centro = posicao + largura / 2;
    this.decoracoes.push(this.add.image(centro, TOPO_CHAO, 'arvoreJogo').setOrigin(0.5, 1).setTint(COR_TRONCO).setDepth(0));
    const galho = this.add.rectangle(centro, ALTURA_PLATAFORMA + 9, largura, 18, COR_SILHUETA).setDepth(2);
    this.grupoPlataformas.add(galho);
    galho.body.checkCollision.down = false;
    galho.body.checkCollision.left = false;
    galho.body.checkCollision.right = false;
    this.criarFlechaColetavel(centro, ALTURA_PLATAFORMA - 28);
  }

  criarFlechaColetavel(x, y) {
    const coletavel = this.grupoColetaveis.create(x, y, 'flechaColetavel').setDepth(3);
    coletavel.alturaBase = y;
  }

  animarColetaveis(tempo) {
    this.grupoColetaveis.getChildren().forEach(coletavel => {
      coletavel.y = coletavel.alturaBase + Math.sin(tempo / 250 + coletavel.x * 0.01) * 5;
    });
  }

  limparForaDaTela() {
    const camera = this.cameras.main;
    const limite = camera.scrollX - 700;
    const passouDoLimite = objeto => objeto.x + objeto.displayWidth < limite;

    [this.grupoChao, this.grupoPlataformas, this.grupoObstaculos, this.grupoColetaveis].forEach(grupo => {
      grupo.getChildren().slice().forEach(objeto => {
        if (passouDoLimite(objeto)) {
          objeto.destroy();
        }
      });
    });
    this.decoracoes = this.decoracoes.filter(objeto => {
      if (passouDoLimite(objeto)) {
        objeto.destroy();
        return false;
      }
      return true;
    });
    this.aguas = this.aguas.filter(({ agua }) => agua.active);
    this.perigosNoChao = this.perigosNoChao.filter(perigo => perigo.fim > limite - 400);

    this.grupoFlechas.getChildren().slice().forEach(flecha => {
      if (flecha.x < camera.scrollX - 100) {
        flecha.destroy();
      }
    });
    this.grupoTiros.getChildren().slice().forEach(tiro => {
      if (tiro.x > camera.scrollX + LARGURA_TELA + 100) {
        tiro.destroy();
      }
    });
  }

  verificarDerrota() {
    if (this.jogador.y > TOPO_CHAO + 50) {
      this.terminar('rio');
      return;
    }
    const alcancado = this.cacadoresVivos().some(cacador => this.distanciaBando + cacador.atraso < DISTANCIA_CAPTURA);
    if (alcancado) {
      this.terminar('cacadores');
    }
  }

  calcularPontos() {
    return this.metros + this.cacadoresDerrubados * PONTOS_POR_CACADOR;
  }

  terminar(motivo) {
    if (this.fimDeJogo) {
      return;
    }
    this.fimDeJogo = true;
    this.physics.pause();
    this.jogador.anims.stop();
    this.cabelo.stop();
    this.cameras.main.shake(220, 0.008);

    if (motivo === 'rio') {
      this.add.particles(this.jogador.x, 492, 'particula', {
        speed: { min: 80, max: 220 },
        angle: { min: 220, max: 320 },
        lifespan: 600,
        gravityY: 600,
        scale: { start: 0.9, end: 0 },
        tint: COR_BRILHO_AGUA,
        emitting: false
      }).setDepth(6).explode(24);
    }

    const pontos = this.calcularPontos();
    const novoRecorde = pontos > this.recorde;
    if (novoRecorde) {
      salvarRecorde(pontos);
    }

    this.time.delayedCall(800, () => {
      this.scene.launch('CenaFimDeJogo', {
        motivo,
        metros: this.metros,
        cacadores: this.cacadoresDerrubados,
        pontos,
        recorde: Math.max(pontos, this.recorde),
        novoRecorde
      });
      this.scene.pause();
    });
  }

  pausar() {
    if (this.fimDeJogo || this.game.getTime() - this.retomadoEm < 300) {
      return;
    }
    this.scene.launch('CenaPausa');
    this.scene.pause();
  }

  criarHud() {
    criarFaixaSuperior(this, 104, 0.45);
    this.coracoes = [0, 1, 2].map(indice => this.add.image(34 + indice * 30, 34, 'coracao').setScrollFactor(0).setDepth(100));
    this.add.image(146, 34, 'flecha').setFlipX(true).setScrollFactor(0).setDepth(100);
    this.textoFlechas = criarTexto(this, 170, 34, '', TAMANHO_CORPO).setOrigin(0, 0.5).setScrollFactor(0).setDepth(100);
    this.textoPontos = criarTexto(this, LARGURA_TELA - 24, 34, '', TAMANHO_CORPO).setOrigin(1, 0.5).setScrollFactor(0).setDepth(100);
    this.textoDetalhes = criarTexto(this, LARGURA_TELA - 24, 64, '', TAMANHO_PEQUENO, TEXTO_SUAVE).setOrigin(1, 0.5).setScrollFactor(0).setDepth(100);
    this.atualizarHud();
  }

  atualizarHud() {
    this.coracoes.forEach((coracao, indice) => {
      const temVida = indice < this.vidas;
      coracao.setTint(temVida ? COR_FOGO : 0xd2c4b6).setAlpha(temVida ? 1 : 0.3);
    });
    this.textoFlechas.setText(String(this.flechas)).setColor(this.flechas > 0 ? TEXTO_PRINCIPAL : TEXTO_SUAVE);

    const pontos = this.calcularPontos();
    const bateuRecorde = this.recorde > 0 && pontos > this.recorde;
    this.textoPontos.setText(textoPontos(pontos)).setColor(bateuRecorde ? TEXTO_DESTAQUE : TEXTO_PRINCIPAL);
    this.textoDetalhes.setText(`${formatarNumero(this.metros)} m  ·  ${textoCacadores(this.cacadoresDerrubados)}`);

    if (bateuRecorde && !this.avisouRecorde) {
      this.avisouRecorde = true;
      this.mostrarTextoFlutuante(this.jogador.x, this.jogador.y - 96, 'Novo recorde', TEXTO_DESTAQUE);
    }
  }

  mostrarDica() {
    const dica = criarTexto(this, LARGURA_TELA / 2, 132, '↑  pular        ↓  deslizar        espaço  atirar', TAMANHO_PEQUENO, TEXTO_SUAVE)
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100);
    this.tweens.add({ targets: dica, alpha: 0, delay: 3500, duration: 800, onComplete: () => dica.destroy() });
  }

  mostrarTextoFlutuante(x, y, conteudo, cor) {
    const texto = criarTexto(this, x, y, conteudo, TAMANHO_PEQUENO, cor).setOrigin(0.5).setDepth(50);
    this.tweens.add({
      targets: texto,
      y: y - 36,
      alpha: 0,
      duration: 900,
      ease: 'Quad.easeOut',
      onComplete: () => texto.destroy()
    });
  }
}
