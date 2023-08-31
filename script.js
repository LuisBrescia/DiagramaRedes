/*
? Documentação:

* Classes

ElementoDiagrama - Classe que representa um elemento do diagrama
Conexao - Classe que representa uma conexão entre dois elementos do diagrama

* Funções - ordenadas por ordem de complexidade

removeUltimoAlgarismo(linkInsertIdNumero) - Remove o ultimo elemento de uma string, útil para conseguir id pai
parseIdNumero(idCompleta) - Passa uma id completa e retorna apenas o número que vem depois de '-'
exibirToaster(Mensagem) - Exibe um toaster com a mensagem passada como parâmetro
funcoesElementoDiagrama(ElementoDiagrama) - Chama todas as funções que configuram um elemento do diagrama

conectaElementosDiagrama(ElementoDiagrama) - Configura a conexão entre dois elementos do diagrama
customDrag(elemento) - Configura as regras para dos elementos movíveis
criaElementoDiagramaHTML(elementoDiagramaObjeto) - HTML de elemento do diagrama
apagaElemento(element) - Apaga um elemento caso o ambiente esteja em modo exclusão
conexaoElementos(conexaoKey) - Retorna os elementos conextados em uma conexao 

* Nomes

linkInsert - Elemento que serve como ponto de conexão entre dois elementos do diagrama, cada elemento possui 4 linkInserts

* Padronização

linkInsertIdCompleta- ID do completa do linkInsert 
linkInsertIdNumero - Apenas o número que vem depois de '-' no id de um linkInsert

estiloLeaderLine_padrao - Estilo padrão da linha
estiloLeaderLine_mouse - Estilo da linha que segue o mouse

*/

// ? LeaderLine
var estiloLeaderLinePadrao = {
    size: 3,
    endPlug: 'behind',
    path: 'grid',
    color: '#0f0f0f'
};
var estiloLeaderLineMouse = {
    size: 3,
    endPlug: 'arrow3',
    path: 'fluid',
    color: '#0f0f0f'
};

// ? Classes
class ElementoDiagrama {
    constructor(id, tipo, nome, coordenadas) {
        this.id = id;
        this.tipo = tipo;
        this.nome = nome;
        this.coordenadas = coordenadas;
        this.conexoes = []; // > Talvez eu coloque um vetor que irá conter o Objeto Leader Line e sua respectiva conexão
    }

    apagaElemento() {
        this.id = null;
        this.tipo = null;
        this.nome = null;
        this.coordenadas = null;
        this.conexoes = [];                      
    }

    imprimeAtributos() {
        console.log(this.id);
        console.log(this.tipo);
        console.log(this.nome);
        console.log(this.coordenadas);
        console.log(this.conexoes);
    }

    adicionaConexao(conexao) {
        this.conexoes.push(conexao);
    }

    removeConexao(conexao) { // ! Não entendi
        const index = this.conexoes.indexOf(conexao);
        if (index !== -1) {
            this.conexoes.splice(index, 1);
        }
    }
}
class Conexao {
    constructor(linkInsertOrigem_idNumero, linkInsertDestino_idNumero) {
        this.linkInsertOrigem_idNumero = linkInsertOrigem_idNumero;
        this.linkInsertDestino_idNumero = linkInsertDestino_idNumero;
        this.linha = new LeaderLine(
            document.getElementById('linkInsert-' + linkInsertOrigem_idNumero),
            document.getElementById('linkInsert-' + linkInsertDestino_idNumero),
            estiloLeaderLinePadrao
        )
    }

    position() {
        this.linha.position();
    }

    remover() { // > Não faz sentido já que a conexão é entre linkInsert de elementos e não elementos em si
        this.linha.remove();
        // this.linkInsertOrigem_id.removeConexao(this);
        // this.linkInsertDestino_id.removeConexao(this);
        // Gostaria de deletar o objeto 
        this.linkInsertOrigem_idNumero = null;
        this.linkInsertDestino_idNumero = null;
    }
}

// ? Variáveis LocalStorage
const elementosRecuperados = JSON.parse(localStorage.getItem('vetorElementosDiagrama')) || [];
var vetorConexoes = JSON.parse(localStorage.getItem('vetorConexoes')) || []; // ? Vetor de string que armazena todas as conexoes

