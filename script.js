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

var elementosDiagrama = JSON.parse(localStorage.getItem('elementosDiagrama')) || []; // ? Vetor de objetos
var dicionarioConexoes = JSON.parse(localStorage.getItem('dicionarioConexoes')) || {}; // ! Objeto

for (let i = 0; i < elementosDiagrama.length; i++) {
    elementosDiagrama[i].conexoes = [];
}

// * Estilização da linha
var options = {
    size: 5,
    endPlug: 'behind',
    startSocket: 'center',
    endSocket: 'center',
    path: 'magnet',
    startPlugColor: '#212529',
    endPlugColor: '#f5f9f8',
    gradient: true
};

function fluxoConecta(element) {
    element.find('.linkInsert').mousedown(function (e) {

        e.preventDefault();

        let id = $(this).attr('id');
        let idNumber = id.split('-')[1];

        const mouseX = e.clientX + pageXOffset;
        const mouseY = e.clientY + pageYOffset;

        let elmpoint = $(`<div id="elmpoint" style="top: ${mouseY}px; left: ${mouseX}px;"></div>`);
        $('section').append(elmpoint);

        let elmPoint = document.getElementById('elmpoint');
        let mouseEl = document.getElementById('linkInsert-' + idNumber);

        let linhaMouse = new LeaderLine(mouseEl, elmPoint, {
            size: 5,
            endPlug: 'disc',
        
            path: 'grid',
            startPlugColor: '#212529',
            endPlugColor: '#f5f9f8',
            gradient: true
        });

        $(document).mousemove(function (e) {
            elmPoint.style.left = `${e.clientX + pageXOffset}px`;
            elmPoint.style.top = `${e.clientY + pageYOffset}px`;
            linhaMouse.position();
        });

        $(document).mouseup(function (event) {

            if ($(event.target).is(".linkInsert")) {

                let idDestino = $(event.target).attr('id');
                let idDestinoNumber = idDestino.split('-')[1];

                idElementoDestino = idDestinoNumber[0];
                idElementoOrigem = idNumber[0];

                console.log("Será adicioado o valor: " + idNumber + "-" + idDestinoNumber);

                let conexaoKey = idNumber + '-' + idDestinoNumber;
                let linha = new LeaderLine(mouseEl, event.target, options);

                dicionarioConexoes[conexaoKey] = "Ativa";

                elementosDiagrama[idElementoOrigem].conexoes.push(linha);
                elementosDiagrama[idElementoDestino].conexoes.push(linha);

                localStorage.setItem('dicionarioConexoes', JSON.stringify(dicionarioConexoes));
                localStorage.setItem('elementosDiagrama', JSON.stringify(elementosDiagrama));
            }

            linhaMouse.remove();
            elmpoint.remove();
            $(document).off('mousemove');
            $(document).off('mouseup');
        });
    });
}

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

        elementosDiagrama[idNumber].coordenadas = [$(this).offset().left, $(this).offset().top];

        localStorage.setItem('elementosDiagrama', JSON.stringify(elementosDiagrama));

        // Vou pegar cada um dos valores do vetor de conexoes e atualizar a posição

        for (let i = 0; i < elementosDiagrama[idNumber].conexoes.length; i++) {
            console.log("Atualizando a posição da conexão: ", elementosDiagrama[idNumber].conexoes[i]);
            console.log(dicionarioConexoes[elementosDiagrama[idNumber].conexoes[i]]);
            elementosDiagrama[idNumber].conexoes[i].position();
        }

        // // * Atualizar cada uma das conexoes
        // for (let i = 0; i < TAM; i++) {
        //     if (conexoes[i][idNumber][0] != null) {
        //         conexoes[i][idNumber][0].position();
        //     }
        // }

    });
}

function criaHTML(elementoMovivelObjeto) {

    let classe = '';

    if ($('#alteraModo i').hasClass('bi-trash2')) {
        classe = 'd-none';
    }

    let conteudoStyle = '';
    if (elementoMovivelObjeto.coordenadas == null) {
        conteudoStyle = 'top: 10%;';
    } else {
        conteudoStyle = 'top: ' + elementoMovivelObjeto.coordenadas[1] + 'px; left: ' + elementoMovivelObjeto.coordenadas[0] + 'px;';
    }

    return $(`
        <div class="elementoMovivel-container rounded-circle" style="${conteudoStyle};">
            <div id="elementoMovivel-${elementoMovivelObjeto.id}" class="elementoMovivel draggable card">
                <header class="elementoMovivel-header">
                    <img class="elementoMovivel-imagem" src="./roteador.jpeg"></img>
                    <div class="elementoMovivel-nome text-center py-3" contenteditable="true">${elementoMovivelObjeto.nome}</div>
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
        
        if ($(this).text() == '') {
            $(this).text('Elemento');
        }

        idNumber = pegaId($(this).closest('.elementoMovivel'));
        elementosDiagrama[idNumber].nome = $(this).text();
        localStorage.setItem('elementosDiagrama', JSON.stringify(elementosDiagrama));
        console.log("Nome alterado");
    });
}

function apagaElemento(elemento) {
    elemento.find('.elementoMovivel').click(function () {
        if ($('#alteraModo i').hasClass('bi-trash2')) {
            $(this).closest('.elementoMovivel-container').remove();
            $(this).closest('.elementoMovivel').remove();
        }
    });
}

function carregaElementos() {
    for (let i = 0; i < elementosDiagrama.length; i++) {

        let novoElemento = criaHTML(elementosDiagrama[i]);

        elementoFuncoes(novoElemento);

        $('section').append(novoElemento);
        console.log("Elemento adicionado");
    }
}

function carregaConexoes() {

    for (const conexaoKey in dicionarioConexoes) {
        if (dicionarioConexoes.hasOwnProperty(conexaoKey)) {
            console.log("conexaoKey: " + conexaoKey);

            // Conexão key = 03-11

            // #linkInsert-03 e #linkInsert-11

            let idOrigem = conexaoKey.split('-')[0];
            let idDestino = conexaoKey.split('-')[1];

            let linha = new LeaderLine(document.getElementById('linkInsert-' + idOrigem), document.getElementById('linkInsert-' + idDestino), options);

            console.log(idOrigem);

            let idOrigemElemento = idOrigem.slice(0, -1);
            let idOrigemDestino = idDestino.slice(0, -1);

            elementosDiagrama[idOrigemElemento].conexoes.push(linha);
            elementosDiagrama[idOrigemDestino].conexoes.push(linha);
        }
    }
}

function pegaId(element) {
    return parseInt(element.attr('id').split('-')[1]);
}

function elementoFuncoes(elemento) {
    customDrag(elemento);
    fluxoConecta(elemento);
    apagaElemento(elemento);
    alteraNome(elemento);
}

$(document).ready(function () {

    /*
     : Ideia de solução: Guardo a linha dentro do vetor de conexões, onde cada elemento é um objeto leaderline 
     */

    carregaElementos();
    setTimeout(carregaConexoes, 300); // Provavelmente a atualização de linhas vai resolver esse problema

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

        elementoFuncoes(novoElemento);

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