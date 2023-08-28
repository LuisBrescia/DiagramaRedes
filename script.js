/*
? Documentação:
fluxoConecta(element) - Configura conexão entre dois elementos
customDrag(elemento) - Configura as regras para dos elementos movíveis
criaHTML(elementoMovivelObjeto) - HTML de elemento do diagrama
apagaElemento(element) - Apaga um elemento caso o ambiente esteja em modo exclusão
*/

function Elemento(id, nome, coordenadas, conexoes) {
    this.id = id;
    this.nome = nome;
    this.coordenadas = coordenadas;
    this.conexoes = conexoes; // * Vetor onde cara irá armazenar duas IDs
}

var elementosDiagrama = JSON.parse(localStorage.getItem('elementosDiagrama')) || [];

// * Estilização da linha
var options = {
    size: 5,
    endPlug: 'disc',
    startSocket: 'center',
    endSocket: 'center',
    path: 'grid',
    startPlugColor: '#87ffcf',
    endPlugColor: '#f5f9f8',
    gradient: true
};

// * Função para configurar regras para conexão
function fluxoConecta(element) {
    element.find('.linkInsert').mousedown(function (e) {

        e.preventDefault();

        let idNumber = $(this).attr('id').split('-')[1];

        console.log("idNumber: " + idNumber);

        console.log("idNumber: " + idNumber);
        const mouseX = e.clientX + pageXOffset;
        const mouseY = e.clientY + pageYOffset;

        let elmpoint = $(`<div id="elmpoint" style="top: ${mouseY}px; left: ${mouseX}px;"></div>`);
        $('section').append(elmpoint);

        let elmPoint = document.getElementById('elmpoint');
        let mouseEl = document.getElementById('linkInsert-' + idNumber);

        let linhaMouse = new LeaderLine(mouseEl, elmPoint, {
            size: 5,
            endPlug: 'disc',
            startSocket: 'center',
            endSocket: 'center',
            path: 'grid',
            startPlugColor: '#87ffcf',
            endPlugColor: '#f5f9f8',
            gradient: true
        });

        $(document).mousemove(function (e) {
            elmPoint.style.left = `${e.clientX + pageXOffset}px`;
            elmPoint.style.top = `${e.clientY + pageYOffset}px`;
            linhaMouse.position();
        });

        $(document).mouseup(function (event) {

            console.log("Coordenadas X:", event.pageX);
            console.log("Coordenadas Y:", event.pageY);

            if ($(event.target).is(".linkInsert")) {
                console.log("mouse-solto em elemento");

                // Pegar a id do elemento

                let idDestino = $(event.target).attr('id');
                console.log("idDestino: " + idDestino);
                // Criar uma linha entre id e idDestino utilizando options
                let linha = new LeaderLine(mouseEl, event.target, options);

                // De alguma forma tenho que salvar aquela linha
            }

            console.log("mouse-solto");
            linhaMouse.remove();
            elmpoint.remove();
            $(document).off('mousemove');
            $(document).off('mouseup');
        });
    });
}

// * Função para configurar regras para movimentação do card
function customDrag(elemento) {
    elemento.find(".draggable").draggable({
        containment: "section",
        scroll: false,
        snap: false,
        stack: ".draggable",
        cursor: "grabbing",
        handle: ".elementoMovivel-imagem",
        stop: function () { // * Executado sempre que o card é solto
            $(this).closest('.elementoMovivel-container').css('position', 'absolute');
        }
    });
    elemento.find(".draggable").on("drag", function () {

        // * Pegar a id daquele elemento
        idNumber = pegaId($(this));

        console.log("Estamos vefificando as coordenadas do elemento  elementoMovivel-" + idNumber);

        elementosDiagrama[idNumber].coordenadas = [$(this).offset().left, $(this).offset().top];

        localStorage.setItem('elementosDiagrama', JSON.stringify(elementosDiagrama));
        console.log("Coordenadas do elemento de id " + idNumber + ": " + elementosDiagrama[idNumber].coordenadas);

        // // * Atualizar cada uma das conexoes
        // for (let i = 0; i < TAM; i++) {
        //     if (conexoes[i][idNumber][0] != null) {
        //         conexoes[i][idNumber][0].position();
        //     }
        // }

    });
}