var vetorElementosDiagrama = elementosRecuperados.map(obj => {
    return new ElementoDiagrama(obj.id, obj.tipo, obj.nome, obj.coordenadas);
});

// ? Funções

// : Verificada
function removeUltimoAlgarismo(linkInsertIdNumero) {
    return linkInsertIdNumero.slice(0, -1);
}

// : Verificada
function parseIdNumero(idCompleta) {
    return idCompleta.split('-')[1];
}

// : Verificada
function exibeToaster(mensagem) {
    $('.toast-body').text(mensagem);
    $('.toast').toast('show');
}

// : Verificada
function funcoesElementoDiagrama(ElementoDiagrama) {
    alteraNomeElementoDiagrama(ElementoDiagrama);
    configuraMovimentacaoElementoDiagrama(ElementoDiagrama);
    conectaElementoDiagrama(ElementoDiagrama);
    removeElementoDiagrama(ElementoDiagrama);
}

// : Verificada
function alteraNomeElementoDiagrama(ElementoDiagrama) {
    ElementoDiagrama.find('.elementoDiagrama-nome').on('blur', function () {

        if ($(this).text() == '') {
            $(this).text('Elemento Diagrama');
        }

        elementoDiagrama_idNumero = parseIdNumero($(this).closest('.elementoDiagrama').attr('id'));
        vetorElementosDiagrama[elementoDiagrama_idNumero].nome = $(this).text();
        localStorage.setItem('vetorElementosDiagrama', JSON.stringify(vetorElementosDiagrama));
    });
}

// : Verificada
function configuraMovimentacaoElementoDiagrama(ElementoDiagrama) {
    ElementoDiagrama.find(".draggable").draggable({
        containment: "section",
        scroll: false,
        snap: false,
        stack: ".draggable",
        cursor: "grabbing",
        handle: ".elementoDiagrama-imagem-draggable",
        stop: function () {
            $(this).closest('.elementoDiagrama-container').css('position', 'absolute');
            elementoDiagrama_idNumero = parseIdNumero($(this).closest('.elementoDiagrama').attr('id'));
            vetorElementosDiagrama[elementoDiagrama_idNumero].coordenadas = [$(this).offset().left, $(this).offset().top];
            localStorage.setItem('vetorElementosDiagrama', JSON.stringify(vetorElementosDiagrama));
        }
    });
    ElementoDiagrama.find(".draggable").on("drag", function () { // ! Está pegando o ID toda hora, revisar isso 
        elementoDiagrama_idNumero = parseIdNumero($(this).closest('.elementoDiagrama').attr('id'));
        vetorElementosDiagrama[elementoDiagrama_idNumero].conexoes.forEach(function (conexao) {
            conexao.position();
        });
    });
}

