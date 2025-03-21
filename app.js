// Função para reservar um assento
function reservarAssento(event) {
    event.preventDefault(); // Evita o envio do formulário

    const nome = document.getElementById('nome').value;
    const cpf = document.getElementById('cpf').value;
    const escola = document.getElementById('escola').value;
    const assentoSelecionado = document.getElementById('assento').value;

    // Validação de CPF
    if (!validarCPF(cpf)) {
        mostrarMensagem('CPF inválido. Por favor, insira um CPF no formato XXX.XXX.XXX-XX.', false);
        return;
    }

    // Verifica se o CPF já possui uma reserva
    if (reservasPorCPF[cpf]) {
        mostrarMensagem('Esse CPF já possui um assento reservado: ' + reservasPorCPF[cpf], false);
        return;
    }

    if (assentos[assentoSelecionado] && assentoSelecionado) {
        // Reserva o assento
        assentos[assentoSelecionado] = false;
        reservasPorCPF[cpf] = assentoSelecionado;

        // Adiciona a reserva à tabela
        const tabelaReservas = document.getElementById('tabela-reservas').querySelector('tbody');
        const novaLinha = tabelaReservas.insertRow();
        novaLinha.insertCell(0).textContent = nome;
        novaLinha.insertCell(1).textContent = escola;
        novaLinha.insertCell(2).textContent = assentoSelecionado;

        // Dados para enviar ao Google Sheets
        const dados = { nome, cpf, escola, assento: assentoSelecionado };

        fetch('https://script.google.com/macros/s/AKfycbyWnehIW_eALyt9QQat8qOoV_6TSKZuzhRtI1c2ypY/dev', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        })
        .then(response => response.text())
        .then(() => {
            mostrarMensagem('Reserva feita com sucesso!', true);
            document.getElementById('mudar-assento-btn').style.display = 'block';
        })
        .catch(error => {
            console.error('Erro ao enviar dados para o Google Sheets:', error);
            mostrarMensagem('Erro ao enviar dados para o Google Sheets', false);
        });

        document.getElementById('reserva-form').reset();
        atualizarAssentos();
    } else {
        mostrarMensagem('Esse assento já está reservado ou não existe.', false);
    }
}

// Função para permitir que o cliente mude o assento
function mudarAssento() {
    const cpf = document.getElementById('cpf').value;

    if (reservasPorCPF[cpf]) {
        const assentoAnterior = reservasPorCPF[cpf];
        assentos[assentoAnterior] = true;
        delete reservasPorCPF[cpf];

        atualizarAssentos();

        const dados = { cpf, assento: assentoAnterior, status: 'Disponível' };

        fetch('https://script.google.com/macros/s/AKfycbyWnehIW_eALyt9QQat8qOoV_6TSKZuzhRtI1c2ypY/dev', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        })
        .then(response => response.text())
        .then(() => {
            mostrarMensagem(`Assento ${assentoAnterior} foi liberado. Agora você pode selecionar um novo assento.`, true);
        })
        .catch(error => {
            console.error('Erro ao enviar a liberação para o Google Sheets:', error);
            mostrarMensagem('Erro ao liberar o assento.', false);
        });

        document.getElementById('mudar-assento-btn').style.display = 'none';
    } else {
        mostrarMensagem('Não há reserva registrada para esse CPF.', false);
    }
}