// * HTML de um card
function criaHTML(elementoMovivelObjeto) {

    let classe = '';

    if ($('#alteraModo i').hasClass('bi-trash2')) {
        classe = 'd-none';
    }

    return $(`
        <div class="elementoMovivel-container rounded-circle" style="top: 10%;">
            <div id="elementoMovivel-${elementoMovivelObjeto.id}" class="elementoMovivel draggable card">
                <header class="elementoMovivel-header">
                    <img class="elementoMovivel-imagem" src="./roteador.jpeg"></img>
                    <div class="elementoMovivel-nome text-center py-3" contenteditable="true">Elemento ${elementoMovivelObjeto.id}</div>
                </header>
                <span class="linkInsert ${classe}" id="linkInsert-${elementoMovivelObjeto.id}1"></span>
                <span class="linkInsert ${classe}" id="linkInsert-${elementoMovivelObjeto.id}2"></span>
                <span class="linkInsert ${classe}" id="linkInsert-${elementoMovivelObjeto.id}3"></span>
                <span class="linkInsert ${classe}" id="linkInsert-${elementoMovivelObjeto.id}4"></span>
            </div>
        </div>
    `);
}

function alteraNome(elemento) {
    elemento.find('.elementoMovivel-nome').on('blur', function () {
        console.log("Nome alterado");

        // Se o nome for vazio, colocar o nome padrão
        if ($(this).text() == '') {
            $(this).text('Elemento');
        }

        // * Pegar a id daquele elemento
        // let idNumber = pegaId($(this));
    });
}

// * Apaga um elemento caso o ambiente esteja em modo exclusão
function apagaElemento(elemento) {
    elemento.find('.elementoMovivel').click(function () {
        if ($('#alteraModo i').hasClass('bi-trash2')) {
            $(this).closest('.elementoMovivel-container').remove();
            $(this).closest('.elementoMovivel').remove();
        }
    });
}

function carregaElementos() {
    for (let i = 0; i < vetorElementos.length; i++) {
        let novoElemento = criaHTML(vetorElementos[i]);
        customDrag(novoElemento);
        fluxoConecta(novoElemento);
        apagaElemento(novoElemento);
        paraTeste(novoElemento);
        $('section').append(novoElemento);
    }
}

$(document).ready(function () {

    $('#adicionaElemento').click(function () {

        var id = 0;

        while (true) {
            if ($('#elementoMovivel-' + id).length == 0) {
                break;
            }
            id++;
        }

        let novoElementoObjeto = new Elemento(id, "Elemento " + id, [0, 0], []);
        let novoElemento = criaHTML(novoElementoObjeto);

        customDrag(novoElemento);
        fluxoConecta(novoElemento);
        apagaElemento(novoElemento);
        paraTeste(novoElemento);
        alteraNome(novoElemento);

        elementosDiagrama[id] = novoElementoObjeto;
        localStorage.setItem('elementosDiagrama', JSON.stringify(elementosDiagrama));

        $('section').append(novoElemento);
    });
    $('#alteraModo').click(function () {
        console.log("ModoAlterado");
        $('#alteraModo i').toggleClass('arrows-move bi-trash2');
        $('#alteraModo span').text(function (i, text) {
            return text === "Modo Exclusão" ? "Modo Edição" : "Modo Exclusão";
        });
        $('.linkInsert').toggleClass('d-none');
    });
    $('#exportaDados').click(function () {
        console.log("exportarDados");
    });
});

function paraTeste(element) {
    element.find('.elementoMovivel').click(function (e) {
        e.preventDefault();
        console.log("Elemento percebido");
    });
}

function pegaId(element) {
    return parseInt(element.attr('id').split('-')[1]);
}