// > Conexão entre elementos removida
function conectaElementoDiagrama(ElementoDiagrama) {
    ElementoDiagrama.find('.linkInsert').mousedown(function (e) {

        e.preventDefault();

        let linkInsertOrigem_id = $(this).attr('id');
        let linkInsertOrigem_idNumero = parseIdNumero(linkInsertOrigem_id);

        $('section').append($(`<div id="pontoMouse" style="top: ${e.clientY + pageYOffset}px; left: ${e.clientX + pageXOffset}px;"></div>`));

        let linkInsertOrigem = document.getElementById(linkInsertOrigem_id);
        let pontoMouseId = document.getElementById('pontoMouse');

        let linhaMouse = new LeaderLine(linkInsertOrigem, pontoMouseId, estiloLeaderLineMouse);

        $(document).mousemove(function (e) {
            pontoMouseId.style.left = `${e.clientX + pageXOffset}px`;
            pontoMouseId.style.top = `${e.clientY + pageYOffset}px`;
            linhaMouse.position();
        });

        $(document).mouseup(function (e) {

            if ($(e.target).is(".linkInsert")) {

                let linkInsertDestino_id = $(e.target).attr('id');
                let linkInsertDestino_idNumero = parseIdNumero(linkInsertDestino_id);

                let elementoOrigem_idNumero = removeUltimoAlgarismo(linkInsertOrigem_idNumero);
                let elementoDestino_idNumero = removeUltimoAlgarismo(linkInsertDestino_idNumero);

                if (elementoDestino_idNumero == elementoOrigem_idNumero) {
                    exibeToaster('Não é possível conectar um elemento a ele mesmo.');
                    linhaMouse.remove();
                    $('#pontoMouse').remove();
                    $(document).off('mousemove');
                    $(document).off('mouseup');
                    return;
                }

                if (elementoOrigem_idNumero > elementoDestino_idNumero) {
                    let aux = linkInsertOrigem_id;
                    linkInsertOrigem_id = linkInsertDestino_id;
                    linkInsertDestino_id = aux;

                    aux = linkInsertOrigem_idNumero;
                    linkInsertOrigem_idNumero = linkInsertDestino_idNumero;
                    linkInsertDestino_idNumero = aux;

                    aux = elementoOrigem_idNumero;
                    elementoOrigem_idNumero = elementoDestino_idNumero;
                    elementoDestino_idNumero = aux;
                }

                for (let i = 0; i < vetorConexoes.length; i++) {
                    console.log(vetorConexoes[i]);

                    let vetorConexoesElementoOrigem_idNumero = removeUltimoAlgarismo(vetorConexoes[i].linkInsertOrigem_idNumero);
                    let vetorConexoesElementoDestino_idNumero = removeUltimoAlgarismo(vetorConexoes[i].linkInsertDestino_idNumero);

                    if (elementoOrigem_idNumero == vetorConexoesElementoOrigem_idNumero && elementoDestino_idNumero == vetorConexoesElementoDestino_idNumero) {
                        exibeToaster('Elementos já conectados.');
                        linhaMouse.remove();
                        $('#pontoMouse').remove();
                        $(document).off('mousemove');
                        $(document).off('mouseup');
                        return;
                    }

                }

                let conexaoCriada = new Conexao(linkInsertOrigem_idNumero, linkInsertDestino_idNumero);
                vetorConexoes.push(conexaoCriada);

                vetorElementosDiagrama[elementoOrigem_idNumero].adicionaConexao(conexaoCriada);
                vetorElementosDiagrama[elementoDestino_idNumero].adicionaConexao(conexaoCriada);

                linhaMouse.remove();
                $('#pontoMouse').remove();
                $(document).off('mousemove');
                $(document).off('mouseup');

                localStorage.setItem('vetorConexoes', JSON.stringify(vetorConexoes));

                return;
            }

            linhaMouse.remove();
            $('#pontoMouse').remove();
            $(document).off('mousemove');
            $(document).off('mouseup');
        });
    });
}

function removeElementoDiagrama(ElementoDiagrama) {
    ElementoDiagrama.find('.elementoDiagrama').click(function () {
        if ($('#alteraModo i').hasClass('bi-arrows-move')) {
            return;
        }

        elementoDiagrama_idNumero = parseIdNumero($(this).attr('id'));

        $(this).closest('.elementoDiagrama-container').remove();

        for(let i = 0; i < vetorConexoes.length; i++) {
            if(removeUltimoAlgarismo(vetorConexoes[i].linkInsertOrigem_idNumero) == elementoDiagrama_idNumero || removeUltimoAlgarismo(vetorConexoes[i].linkInsertDestino_idNumero) == elementoDiagrama_idNumero) {
                vetorConexoes[i].remover();
            }
        }

        vetorElementosDiagrama[elementoDiagrama_idNumero].apagaElemento();

        vetorConexoes = vetorConexoes.filter(conexao => conexao.linkInsertOrigem_idNumero !== null && conexao.linkInsertDestino_idNumero !== null);
        // Fazer o mesmo para o vetor de elementos
        vetorElementosDiagrama = vetorElementosDiagrama.filter(elemento => elemento.id !== null);
        

        localStorage.setItem('vetorConexoes', JSON.stringify(vetorConexoes));
        localStorage.setItem('vetorElementosDiagrama', JSON.stringify(vetorElementosDiagrama));
    });
}

