// Simulação de um "banco de dados" de assentos  
const assentos = {};

// Inicializando os assentos de 01 a 64
for (let i = 1; i <= 64; i++) {
    assentos[i.toString().padStart(2, '0')] = true;  // Formata para dois dígitos
}

// Objeto para rastrear reservas por CPF
const reservasPorCPF = {};

// Função para atualizar o select de assentos baseado na disponibilidade
function atualizarAssentos() {
    const assentoSelect = document.getElementById('assento');
    assentoSelect.innerHTML = '<option value="">Selecione um Assento</option>'; // Limpa as opções

    const pisoSuperior = [];
    const pisoInferior = [];

    // Separa os assentos de acordo com o piso
    for (let assento in assentos) {
        if (assentos[assento]) { // Verifica se o assento está disponível
            if (parseInt(assento) <= 52) {
                pisoSuperior.push(assento);  // Piso Superior: 01 a 52
            } else {
                pisoInferior.push(assento);  // Piso Inferior: 53 a 64
            }
        }
    }

    // Ordena os assentos do Piso Superior em ordem crescente
    pisoSuperior.sort((a, b) => parseInt(a) - parseInt(b));

    // Adiciona assentos do piso superior
    if (pisoSuperior.length > 0) {
        assentoSelect.appendChild(new Option('--- PISO SUPERIOR ---', ''));
        pisoSuperior.forEach(assento => {
            const option = document.createElement('option');
            option.value = assento;
            option.textContent = assento;
            assentoSelect.appendChild(option);
        });
    }

    // Adiciona assentos do piso inferior
    if (pisoInferior.length > 0) {
        assentoSelect.appendChild(new Option('--- PISO INFERIOR ---', ''));
        pisoInferior.forEach(assento => {
            const option = document.createElement('option');
            option.value = assento;
            option.textContent = assento;
            assentoSelect.appendChild(option);
        });
    }
}

// Função para validar o CPF
function validarCPF(cpf) {
    const regex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/; // Formato XXX.XXX.XXX-XX
    return regex.test(cpf);
}

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

        // Envia os dados para o Google Sheets via fetch
        const formData = new FormData();
        formData.append('nome', nome);
        formData.append('cpf', cpf);
        formData.append('escola', escola);
        formData.append('assento', assentoSelecionado);

        fetch('https://script.google.com/macros/s/AKfycbzFHjgrq0KOeC_efyfcN8vK5vmvuydTQE3ztf38s-gPiPorOq5G0qvS4GZ8fFat5f6O/exec', {
            method: 'POST',
            body: formData
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
        const formData = new FormData();
        formData.append('cpf', cpf);
        formData.append('assento', assentoAnterior);
        formData.append('status', 'Disponível');

        fetch('https://script.google.com/macros/s/AKfycbzFHjgrq0KOeC_efyfcN8vK5vmvuydTQE3ztf38s-gPiPorOq5G0qvS4GZ8fFat5f6O/exec', {
            method: 'POST',
            body: formData
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

// Função para carregar os dados dos assentos do Google Sheets
function carregarAssentosGoogle() {
    fetch('https://script.google.com/macros/s/AKfycbzFHjgrq0KOeC_efyfcN8vK5vmvuydTQE3ztf38s-gPiPorOq5G0qvS4GZ8fFat5f6O/exec')
        .then(response => response.json())
        .then(data => {
            // Atualiza o estado dos assentos com os dados carregados do Google Sheets
            data.forEach(reserva => {
                assentos[reserva.assento] = reserva.status === 'Disponível';
            });
            atualizarAssentos(); // Atualiza a lista de assentos
        })
        .catch(error => console.error('Erro ao carregar dados do Google Sheets:', error));
}

// Inicializar a lista de assentos ao carregar a página
window.onload = () => {
    carregarAssentosGoogle();
    atualizarAssentos();  // Atualiza a lista de assentos ao carregar
};

// Adicionando o evento de submissão do formulário
document.getElementById('reserva-form').addEventListener('submit', reservarAssento);

// Adicionando o evento para o botão de mudar assento
document.getElementById('mudar-assento-btn').addEventListener('click', mudarAssento);
