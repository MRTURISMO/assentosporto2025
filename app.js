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

        // Armazena a reserva relacionada ao CPF
        reservasPorCPF[cpf] = assentoSelecionado;

        // Adiciona a reserva à tabela
        const tabelaReservas = document.getElementById('tabela-reservas').querySelector('tbody');
        const novaLinha = tabelaReservas.insertRow();
        const nomeCell = novaLinha.insertCell(0);
        nomeCell.textContent = nome;
        const escolaCell = novaLinha.insertCell(1);
        escolaCell.textContent = escola;
        const assentoCell = novaLinha.insertCell(2);
        assentoCell.textContent = assentoSelecionado;

        // Dados para enviar ao Google Sheets
        const dados = {
            nome: nome,
            cpf: cpf,
            escola: escola,
            assento: assentoSelecionado
        };

        fetch('https://script.google.com/macros/s/AKfycbyZD-2tpaI8okb4wS8__zTJRRLECLRGsLNbfBOWS5gXOhbeq52zsFn1L_fgVdOf6jtP/exec', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        })
        .then(response => response.text())
        .then(data => {
            mostrarMensagem('Reserva feita com sucesso!', true);
            // Exibe o botão para mudar o assento
            document.getElementById('mudar-assento-btn').style.display = 'block';
        })
        .catch(error => {
            console.error('Erro ao enviar dados para o Google Sheets:', error);
            mostrarMensagem('Erro ao enviar dados para o Google Sheets', false);
        });

        // Limpa o formulário
        document.getElementById('reserva-form').reset();
        atualizarAssentos(); // Atualiza a lista de assentos
    } else {
        mostrarMensagem('Esse assento já está reservado ou não existe.', false);
    }
}

// Função para permitir que o cliente mude o assento
function mudarAssento() {
    const cpf = document.getElementById('cpf').value;

    // Verifica se o CPF está registrado
    if (reservasPorCPF[cpf]) {
        // Libera o assento anteriormente reservado
        const assentoAnterior = reservasPorCPF[cpf];
        assentos[assentoAnterior] = true;

        // Remove a reserva do CPF
        delete reservasPorCPF[cpf];

        // Atualiza a lista de assentos
        atualizarAssentos();

        // Envia a liberação de assento para o Google Sheets
        const dados = {
            cpf: cpf,
            assento: assentoAnterior,
            status: 'Disponível'
        };

        fetch('https://script.google.com/macros/s/AKfycbyZD-2tpaI8okb4wS8__zTJRRLECLRGsLNbfBOWS5gXOhbeq52zsFn1L_fgVdOf6jtP/exec', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        })
        .then(response => response.text())
        .then(data => {
            mostrarMensagem(`Assento ${assentoAnterior} foi liberado. Agora você pode selecionar um novo assento.`, true);
        })
        .catch(error => {
            console.error('Erro ao enviar a liberação para o Google Sheets:', error);
            mostrarMensagem('Erro ao liberar o assento.', false);
        });

        // Exibe o botão de mudar o assento
        document.getElementById('mudar-assento-btn').style.display = 'none';
    } else {
        mostrarMensagem('Não há reserva registrada para esse CPF.', false);
    }
}
