/*
? Documentação:

*/

$(document).ready(function () {

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

    $('#adicionaElemento').click(function () {

        // // * Realizar testes para checar se foi corrigido
        // var lista = new Lista(indiceTrue, 'Lista ' + (indiceTrue + 1), " ", null);
        // var newCard = criaConteudo(lista, indiceTrue);

        // customDrag(newCard);
        // editaCard(newCard);
        // nomeiaCard(newCard);
        // resetaCard(newCard);
        // removeCard(newCard);

        // todasListas[indiceTrue] = lista;
        // localStorage.setItem(ListaTipo, JSON.stringify(todasListas));

        var novoElemento = criaConteudo('Elemento ' + ($('.elemento-movivel-container').length + 1) + '');

        customDrag(novoElemento);

        $('section').append(novoElemento);
    });

    

});

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
function criaConteudo(nome) {
    return $(`
        <div class="elemento-movivel-container rounded-circle" style="top: 10%;">
            <div class="elemento-movivel draggable card">
                <header class="elemento-movivel-header">
                    <img class="elemento-movivel-imagem" src="./roteador.jpeg"></img>
                    <div class="elemento-movivel-nome text-center" contenteditable="true">${nome}</div>
                </header>
                <span class="linkInsert" id="linkInsert1"></span>
                <span class="linkInsert" id="linkInsert2"></span>
                <span class="linkInsert" id="linkInsert3"></span>
                <span class="linkInsert" id="linkInsert4"></span>
            </div>
        </div>
        
    `);
}