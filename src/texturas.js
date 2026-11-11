function gerarTextura(cena, chave, largura, altura, desenhar) {
  if (cena.textures.exists(chave)) {
    return;
  }
  const grafico = cena.make.graphics({ x: 0, y: 0, add: false });
  desenhar(grafico);
  grafico.generateTexture(chave, largura, altura);
  grafico.destroy();
}

function desenharLinhas(grafico, pontos, espessura, cor) {
  grafico.lineStyle(espessura, cor, 1);
  grafico.fillStyle(cor, 1);
  for (let i = 0; i < pontos.length - 1; i++) {
    grafico.lineBetween(pontos[i][0], pontos[i][1], pontos[i + 1][0], pontos[i + 1][1]);
  }
  pontos.forEach(ponto => grafico.fillCircle(ponto[0], ponto[1], espessura / 2));
}

function desenharCurupira(grafico, pernas, bracos) {
  grafico.lineStyle(2, COR_SILHUETA, 1);
  grafico.beginPath();
  grafico.arc(22, 31, 15, Phaser.Math.DegToRad(115), Phaser.Math.DegToRad(245));
  grafico.strokePath();
  grafico.lineBetween(16, 45, 16, 17);
  pernas.forEach(perna => desenharLinhas(grafico, perna, 5, COR_SILHUETA));
  desenharLinhas(grafico, [[23, 22], [19, 40]], 9, COR_SILHUETA);
  bracos.forEach(braco => desenharLinhas(grafico, braco, 4, COR_SILHUETA));
  grafico.fillStyle(COR_SILHUETA, 1);
  grafico.fillCircle(25, 13, 8);
}

function desenharCacador(grafico, pernas) {
  pernas.forEach(perna => desenharLinhas(grafico, perna, 6, COR_SILHUETA));
  desenharLinhas(grafico, [[24, 24], [22, 47]], 13, COR_SILHUETA);
  desenharLinhas(grafico, [[17, 33], [47, 28]], 3, COR_SILHUETA);
  desenharLinhas(grafico, [[14, 35], [23, 32]], 6, COR_SILHUETA);
  desenharLinhas(grafico, [[25, 26], [33, 33], [40, 29]], 5, COR_SILHUETA);
  desenharLinhas(grafico, [[22, 27], [27, 35], [32, 32]], 5, COR_SILHUETA);
  grafico.fillStyle(COR_SILHUETA, 1);
  grafico.fillCircle(26, 16, 7);
  grafico.fillRect(14, 9, 24, 3);
  grafico.fillRect(20, 2, 12, 8);
}

function repetirNasBordas(x, desenhar) {
  [x - LARGURA_TELA, x, x + LARGURA_TELA].forEach(desenhar);
}

function alturaDoRelevo(x, base, amplitude, ondas, fase) {
  const angulo = (x / LARGURA_TELA) * Math.PI * 2;
  return base + Math.sin(angulo * ondas + fase) * amplitude;
}

function desenharRelevo(grafico, relevo) {
  const pontos = [];
  for (let x = 0; x <= LARGURA_TELA; x += 8) {
    pontos.push({ x, y: alturaDoRelevo(x, relevo.base, relevo.amplitude, relevo.ondas, relevo.fase) });
  }
  pontos.push({ x: LARGURA_TELA, y: ALTURA_TELA }, { x: 0, y: ALTURA_TELA });
  grafico.fillPoints(pontos, true);
}

function desenharCopas(grafico, relevo, raioMinimo, raioMaximo, espacamento) {
  for (let x = 0; x < LARGURA_TELA; x += espacamento) {
    const raio = Phaser.Math.Between(raioMinimo, raioMaximo);
    const y = alturaDoRelevo(x, relevo.base, relevo.amplitude, relevo.ondas, relevo.fase) + raio * 0.4;
    repetirNasBordas(x, posicao => grafico.fillCircle(posicao, y, raio));
  }
}

