const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const carroImg = new Image();
carroImg.src = 'carro.png'; // seu carro

const startButton = document.getElementById('startButton');
const resetButton = document.getElementById('resetButton');
const velocidadeSpan = document.getElementById('velocidade');
const distanciaSpan = document.getElementById('distancia');
const tempoSpan = document.getElementById('tempo');
const velocidadeMediaSpan = document.getElementById('velocidadeMedia');
const velocidadeBtns = document.querySelectorAll('.velocidade-btn');
const velocidadeRealistaBtn = document.getElementById('velocidadeRealista');

const somFundo = document.getElementById('somFundo');
const somChegada = document.getElementById('somChegada');

// Configurações do jogo
let carro = {
  x: 20, // Posição inicial ajustada para ficar após o "Ponto A"
  y: 305, // Y ajustado para alinhar corretamente o carro na pista
  largura: 100, // Tamanho aumentado para melhor visibilidade
  altura: 50,
  velocidadeKmH: 10, // km/h
  velocidade: (10 * 1000) / 3600, // convertido para m/s
  distancia: 0,
  modoRealista: false,
  aceleracao: 2, // km/h por segundo (para modo realista)
  velocidadeMaximaKmH: 100 // velocidade máxima no modo realista
};

let linhaChegadaX = 900;
let corridaAtiva = false;
let animationId;
let tempo = 0;
let tempoInicial = 0;
let ultimoTimestamp = 0;

// DESENHO DA PISTA E CENÁRIO
function desenharPista() {
  // Limpar o canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Céu (gradiente para ficar mais bonito)
  const gradienteCeu = ctx.createLinearGradient(0, 0, 0, 250);
  gradienteCeu.addColorStop(0, '#1e90ff');
  gradienteCeu.addColorStop(1, '#87CEEB');
  ctx.fillStyle = gradienteCeu;
  ctx.fillRect(0, 0, canvas.width, 250);

  // Desenhar nuvens decorativas
  ctx.fillStyle = '#FFFFFF';
  
  // Nuvem 1
  ctx.beginPath();
  ctx.arc(100, 80, 20, 0, Math.PI * 2);
  ctx.arc(120, 70, 20, 0, Math.PI * 2);
  ctx.arc(140, 80, 20, 0, Math.PI * 2);
  ctx.fill();
  
  // Nuvem 2
  ctx.beginPath();
  ctx.arc(400, 50, 25, 0, Math.PI * 2);
  ctx.arc(430, 40, 20, 0, Math.PI * 2);
  ctx.arc(460, 50, 25, 0, Math.PI * 2);
  ctx.fill();
  
  // Nuvem 3
  ctx.beginPath();
  ctx.arc(700, 100, 20, 0, Math.PI * 2);
  ctx.arc(730, 90, 25, 0, Math.PI * 2);
  ctx.arc(760, 100, 20, 0, Math.PI * 2);
  ctx.fill();

  // Grama (gradiente para ficar mais bonito)
  const gradienteGrama = ctx.createLinearGradient(0, 250, 0, 300);
  gradienteGrama.addColorStop(0, '#7CFC00');
  gradienteGrama.addColorStop(1, '#32CD32');
  ctx.fillStyle = gradienteGrama;
  ctx.fillRect(0, 250, canvas.width, 50);

  // Estrada
  ctx.fillStyle = '#555';
  ctx.fillRect(0, 300, canvas.width, 60);

  // Faixas da estrada
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 5;
  for (let i = 0; i < canvas.width; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, 330);
    ctx.lineTo(i + 20, 330);
    ctx.stroke();
  }

  // Linha de chegada
  const linhaChegadaPattern = ctx.createPattern(criarPadraoLinhaChegada(), 'repeat');
  ctx.fillStyle = linhaChegadaPattern;
  ctx.fillRect(linhaChegadaX, 300, 10, 60);

  // Texto Ponto A e Ponto B
  ctx.fillStyle = 'blue';
  ctx.font = 'bold 24px Arial Rounded MT Bold, Arial, sans-serif'; // Fonte maior e mais amigável
  ctx.fillText('Ponto A', 10, 295);
  ctx.fillText('Ponto B', linhaChegadaX - 40, 295);
  
  // Marcações de distância
  for (let i = 100; i < linhaChegadaX; i += 100) {
    ctx.fillStyle = 'black';
    ctx.font = '18px Arial Rounded MT Bold, Arial, sans-serif'; // Fonte maior
    ctx.fillText(`${i}m`, i, 290);
    
    // Marcador
    ctx.beginPath();
    ctx.moveTo(i, 295);
    ctx.lineTo(i, 300);
    ctx.stroke();
  }
}

