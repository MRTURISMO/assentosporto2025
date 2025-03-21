// Função para enviar dados para o Google Sheets
function enviarParaGoogleSheets(dados) {
    return fetch('https://script.google.com/macros/s/AKfycbzYaD9ghAja3BsPUZCMPBqaUoqCDNRU050n3-gdzDx8MG5oDAL6HMAWYhs_pYmA5QD_/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao conectar ao servidor');
        }
        return response.json();
    });
}

// Função para reservar um assento
function reservarAssento(event) {
    event.preventDefault();

    const nome = document.getElementById('nome').value;
    const cpf = document.getElementById('cpf').value;
    const escola = document.getElementById('escola').value;
    const assentoSelecionado = document.getElementById('assento').value;

    if (!validarCPF(cpf)) {
        mostrarMensagem('CPF inválido. Por favor, insira um CPF válido.', false);
        return;
    }

    if (reservasPorCPF[cpf]) {
        mostrarMensagem(`Esse CPF já possui um assento reservado: ${reservasPorCPF[cpf]}`, false);
        return;
    }

    if (!assentos[assentoSelecionado] || !assentoSelecionado) {
        mostrarMensagem('Esse assento não existe ou já está reservado.', false);
        return;
    }

    assentos[assentoSelecionado] = false;
    reservasPorCPF[cpf] = assentoSelecionado;

    const dados = { nome, cpf, escola, assento: assentoSelecionado };

    enviarParaGoogleSheets(dados)
        .then(data => {
            if (data.result === 'success') {
                mostrarMensagem('Reserva feita com sucesso!', true);
                atualizarAssentos();
            } else {
                throw new Error(data.message || 'Erro desconhecido.');
            }
        })
        .catch(error => {
            console.error('Erro ao enviar dados para o Google Sheets:', error);
            mostrarMensagem('Erro ao enviar os dados. Tente novamente.', false);
        });

    document.getElementById('reserva-form').reset();
}

// Função para liberar assento
function liberarAssento() {
    const cpf = document.getElementById('cpf').value;

    if (!reservasPorCPF[cpf]) {
        mostrarMensagem('Nenhuma reserva encontrada para esse CPF.', false);
        return;
    }

    const assentoAnterior = reservasPorCPF[cpf];
    assentos[assentoAnterior] = true;
    delete reservasPorCPF[cpf];

    const dados = { cpf, assento: assentoAnterior, status: 'Disponível' };

    enviarParaGoogleSheets(dados)
        .then(data => {
            if (data.result === 'success') {
                mostrarMensagem(`Assento ${assentoAnterior} foi liberado. Agora você pode selecionar um novo assento.`, true);
                atualizarAssentos();
            } else {
                throw new Error(data.message || 'Erro desconhecido.');
            }
        })
        .catch(error => {
            console.error('Erro ao liberar o assento:', error);
            mostrarMensagem('Erro ao liberar o assento. Tente novamente.', false);
        });

    document.getElementById('mudar-assento-btn').style.display = 'none';
}