function desenharArvore(grafico, x, base, topo, larguraTronco, raioCopa) {
  repetirNasBordas(x, posicao => {
    grafico.fillPoints([
      { x: posicao - larguraTronco * 0.8, y: base },
      { x: posicao - larguraTronco * 0.35, y: topo },
      { x: posicao + larguraTronco * 0.35, y: topo },
      { x: posicao + larguraTronco * 0.8, y: base }
    ], true);
    grafico.lineStyle(Math.max(2, larguraTronco * 0.35), 0xffffff, 1);
    grafico.lineBetween(posicao, topo + raioCopa * 0.5, posicao - raioCopa * 0.8, topo + raioCopa * 0.05);
    grafico.lineBetween(posicao, topo + raioCopa * 0.4, posicao + raioCopa * 0.9, topo);
    grafico.fillEllipse(posicao, topo, raioCopa * 2.6, raioCopa * 0.8);
    grafico.fillEllipse(posicao - raioCopa * 0.9, topo + raioCopa * 0.05, raioCopa * 1.5, raioCopa * 0.6);
    grafico.fillEllipse(posicao + raioCopa * 1.0, topo, raioCopa * 1.4, raioCopa * 0.55);
    grafico.fillEllipse(posicao + raioCopa * 0.2, topo - raioCopa * 0.3, raioCopa * 1.5, raioCopa * 0.6);
  });
}

function desenharPalmeira(grafico, x, base, altura) {
  const pontasDasFolhas = [[1.0, 0.0], [0.9, 0.32], [0.55, 0.55], [0.62, -0.3], [0.2, -0.62]];
  repetirNasBordas(x, posicao => {
    const topoX = posicao + altura * 0.12;
    const topoY = base - altura;
    const comprimento = altura * 0.38;
    const larguraFolha = comprimento * 0.12;
    grafico.lineStyle(Math.max(3, altura * 0.05), 0xffffff, 1);
    grafico.lineBetween(posicao, base, topoX, topoY);
    pontasDasFolhas.forEach(([pontaX, pontaY]) => {
      [-1, 1].forEach(lado => {
        grafico.fillTriangle(
          topoX, topoY - larguraFolha,
          topoX, topoY + larguraFolha,
          topoX + lado * pontaX * comprimento, topoY + pontaY * comprimento
        );
      });
    });
  });
}

function sortearRelevo(base, amplitude, ondas) {
  return { base, amplitude, ondas, fase: Math.random() * Math.PI * 2 };
}

function gerarCamadasFloresta(cena) {
  gerarTextura(cena, 'camadaSerra', LARGURA_TELA, ALTURA_TELA, grafico => {
    grafico.fillStyle(0xffffff, 1);
    desenharRelevo(grafico, sortearRelevo(250, 45, 1));
  });

  gerarTextura(cena, 'camadaMorros', LARGURA_TELA, ALTURA_TELA, grafico => {
    grafico.fillStyle(0xffffff, 1);
    const relevo = sortearRelevo(318, 24, 2);
    desenharRelevo(grafico, relevo);
    desenharCopas(grafico, relevo, 9, 16, 12);
  });

  gerarTextura(cena, 'camadaArvores', LARGURA_TELA, ALTURA_TELA, grafico => {
    grafico.fillStyle(0xffffff, 1);
    const relevo = sortearRelevo(365, 16, 3);
    desenharRelevo(grafico, relevo);
    desenharCopas(grafico, relevo, 16, 28, 20);
    for (let i = 0; i < 4; i++) {
      desenharArvore(grafico, Phaser.Math.Between(0, LARGURA_TELA), 400, Phaser.Math.Between(240, 290), Phaser.Math.Between(6, 9), Phaser.Math.Between(26, 36));
    }
    for (let i = 0; i < 4; i++) {
      desenharPalmeira(grafico, Phaser.Math.Between(0, LARGURA_TELA), 390, Phaser.Math.Between(110, 150));
    }
  });

  gerarTextura(cena, 'camadaMata', LARGURA_TELA, ALTURA_TELA, grafico => {
    grafico.fillStyle(0xffffff, 1);
    const relevo = sortearRelevo(415, 10, 2);
    desenharRelevo(grafico, relevo);
    desenharCopas(grafico, relevo, 26, 42, 32);
    for (let i = 0; i < 3; i++) {
      desenharArvore(grafico, Phaser.Math.Between(0, LARGURA_TELA), 440, Phaser.Math.Between(150, 210), Phaser.Math.Between(14, 20), Phaser.Math.Between(48, 64));
    }
    for (let i = 0; i < 2; i++) {
      desenharPalmeira(grafico, Phaser.Math.Between(0, LARGURA_TELA), 440, Phaser.Math.Between(200, 240));
    }
    for (let x = 0; x < LARGURA_TELA; x += 40) {
      const raio = Phaser.Math.Between(22, 40);
      const y = Phaser.Math.Between(-30, -8);
      repetirNasBordas(x, posicao => grafico.fillCircle(posicao, y, raio));
    }
    for (let i = 0; i < 6; i++) {
      grafico.fillRect(Phaser.Math.Between(0, LARGURA_TELA - 2), 0, 2, Phaser.Math.Between(40, 110));
    }
  });
}