// Função para criar um padrão de linha de chegada (quadriculado)
function criarPadraoLinhaChegada() {
  const patternCanvas = document.createElement('canvas');
  const patternContext = patternCanvas.getContext('2d');
  
  patternCanvas.width = 10;
  patternCanvas.height = 10;
  
  // Desenhar o padrão quadriculado
  patternContext.fillStyle = 'black';
  patternContext.fillRect(0, 0, 5, 5);
  patternContext.fillRect(5, 5, 5, 5);
  patternContext.fillStyle = 'white';
  patternContext.fillRect(0, 5, 5, 5);
  patternContext.fillRect(5, 0, 5, 5);
  
  return patternCanvas;
}

function desenharCarro() {
  if (carroImg) {
    ctx.drawImage(carroImg, carro.x, carro.y, carro.largura, carro.altura);
    
    // Adicionar uma borda ao redor do carro para destacá-lo melhor
    ctx.strokeStyle = '#FF4500';
    ctx.lineWidth = 2;
    ctx.strokeRect(carro.x, carro.y, carro.largura, carro.altura);
  } else {
    // Backup caso a imagem não carregue
    ctx.fillStyle = 'purple';
    ctx.fillRect(carro.x, carro.y, carro.largura, carro.altura);
    
    // Adicionar detalhes visuais para o carro de backup
    ctx.fillStyle = 'black';
    ctx.fillRect(carro.x + carro.largura - 20, carro.y + 10, 15, 15); // Janela
    ctx.fillRect(carro.x + carro.largura - 70, carro.y + 10, 40, 15); // Janela
    
    // Rodas
    ctx.fillStyle = 'black';
    ctx.fillRect(carro.x + 15, carro.y + carro.altura - 10, 20, 10);
    ctx.fillRect(carro.x + carro.largura - 35, carro.y + carro.altura - 10, 20, 10);
  }
}

function calcularVelocidadeMedia() {
  if (tempo > 0) {
    return (carro.distancia / tempo * 3.6).toFixed(1); // Convertendo para km/h
  }
  return "0";
}

function atualizar(timestamp) {
  if (!corridaAtiva) return;
  
  if (!tempoInicial) {
    tempoInicial = timestamp;
    ultimoTimestamp = timestamp;
  }
  
  const deltaTime = (timestamp - ultimoTimestamp) / 1000; // Tempo desde o último frame em segundos
  ultimoTimestamp = timestamp;
  
  tempo = (timestamp - tempoInicial) / 1000;
  
  // Atualizar velocidade no modo realista
  if (carro.modoRealista) {
    carro.velocidadeKmH = Math.min(carro.velocidadeKmH + carro.aceleracao * deltaTime, carro.velocidadeMaximaKmH);
    carro.velocidade = (carro.velocidadeKmH * 1000) / 3600; // Converter para m/s
  }
  
  // Atualizar posição e distância
  const distanciaPercorrida = carro.velocidade * deltaTime;
  carro.x += distanciaPercorrida * 60; // Fator de escala para visualização
  carro.distancia += distanciaPercorrida;
  
  // Atualizar informações na tela
  velocidadeSpan.textContent = carro.velocidadeKmH.toFixed(1);
  distanciaSpan.textContent = carro.distancia.toFixed(1);
  tempoSpan.textContent = tempo.toFixed(1);
  velocidadeMediaSpan.textContent = calcularVelocidadeMedia();
  
  // Verificar se chegou ao final
  if (carro.x + carro.largura >= linhaChegadaX) {
    corridaAtiva = false;
    startButton.disabled = false;
    resetButton.disabled = false;
    somFundo.pause();
    somChegada.play();
    
    // Adicionar alguma animação ou efeito de chegada
    destacarInfo();
  }
  
  desenhar();
  
  if (corridaAtiva) {
    animationId = requestAnimationFrame(atualizar);
  }
}

