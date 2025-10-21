document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("option1").value = "_w";
    document.getElementById("option2").value = "_p";

    activeDebug();

    const editor1 = document.getElementById('editor1');
    const editor2 = document.getElementById('editor2');

    editor1.addEventListener('input', () => {
        formatarTexto();
    });

    editor2.addEventListener('input', () => {
        substituirVariaveis();
    });

    const chk = document.getElementById('chk')

    // chk.addEventListener('change', () => {
    //     changeColors();
    // })

    // chk.checked = true;
    // changeColors();

});

// function changeColors() {
//     document.body.classList.toggle('dark');
    
//     const panels = document.getElementsByClassName('panel');
//     for (let i = 0; i < panels.length; i++) {
//         panels[i].classList.toggle('dark');
//     }
// }
    
function formatarTexto() {
    const textoInserido = document.getElementById('editor1').value;
    const highlight = document.getElementById('highlight1');
    const textoLimpo = (textoInserido.replace(/[.,\/\\;:()']/g, ' ')).replace(/\\binto\\b/g, ' ');
    const cdLogInput = document.getElementById('cdLog').value;
    var textoConvertido = textoLimpo.replace(/\t/g, ' ');
    var linhas = textoConvertido.split('\n');
    var modoFormatacao = document.querySelector('input[name="modo-formatacao"]:checked').value;
    var palavrasFormatadas = [];
    var palavrasExibidas = {};
    let select_log_tasy = "select * from log_tasy where cd_log = " + (cdLogInput ? cdLogInput : "19989") + " and nm_usuario = 'debug_tool' and dt_atualizacao > sysdate - 1 order by nr_sequencia desc;"

    var option1 = document.getElementById('option1').value.toLowerCase();
    var option2 = document.getElementById('option2').value.toLowerCase();
    var option3 = document.getElementById('option3').value.toLowerCase();
    var option4 = document.getElementById('option4').value.toLowerCase();
    var option5 = document.getElementById('option5').value.toLowerCase();
    
    for (var i = 0; i < linhas.length; i++) {
        var palavras = linhas[i].split(' ');
        for (var j = 0; j < palavras.length; j++) {
        if (((palavras[j].toLowerCase().endsWith(option1) && document.getElementById("check1").checked)
            || (palavras[j].toLowerCase().endsWith(option2) && document.getElementById("check2").checked)
            || (palavras[j].toLowerCase().endsWith(option3) && document.getElementById("check3").checked)
            || (palavras[j].toLowerCase().endsWith(option4) && document.getElementById("check4").checked)
            || (palavras[j].toLowerCase().endsWith(option5) && document.getElementById("check5").checked)
            ) 
            && !palavrasExibidas[palavras[j]]) {
            if (modoFormatacao ==='modo2') {
                var palavraFormatada = "|| '" + palavras[j] + ": ' || " + palavras[j] + " || ' |'";
            } else {
                var palavraFormatada = "|| chr(13) || '" + palavras[j] + ": ' || " + palavras[j];
            }
            palavrasFormatadas.push(palavraFormatada);
            palavrasExibidas[palavras[j]] = true;
        }
        }
    }

    var textoFormatado = "";
    if (palavrasFormatadas.length > 0) {
        
        if (modoFormatacao === 'modo1') {
            textoFormatado = "raise_application_error(-20000, 'Atributos:'" + '\n' + palavrasFormatadas.join('\n') + ");";
        } else if (modoFormatacao === 'modo2') {
            textoFormatado = "wheb_mensagem_pck.exibir_mensagem_abort(191072, 'ERRO='" + '\n' + palavrasFormatadas.join('\n') + ");";
        } else if (modoFormatacao === 'modo3') {
            textoFormatado = "insert into nm_tabela (nm_campo) values (" + '\n' + palavrasFormatadas.join('\n') + ");";
        } else if (modoFormatacao === 'modo4') {
            textoFormatado = select_log_tasy + "\n\n" + "gravar_log_tasy(19989, 'Atributos:'" + '\n' + palavrasFormatadas.join('\n') + "\n" + ", 'debug_tool');";
        }
    } else {
        textoFormatado = "Nenhuma palavra encontrada para exibição.";
    }

    highlight.textContent = textoFormatado;
    Prism.highlightElement(highlight);
}

function activeDebug() {
    document.querySelectorAll('.nav a').forEach(item => item.classList.remove('active'));
    document.getElementById('menu-Debug').classList.add('active');

    //limparPainelSelect();
    //se o painel de debug estiver vazio, preencher com um exemplo
    if (document.getElementById('editor1').value.trim() === '') {
        document.getElementById('editor1').value = "Select * from dual where nr_sequencia_w = 1";
    }
    formatarTexto();
    document.getElementById("debug").style.display = "block";
    //document.getElementById("logs").style.display = "none";
    document.getElementById("replace").style.display = "none";
    document.getElementById('editor1').focus();
}

function activeReplace() {
    document.querySelectorAll('.nav a').forEach(item => item.classList.remove('active'));
    document.getElementById('menu-Replace').classList.add('active');
    
    //limparPainel();
    if (document.getElementById('editor2').value.trim() === '') {
        document.getElementById('editor2').value = "Select * from dual where nr_sequencia_w = 1";
        document.getElementById('variaveis').value = "nr_sequencia_w: 10";
    }
    
    substituirVariaveis();
    document.getElementById("debug").style.display = "none";
    //document.getElementById("logs").style.display = "none";
    document.getElementById("replace").style.display = "block";
    document.getElementById('editor2').focus();
}

function activeLogs() {
    document.getElementById("debug").style.display = "none";
    document.getElementById("replace").style.display = "none";
    document.getElementById("logs").style.display = "block";

    //limparPainelLogs();
}

function substituirVariaveis() {
    const objeto = {};
    const highlight = document.getElementById('highlight2');
    let select  = document.getElementById('editor2').value;
    let variaveis = document.getElementById('variaveis').value;

    let linhas = variaveis.split('\n');
    if (linhas[0].toLowerCase().includes('atributos')) {
        linhas = linhas.slice(1);
    }

    linhas.forEach(linha => {
        const [chave, ...valor] = linha.split(':');
        if (chave && valor) {
            let val = valor.join(':').trim();

            if (!val) {
                val = "NULL"; //null
            } else if (/^\d{2}\/\d{2}\/\d{2,4}$/.test(val)) {
                val = `TO_DATE('${val}','DD/MM/YYYY')`; //date
            } else if (/^\d+(\.\d+)?$/.test(val)) {
                // number
            } else {
                val = `'${val}'`; // varchar
            }

            objeto[chave.trim()] = val;
        }
    });

    Object.keys(objeto).forEach(chave => {
        const valor = objeto[chave];
        const regex = new RegExp(`\\b${chave}\\b`, 'g');
        select = select.valueOf().replace(regex, valor);
    });

    highlight.textContent = select;
    Prism.highlightElement(highlight);
}

function limparPainel() {
    document.getElementById('editor1').value = '';
    formatarTexto();
    document.getElementById('option3').value = '';
    document.getElementById('option4').value = '';
    document.getElementById('option5').value = '';
    document.getElementById("check3").checked = false;
    document.getElementById("check4").checked = false;
    document.getElementById("check5").checked = false;
    document.getElementById('editor1').focus();
}

function limparPainelSelect() {
    document.getElementById('editor2').value = '';
    document.getElementById('variaveis').value = '';
    substituirVariaveis();
    document.getElementById('editor2').focus();
}

function limparPainelLogs() {
    document.getElementById('codigo_original').value = '';
    const highlight3 = document.getElementById('highlight3');
    highlight3.textContent = '';
    document.getElementById('codigo_original').focus();
}

function copiarTexto() {
    var tab = '';
    const debug = document.getElementById("debug").style.display;
    const logs = document.getElementById("logs").style.display;
    const replace = document.getElementById("replace").style.display;
    switch (true) {
        case debug === "block":
            tab = 'highlight1';
          break;
        case logs === "block":
            tab = 'highlight3';
          break;
        case replace === "block":
            tab = 'highlight2';
          break;
        default:
            swal ( "Oops" , "Erro ao selecionar texto, tente copiar manualmente por favor!" ,  "error" )
      }

    var textoPainelSuperior = document.getElementById(tab).textContent;

    if (textoPainelSuperior.trim() !== '') {
        var tempInput = document.createElement('textarea');
        tempInput.value = textoPainelSuperior;
        document.body.appendChild(tempInput);

        tempInput.select();
        document.execCommand('copy');

        document.body.removeChild(tempInput);

        swal({
            text: "Texto copiado com sucesso!",
            icon: "success"
        });
        

    } else {
        swal ( "Oops" , "Não há um resultado para ser copiado, realize o processo novamente" ,  "error" )    
    }
}