function gerarTexturas(cena) {
  gerarTextura(cena, 'curupira1', 40, 64, grafico => desenharCurupira(grafico,
    [[[19, 40], [27, 50], [26, 61], [19, 62]], [[19, 40], [12, 51], [5, 57], [3, 53]]],
    [[[22, 24], [15, 31], [11, 37]], [[23, 24], [30, 30], [35, 25]]]));

  gerarTextura(cena, 'curupira2', 40, 64, grafico => desenharCurupira(grafico,
    [[[19, 40], [22, 51], [20, 61], [13, 62]], [[19, 40], [25, 47], [18, 53], [12, 52]]],
    [[[22, 24], [19, 33], [21, 39]], [[23, 24], [27, 32], [31, 35]]]));

  gerarTextura(cena, 'curupiraPulo', 40, 64, grafico => desenharCurupira(grafico,
    [[[19, 40], [28, 46], [23, 55], [16, 55]], [[19, 40], [14, 50], [8, 47], [3, 47]]],
    [[[22, 24], [14, 19], [10, 13]], [[23, 24], [31, 21], [35, 15]]]));

  gerarTextura(cena, 'curupiraDeslizando', 56, 30, grafico => {
    desenharLinhas(grafico, [[28, 22], [40, 25], [52, 26], [48, 21]], 5, COR_SILHUETA);
    desenharLinhas(grafico, [[28, 22], [37, 16], [45, 22], [40, 22]], 5, COR_SILHUETA);
    desenharLinhas(grafico, [[14, 14], [28, 22]], 8, COR_SILHUETA);
    desenharLinhas(grafico, [[16, 15], [9, 22], [5, 28]], 4, COR_SILHUETA);
    grafico.fillStyle(COR_SILHUETA, 1);
    grafico.fillCircle(10, 9, 7);
  });

  gerarTextura(cena, 'cacador1', 50, 78, grafico => desenharCacador(grafico,
    [[[22, 47], [31, 61], [30, 76], [36, 76]], [[22, 47], [14, 61], [7, 70], [11, 74]]]));

  gerarTextura(cena, 'cacador2', 50, 78, grafico => desenharCacador(grafico,
    [[[22, 47], [25, 62], [22, 76], [28, 76]], [[22, 47], [30, 58], [22, 66], [26, 69]]]));

  gerarTextura(cena, 'pedra', 54, 40, grafico => {
    grafico.fillStyle(COR_SILHUETA, 1);
    grafico.fillPoints([
      { x: 3, y: 40 }, { x: 0, y: 28 }, { x: 8, y: 14 }, { x: 20, y: 5 },
      { x: 35, y: 2 }, { x: 47, y: 10 }, { x: 54, y: 25 }, { x: 51, y: 40 }
    ], true);
  });

  gerarTextura(cena, 'tronco', 86, 32, grafico => {
    grafico.fillStyle(COR_SILHUETA, 1);
    grafico.fillRoundedRect(0, 8, 86, 24, 11);
    desenharLinhas(grafico, [[60, 12], [70, 2]], 4, COR_SILHUETA);
  });

  gerarTextura(cena, 'galhoBaixo', 84, BASE_GALHO, grafico => {
    grafico.lineStyle(5, COR_SILHUETA, 1);
    grafico.lineBetween(40, 0, 44, BASE_GALHO * 0.5);
    grafico.lineBetween(44, BASE_GALHO * 0.5, 40, BASE_GALHO - 36);
    grafico.fillStyle(COR_SILHUETA, 1);
    grafico.fillEllipse(50, BASE_GALHO * 0.3, 16, 7);
    grafico.fillEllipse(35, BASE_GALHO * 0.62, 16, 7);
    [[20, -26, 18], [42, -34, 24], [64, -26, 18], [30, -14, 14], [54, -14, 14], [42, -18, 18]]
      .forEach(([x, y, raio]) => grafico.fillCircle(x, BASE_GALHO + y, raio));
  });

  gerarTextura(cena, 'arvoreJogo', 320, TOPO_CHAO - 130, grafico => {
    grafico.fillStyle(0xffffff, 1);
    desenharArvore(grafico, 160, TOPO_CHAO - 130, 70, 22, 60);
  });

  gerarTextura(cena, 'coracao', 20, 18, grafico => {
    grafico.fillStyle(0xffffff, 1);
    grafico.fillCircle(5.5, 5.5, 5.5);
    grafico.fillCircle(14.5, 5.5, 5.5);
    grafico.fillTriangle(0.4, 7.5, 19.6, 7.5, 10, 18);
  });

  gerarTextura(cena, 'flechaColetavel', 34, 34, grafico => {
    grafico.fillStyle(COR_DOURADO, 0.22);
    grafico.fillCircle(17, 17, 17);
    grafico.fillStyle(COR_DOURADO, 0.35);
    grafico.fillCircle(17, 17, 11);
    grafico.lineStyle(2, 0xfff0c2, 1);
    grafico.lineBetween(17, 30, 17, 7);
    grafico.fillStyle(0xfff0c2, 1);
    grafico.fillTriangle(13, 10, 21, 10, 17, 2);
    grafico.lineStyle(2, COR_FOGO, 1);
    grafico.lineBetween(17, 25, 13, 31);
    grafico.lineBetween(17, 25, 21, 31);
  });

  gerarTextura(cena, 'flecha', 32, 8, grafico => {
    grafico.lineStyle(2, 0xfff0c2, 1);
    grafico.lineBetween(6, 4, 30, 4);
    grafico.fillStyle(0xfff0c2, 1);
    grafico.fillTriangle(0, 4, 8, 0, 8, 8);
    grafico.lineStyle(2, COR_FOGO, 1);
    grafico.lineBetween(25, 4, 31, 0);
    grafico.lineBetween(25, 4, 31, 8);
  });

  gerarTextura(cena, 'tiro', 22, 6, grafico => {
    grafico.fillStyle(0xffffff, 0.35);
    grafico.fillRoundedRect(0, 0, 22, 6, 3);
    grafico.fillStyle(0xffffff, 1);
    grafico.fillRoundedRect(9, 1.5, 13, 3, 1.5);
  });

  gerarTextura(cena, 'brilho', 28, 28, grafico => {
    grafico.fillStyle(0xffffff, 0.25);
    grafico.fillCircle(14, 14, 14);
    grafico.fillStyle(0xffffff, 0.6);
    grafico.fillCircle(14, 14, 8);
    grafico.fillStyle(0xffffff, 1);
    grafico.fillCircle(14, 14, 3);
  });

  gerarTextura(cena, 'halo', 256, 256, grafico => {
    for (let raio = 128; raio > 0; raio -= 4) {
      grafico.fillStyle(0xffffff, 0.035);
      grafico.fillCircle(128, 128, raio);
    }
  });

  gerarTextura(cena, 'particula', 8, 8, grafico => {
    grafico.fillStyle(0xffffff, 1);
    grafico.fillCircle(4, 4, 4);
  });

  gerarTextura(cena, 'grama', 64, 14, grafico => {
    grafico.fillStyle(COR_SILHUETA, 1);
    grafico.fillRect(0, 12, 64, 2);
    for (let x = 0; x < 64; x += 4) {
      const altura = 3 + ((x * 7) % 9);
      grafico.fillTriangle(x, 14, x + 2, 14 - altura, x + 4, 14);
    }
  });

  gerarCamadasFloresta(cena);
}

function criarAnimacoes(cena) {
  if (!cena.anims.exists('correr')) {
    cena.anims.create({ key: 'correr', frames: [{ key: 'curupira1' }, { key: 'curupira2' }], frameRate: 10, repeat: -1 });
  }
  if (!cena.anims.exists('cacadorCorrer')) {
    cena.anims.create({ key: 'cacadorCorrer', frames: [{ key: 'cacador1' }, { key: 'cacador2' }], frameRate: 8, repeat: -1 });
  }
}

function criarCabelo(cena) {
  return cena.add.particles(0, 0, 'particula', {
    lifespan: { min: 220, max: 420 },
    speed: { min: 20, max: 60 },
    angle: { min: 225, max: 300 },
    accelerationX: -420,
    gravityY: -180,
    scale: { start: 1.3, end: 0.2 },
    alpha: { start: 1, end: 0 },
    color: [0xf0573a, 0xe63926, 0xe63926, 0xb52a1c],
    frequency: 12
  }).setDepth(5);
}
