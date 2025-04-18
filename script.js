// script.js

let canvas, ctx;
let carro = { x: 50, y: 280, largura: 60, altura: 30, velocidade: 0 };
let corridaIniciada = false;
let efeitos = [];

let somFundo;
let somChegada;

let tempoInicio;
let tempoFinal;

const distanciaTotal = 800;
let distanciaPercorrida = 0;

window.addEventListener('DOMContentLoaded', () => {
    somFundo = document.getElementById('somFundo');
    somChegada = document.getElementById('somChegada');

    document.getElementById('btn-comecar').addEventListener('click', () => {
        document.getElementById('tela-inicial').style.display = 'none';
        document.getElementById('tela-jogo').style.display = 'flex';
        iniciar();
    });

    document.getElementById('btn-iniciar').addEventListener('click', () => {
        if (!corridaIniciada) {
            corridaIniciada = true;
            carro.velocidade = 2;
            somFundo.currentTime = 0;
            somFundo.play();
            tempoInicio = performance.now();
            distanciaPercorrida = 0;
        }
    });
});

function iniciar() {
    canvas = document.getElementById('pista');
    ctx = canvas.getContext('2d');
    requestAnimationFrame(atualizar);
}

function atualizar() {
    desenharCenario();
    desenharCarro();
    atualizarCarro();
    desenharEfeitos();
    desenharHUD();
    requestAnimationFrame(atualizar);
}

function desenharCenario() {
    ctx.fillStyle = '#87CEFA';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#32CD32';
    ctx.fillRect(0, 250, canvas.width, 50);
    ctx.fillRect(0, 350, canvas.width, 50);

    ctx.fillStyle = 'gray';
    ctx.fillRect(0, 300, canvas.width, 50);

    ctx.fillStyle = 'white';
    for (let i = 0; i < canvas.width; i += 60) {
        ctx.fillRect(i, 323, 30, 4);
    }

    ctx.fillStyle = 'red';
    ctx.fillRect(canvas.width - 10, 300, 10, 50);

    desenharNuvem(100, 80);
    desenharNuvem(400, 50);
    desenharNuvem(650, 90);
}

function desenharNuvem(x, y) {
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.arc(x + 25, y + 10, 20, 0, Math.PI * 2);
    ctx.arc(x - 25, y + 10, 20, 0, Math.PI * 2);
    ctx.fill();
}

function desenharCarro() {
    // Corpo principal
    ctx.fillStyle = '#FF4500'; // Laranja vibrante
    ctx.fillRect(carro.x, carro.y, carro.largura, carro.altura);

    // Capô do carro
    ctx.fillStyle = '#FFD700'; // Amarelo
    ctx.fillRect(carro.x + 10, carro.y - 15, carro.largura - 20, 15);

    // Janelas
    ctx.fillStyle = '#87CEFA'; // Azul claro
    ctx.fillRect(carro.x + 15, carro.y - 10, 10, 10);
    ctx.fillRect(carro.x + 35, carro.y - 10, 10, 10);

    // Rodas
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(carro.x + 10, carro.y + carro.altura + 5, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(carro.x + carro.largura - 10, carro.y + carro.altura + 5, 7, 0, Math.PI * 2);
    ctx.fill();
}

function atualizarCarro() {
    if (corridaIniciada) {
        carro.x += carro.velocidade;

        distanciaPercorrida = Math.min(((carro.x - 50) / (canvas.width - 60)) * distanciaTotal, distanciaTotal);

        if (carro.x + carro.largura >= canvas.width - 10) {
            corridaIniciada = false;
            carro.velocidade = 0;

            somFundo.pause();
            somFundo.currentTime = 0;

            // Som de chegada
            somChegada.currentTime = 0;
            somChegada.play();

            tempoFinal = performance.now();
            dispararEfeitos();

            // Esperar 2 segundos para música tocar antes do alerta
            setTimeout(mostrarResultados, 2000);
        }
    }
}

function desenharEfeitos() {
    for (let i = 0; i < efeitos.length; i++) {
        let e = efeitos[i];
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.raio, 0, Math.PI * 2);
        ctx.fillStyle = e.cor;
        ctx.fill();
        e.x += e.vx;
        e.y += e.vy;
        e.raio *= 0.96;
    }
    efeitos = efeitos.filter(e => e.raio > 0.5);
}

function dispararEfeitos() {
    for (let i = 0; i < 30; i++) {
        efeitos.push({
            x: carro.x + carro.largura / 2,
            y: carro.y,
            raio: Math.random() * 5 + 2,
            cor: `hsl(${Math.random() * 360}, 100%, 50%)`,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 1) * 4
        });
    }
}

function desenharHUD() {
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    if (corridaIniciada) {
        let tempoAtual = ((performance.now() - tempoInicio) / 1000).toFixed(2);
        let velocidadeAtual = (distanciaPercorrida / tempoAtual).toFixed(2);

        ctx.fillText(`Tempo: ${tempoAtual}s`, 20, 30);
        ctx.fillText(`Distância: ${distanciaPercorrida.toFixed(0)}m`, 20, 60);
        ctx.fillText(`Velocidade: ${velocidadeAtual} m/s`, 20, 90);
    }
}

function mostrarResultados() {
    let tempoGasto = ((tempoFinal - tempoInicio) / 1000).toFixed(2);
    let velocidadeMedia = (distanciaTotal / tempoGasto).toFixed(2);

    setTimeout(() => {
        alert(`Parabéns!\n\nTempo total: ${tempoGasto} segundos\nDistância: ${distanciaTotal} metros\nVelocidade média: ${velocidadeMedia} m/s\n\nEm Física, usamos a fórmula:\nVelocidade = Distância ÷ Tempo\nPara calcular a velocidade média!`);
    }, 500);
}