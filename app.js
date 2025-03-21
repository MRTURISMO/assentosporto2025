// Função para buscar reservas existentes no Google Sheets ao carregar a página
function carregarReservas() {
    console.log("Carregando reservas...");
    fetch('https://script.google.com/macros/s/AKfycbzYaD9ghAja3BsPUZCMPBqaUoqCDNRU050n3-gdzDx8MG5oDAL6HMAWYhs_pYmA5QD_/exec')
        .then(response => response.json())
        .then(data => {
            if (data.result === 'success') {
                console.log("Reservas carregadas:", data.reservas);
                data.reservas.forEach(reserva => {
                    assentos[reserva.assento] = false;
                    reservasPorCPF[reserva.cpf] = reserva.assento;
                });
                atualizarAssentos();
            }
        })
        .catch(error => console.error('Erro ao carregar reservas:', error));
}

// Função para enviar dados para o Google Sheets
function enviarParaGoogleSheets(dados) {
    console.log("Enviando para Google Sheets:", dados);
    return fetch('https://script.google.com/macros/s/AKfycbzYaD9ghAja3BsPUZCMPBqaUoqCDNRU050n3-gdzDx8MG5oDAL6HMAWYhs_pYmA5QD_/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    })
    .then(response => {
        console.log("Resposta recebida:", response);
        if (!response.ok) {
            throw new Error('Erro ao conectar ao servidor');
        }
        return response.json();
    });
}

// Função para reservar um assento
function reservarAssento(event) {
    event.preventDefault();
    console.log("Iniciando reserva...");

    const nome = document.getElementById('nome').value.trim();
    const cpf = document.getElementById('cpf').value.trim();
    const escola = document.getElementById('escola').value;
    const assentoSelecionado = document.getElementById('assento').value;

    console.log("Dados inseridos:", { nome, cpf, escola, assentoSelecionado });

    if (!nome || !cpf || !escola || !assentoSelecionado) {
        mostrarMensagem('Todos os campos são obrigatórios.', false);
        return;
    }

    if (!validarCPF(cpf)) {
        mostrarMensagem('CPF inválido. Por favor, insira um CPF válido.', false);
        return;
    }

    if (reservasPorCPF[cpf]) {
        mostrarMensagem(`Esse CPF já possui um assento reservado: ${reservasPorCPF[cpf]}`, false);
        return;
    }

    if (!assentos[assentoSelecionado]) {
        mostrarMensagem('Esse assento não existe ou já está reservado.', false);
        return;
    }

    console.log("Reserva válida, prosseguindo com envio...");
    assentos[assentoSelecionado] = false;
    reservasPorCPF[cpf] = assentoSelecionado;

    const dados = { nome, cpf, escola, assento: assentoSelecionado };

    enviarParaGoogleSheets(dados)
        .then(data => {
            console.log("Resposta do servidor:", data);
            if (data.result === 'success') {
                mostrarMensagem('Reserva feita com sucesso!', true);
                atualizarAssentos();
                document.getElementById('reserva-form').reset();
            } else {
                throw new Error(data.message || 'Erro desconhecido.');
            }
        })
        .catch(error => {
            console.error('Erro ao enviar dados para o Google Sheets:', error);
            mostrarMensagem('Erro ao enviar os dados. Tente novamente.', false);
        });
}

// Adicionando event listener ao formulário para garantir que a função seja chamada corretamente
document.getElementById("reserva-form").addEventListener("submit", reservarAssento);

// Carregar reservas ao iniciar
carregarReservas();
