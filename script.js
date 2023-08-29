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

console.log("Elementos: ", elementosDiagrama);
for (let i = 0; i < elementosDiagrama.length; i++) {
    console.log(elementosDiagrama[i]);
}

// * Estilização da linha
var options = {
    size: 5,
    endPlug: 'behind',
    startSocket: 'center',
    endSocket: 'center',
    path: 'fluid',
    startPlugColor: '#000',
    endPlugColor: '#000',
    gradient: true
};

function fluxoConecta(elemento) {
    elemento.find('.linkInsert').mousedown(function (e) {
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
            endPlug: 'arrow3',
            path: 'fluid',
            startPlugColor: '#000',
            endPlugColor: '#000',
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

                if (idElementoDestino == idElementoOrigem) {
                    console.log("Não é possível conectar um elemento a si mesmo");
                    return;
                }

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
            idNumber = pegaId($(this));
            elementosDiagrama[idNumber].coordenadas = [$(this).offset().left, $(this).offset().top];
            localStorage.setItem('elementosDiagrama', JSON.stringify(elementosDiagrama));
        }
    });
    elemento.find(".draggable").on("drag", function () {

        idNumber = pegaId($(this));

        for (let i = 0; i < elementosDiagrama[idNumber].conexoes.length; i++) {
            elementosDiagrama[idNumber].conexoes[i].position();
        }
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
            <div id="elementoMovivel-${elementoMovivelObjeto.id}" class="elementoMovivel draggable card border-0">
                <header class="elementoMovivel-header">
                    <img class="elementoMovivel-imagem" src="./roteador.jpeg"></img>
                    <div class="elementoMovivel-nome text-center py-1" contenteditable="true">${elementoMovivelObjeto.nome}</div>
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
        if ($('#alteraModo i').hasClass('bi-arrows-move')) {
            console.log("Modo de exclusão desativado");
            return;
        }

        idNumber = pegaId($(this));
        $(this).closest('.elementoMovivel-container').remove();

        // for (let i = 0; i < elementosDiagrama[idNumber].conexoes.length; i++) {
        //     elementosDiagrama[idNumber].conexoes[i].remove();
        // }

        elementosDiagrama[idNumber] = new Elemento(null, null, null, null);

        localStorage.setItem('elementosDiagrama', JSON.stringify(elementosDiagrama));
    });
}

function carregaElementos() {
    for (let i = 0; i < elementosDiagrama.length; i++) {
        if (elementosDiagrama[i].id == null) { continue; }  
        let novoElemento = criaHTML(elementosDiagrama[i]);
        elementoFuncoes(novoElemento);
        $('section').append(novoElemento);
    }
}

function carregaConexoes() {

    // * Antes de carregar as conexões, é necessário apagar todas elas
    for (let i = 0; i < elementosDiagrama.length; i++) {
        elementosDiagrama[i].conexoes = [];
    }

    for (const conexaoKey in dicionarioConexoes) {
        if (dicionarioConexoes.hasOwnProperty(conexaoKey)) {

            let idOrigem = conexaoKey.split('-')[0];
            let idDestino = conexaoKey.split('-')[1];

            let linha = new LeaderLine(document.getElementById('linkInsert-' + idOrigem), document.getElementById('linkInsert-' + idDestino), options);

            let idOrigemElemento = idOrigem.slice(0, -1);
            let idOrigemDestino = idDestino.slice(0, -1);

            elementosDiagrama[idOrigemElemento].conexoes.push(linha);
            elementosDiagrama[idOrigemDestino].conexoes.push(linha);
        }
    }
}

function pegaId(elemento) {
    return parseInt(elemento.attr('id').split('-')[1]);
}

function elementoFuncoes(elemento) {
    customDrag(elemento);
    fluxoConecta(elemento);
    apagaElemento(elemento);
    alteraNome(elemento);
}

$(document).ready(function () {

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
        $('#alteraModo i').toggleClass('bi-arrows-move bi-trash2');
        $('#alteraModo span').text(function (i, text) {
            return text === "Modo Exclusão" ? "Modo Edição" : "Modo Exclusão";
        });
        $('.linkInsert').toggleClass('d-none');
    });
    $('#exportaDiagrama').click(function () {
        console.log("exportarDados");
        localStorage.clear();
    });
});