function criaElementoDiagramaHTML(elementoDiagramaObjeto) {

    let classe = '';

    if ($('#alteraModo i').hasClass('bi-trash2')) {
        classe = 'd-none';
    }

    console.log(elementoDiagramaObjeto.coordenadas);

    let conteudoStyle = 'top: ' + elementoDiagramaObjeto.coordenadas[1] + 'px; left: ' + elementoDiagramaObjeto.coordenadas[0] + 'px;';

    return $(`
        <div class="elementoDiagrama-container rounded-circle" style="${conteudoStyle};">
            <div id="elementoDiagrama-${elementoDiagramaObjeto.id}" class="elementoDiagrama draggable card border-0">
                <header class="elementoDiagrama-header">
                    <img class="elementoDiagrama-imagem elementoDiagrama-imagem-draggable" src="./${elementoDiagramaObjeto.tipo}"></img>
                    <div class="elementoDiagrama-nome text-center py-1" contenteditable="true">${elementoDiagramaObjeto.nome} ${elementoDiagramaObjeto.id}</div>
                </header>
                <span class="linkInsert ${classe}" id="linkInsert-${elementoDiagramaObjeto.id}1"></span>
                <span class="linkInsert ${classe}" id="linkInsert-${elementoDiagramaObjeto.id}2"></span>
                <span class="linkInsert ${classe}" id="linkInsert-${elementoDiagramaObjeto.id}3"></span>
                <span class="linkInsert ${classe}" id="linkInsert-${elementoDiagramaObjeto.id}4"></span>
            </div>
        </div>
    `);
}

function carregaElementosDiagrama() {
    vetorElementosDiagrama.forEach(ElementoDiagrama => {
        if (ElementoDiagrama.id == null) { return; } // > Acho meio estranho não retornar a função toda mas ok
        let elementoDiagramaHTML = criaElementoDiagramaHTML(ElementoDiagrama);
        funcoesElementoDiagrama(elementoDiagramaHTML);
        $('section').append(elementoDiagramaHTML);
    });
}

function carregaConexoes() {
    for(let i = 0; i < vetorConexoes.length; i++) {
        let conexaoCriada = new Conexao(vetorConexoes[i].linkInsertOrigem_idNumero, vetorConexoes[i].linkInsertDestino_idNumero);
        vetorConexoes[i] = conexaoCriada;

        // Preciso também adicionar os vetores a seus respectivos elementos
        vetorElementosDiagrama[removeUltimoAlgarismo(vetorConexoes[i].linkInsertOrigem_idNumero)].adicionaConexao(conexaoCriada);
        vetorElementosDiagrama[removeUltimoAlgarismo(vetorConexoes[i].linkInsertDestino_idNumero)].adicionaConexao(conexaoCriada);
    }
}

function conexaoElementos(conexaoKey) {
    let idOrigem = conexaoKey.split('-')[0];
    let idDestino = conexaoKey.split('-')[1];

    let idOrigemElemento = idOrigem.slice(0, -1);
    let idOrigemDestino = idDestino.slice(0, -1);

    return idOrigemElemento + '-' + idOrigemDestino;
}

$(document).ready(function () {

    carregaElementosDiagrama();
    setTimeout(carregaConexoes, 100); // > Futuramente trocar setTimeout por uma promise

    $('#adicionaElemento').click(function () {

        let id = 0;

        while (true) {
            if ($('#elementoDiagrama-' + id).length == 0) {
                break;
            }
            id++;
        }

        let tipo = 'roteador.jpeg';

        if (id % 2 == 0) {
            tipo = 'hubmau.jpg';
        }

        let novoElementoObjeto = new ElementoDiagrama(id, tipo, 'Element', [0, 0]);
        let novoElemento = criaElementoDiagramaHTML(novoElementoObjeto);

        funcoesElementoDiagrama(novoElemento);

        vetorElementosDiagrama[id] = novoElementoObjeto;
        vetorElementosDiagrama[id].imprimeAtributos();

        localStorage.setItem('vetorElementosDiagrama', JSON.stringify(vetorElementosDiagrama));

        $('section').append(novoElemento);
    });
    $('#alteraModo').click(function () {
        $('#alteraModo i').toggleClass('bi-arrows-move bi-trash2');
        $('#alteraModo span').text(function (i, text) {
            return text === "Modo Exclusão" ? "Modo Edição" : "Modo Exclusão";
        });
        $('.linkInsert').toggleClass('d-none');
        $('.elementoDiagrama-imagem').toggleClass('elementoDiagrama-imagem-draggable');
    });
    $('#exportaDiagrama').click(function () {
        exibeToaster('Atualmente sendo usado para limpar o localStorage');
        localStorage.clear();
    });
});