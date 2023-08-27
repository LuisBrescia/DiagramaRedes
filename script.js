/*
? Documentação:
function fluxoConecta(element) - Configura conexão entre dois elementos
customDrag(elemento) - Configura as regras para dos elementos movíveis
criaConteudo(id) - HTML de elemento do diagrama
apagaElemento(element) - Apaga um elemento caso o ambiente esteja em modo exclusão
*/

// * Estilização da linha
var options = {
    size: 5,
    layer: 0,
    endPlug: 'behind',
    startSocket: 'right',
    endSocket: 'left',
    startPlugColor: '#0cf',
    endPlugColor: '#04f',
    gradient: true,
    // color: '#04f',
};

// * Função para configurar regras para conexão
function fluxoConecta(element) {
    element.find('.linkInsert').mousedown(function (e) {

        e.preventDefault();

        let id = $(this).attr('id');
        let idNumber = parseInt(id.split('-')[1]);
        console.log("id: " + id);
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

            if ($(event.target).is(".elemento-movivel-imagem, .elemento-movivel-nome")) {
                console.log("mouse-solto em elemento");

                // Será criado uma nova LeaderLine

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
        handle: ".elemento-movivel-imagem",
        stop: function () { // * Executado sempre que o card é solto
            $(this).closest('.elemento-movivel-container').css('position', 'absolute');
        }
    });
}

// * HTML de um card
function criaConteudo(id) {
    return $(`
        <div class="elemento-movivel-container rounded-circle" style="top: 10%;">
            <div id="elemento-movivel-${id}" class="elemento-movivel draggable card">
                <header class="elemento-movivel-header">
                    <img class="elemento-movivel-imagem" src="./roteador.jpeg"></img>
                    <div class="elemento-movivel-nome text-center" contenteditable="true">Elemento ${id}</div>
                </header>
                <span class="linkInsert" id="linkInsert-1"></span>
                <span class="linkInsert" id="linkInsert-2"></span>
                <span class="linkInsert" id="linkInsert-3"></span>
                <span class="linkInsert" id="linkInsert-4"></span>
            </div>
        </div>
    `);
}

// * Apaga um elemento caso o ambiente esteja em modo exclusão
function apagaElemento(element) {
    element.find('.elemento-movivel').click(function () {
        if ($('#alteraModo i').hasClass('bi-trash2')) {
            $(this).closest('.elemento-movivel-container').remove();
            $(this).closest('.elemento-movivel').remove();
        }
    });
}

$(document).ready(function () {

    $('#adicionaElemento').click(function () {

        var id = 1;

        while (true) {
            if ($('#elemento-movivel-' + id).length == 0) {
                break;
            }
            id++;
        }

        var novoElemento = criaConteudo(id);

        customDrag(novoElemento);
        fluxoConecta(novoElemento);
        apagaElemento(novoElemento);
        paraTeste(novoElemento);

        $('section').append(novoElemento);
    });
    $('#alteraModo').click(function () {
        console.log("ModoAlterado");
        $('#alteraModo i').toggleClass('arrows-move bi-trash2');
        $('#alteraModo span').text(function (i, text) {
            return text === "Modo Exclusão" ? "Modo Edição" : "Modo Exclusão";
        });
    });
    $('#exportaDados').click(function () {
        console.log("exportarDados");
    });
});

function paraTeste(element) {
    element.find('.elemento-movivel').click(function (e) {
        e.preventDefault();
        console.log("Elemento percebido");
    });
}