function destacarInfo() {
  const infoItems = document.querySelectorAll('.info-item');
  infoItems.forEach(item => {
    item.style.backgroundColor = '#FFEB3B';
    setTimeout(() => {
      item.style.backgroundColor = 'white';
    }, 1000);
  });
}

function desenhar() {
  desenharPista();
  desenharCarro();
}

function resetarJogo() {
  cancelAnimationFrame(animationId);
  carro.x = 20;
  carro.distancia = 0;
  tempo = 0;
  tempoInicial = 0;
  ultimoTimestamp = 0;
  velocidadeSpan.textContent = "0";
  distanciaSpan.textContent = "0";
  tempoSpan.textContent = "0";
  velocidadeMediaSpan.textContent = "0";
  corridaAtiva = false;
  startButton.disabled = false;
  resetButton.disabled = false;
  somFundo.pause();
  somFundo.currentTime = 0;
  desenhar();
}

// Configurar botões de velocidade
velocidadeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const velocidade = parseFloat(btn.getAttribute('data-velocidade'));
    carro.velocidadeKmH = velocidade;
    carro.velocidade = (velocidade * 1000) / 3600; // Converter para m/s
    carro.modoRealista = false;
    
    // Remover classe ativa de todos os botões
    velocidadeBtns.forEach(b => b.classList.remove('active'));
    velocidadeRealistaBtn.classList.remove('active');
    
    // Adicionar classe ativa ao botão clicado
    btn.classList.add('active');
    
    velocidadeSpan.textContent = velocidade.toFixed(1);
  });
});

// Configurar botão de velocidade realista
velocidadeRealistaBtn.addEventListener('click', () => {
  carro.velocidadeKmH = 0; // Começar do zero
  carro.velocidade = 0;
  carro.modoRealista = true;
  
  // Remover classe ativa de todos os botões
  velocidadeBtns.forEach(btn => btn.classList.remove('active'));
  
  // Adicionar classe ativa ao botão de velocidade realista
  velocidadeRealistaBtn.classList.add('active');
  
  velocidadeSpan.textContent = "0";
});

// Iniciar corrida
startButton.addEventListener('click', () => {
  if (corridaAtiva) return;
  
  corridaAtiva = true;
  startButton.disabled = true;
  resetButton.disabled = true;
  
  // Tentar reproduzir o áudio
  try {
    somFundo.currentTime = 0;
    somFundo.play().catch(error => {
      console.log('Não foi possível reproduzir o áudio:', error);
    });
  } catch (error) {
    console.log('Erro ao tentar reproduzir o áudio:', error);
  }
  
  requestAnimationFrame(atualizar);
});

// Resetar jogo
resetButton.addEventListener('click', resetarJogo);

// Para garantir que o carro seja exibido mesmo se houver problema com a imagem
carroImg.onerror = function() {
  console.error("Erro ao carregar a imagem do carro");
  carroImg = null;
  desenhar();
};

carroImg.onload = () => {
  desenhar();
};

// Configurar manipulação de sons
document.addEventListener('DOMContentLoaded', () => {
  // Pre-load dos sons para evitar problemas
  try {
    somFundo.load();
    somChegada.load();
  } catch (error) {
    console.log('Erro ao carregar áudios:', error);
  }
});

// Iniciar a visualização
resetarJogo();

// Adicionar explicações sobre conceitos físicos
function mostrarExplicacao(titulo, texto) {
  // Remover explicação anterior se existir
  const explicacaoExistente = document.querySelector('.explicacao');
  if (explicacaoExistente) {
    document.body.removeChild(explicacaoExistente);
  }
  
  // Criar novo elemento de explicação
  const explicacao = document.createElement('div');
  explicacao.className = 'explicacao';
  
  explicacao.innerHTML = `
    <h3>${titulo}</h3>
    <p>${texto}</p>
    <button id="fecharExplicacao">Entendi!</button>
  `;
  
  document.body.appendChild(explicacao);
  
  // Adicionar evento para fechar
  document.getElementById('fecharExplicacao').addEventListener('click', () => {
    document.body.removeChild(explicacao);
  });
}