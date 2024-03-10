const OPERATORS = ["∼", "∧", "∨", "→", "↔"];
var expression = "";

function inserir(str) {
  // Insere o valor digitado na expressão
  if (str === "∼") { // Checa se é um operador lógico
    if (expression.slice(-1) === "∼") return;
  } else {
    if (
      is_logical_operator(str) &&
      is_logical_operator(expression.slice(-1))
    )
      return;
    if (is_logical_operator(str) && expression.slice(-1) === "") return; // Checa se é um operador lógico
  }
  if (str === "(" && is_variable(expression.slice(-1))) return; // Checa se é uma variável
  if (
    str === ")" && // Checa se é um operador lógico
    expression.replace(/[^\(]/g, "").length <=
      expression.replace(/[^\)]/g, "").length
  )
    return;
  if (str === ")" && expression.slice(-1) === "(") return; // Checa se é um operador lógico

  expression = expression + str;
  update_expression();
}

function update_expression() {
  // Atualiza a expressão
  document.querySelector("#display").innerHTML = expression; // Atualiza a div de expressão
}

function clear_screen() {
  // Limpa a expressão
  if (expression != "") { // Checa se a expressão está vazia
    clear_expression(); // Limpa a expressão
  } else {
    clear_result(); // Limpa o resultado
  }
}

function clear_expression() {
  expression = ""; // Limpa a expressão
  update_expression(); // Atualiza a expressão
}

function clear_result() {
  // Limpa o resultado
  document.getElementById("result").innerHTML = ""; // Limpa a div de resultados
  document.getElementById("table-test").innerHTML = ""; // Limpa a div de resultados
}

function backspace() {
  // Apaga o último valor digitado
  expression = expression.substring(0, expression.length - 1); 
  update_expression(); // Atualiza a expressão
}

function calculate() {
  // Calcula o resultado
  if (expression != "") { // Checa se a expressão está vazia
    structure_answer(); // Estrutura a resposta
    clear_expression(); // Limpa a expressão
  }
}
// ===== Conversores ===============================================================================

function ord(char) {
  // Retorna o valor da tabela ASCII
  return char.charCodeAt(0)
}

function chr(code) {
  // Retorna a posição da tabela ASCII
  return String.fromCharCode(code)
}

// ===== Checagens =================================================================================

function is_repeated_var(str, array) {
  // Checa se a variável já existe no array
  for (let v of array) { 
    if (str === v) return true
  }
  return false
}

function is_logical_operator(str) {
  // Checa se é um operador lógico
  for (let element of OPERATORS) { 
    if (str == element) return true 
  }
  return false
}

function is_variable(str) {
  // Checa se é uma variável
  if (ord(str) > 64 && ord(str) < 91) return true
  return false
}

function is_tautology(array) {
  //Checa se a ultima coluna da tabela-resposta é uma tautologia
  for (let element of array) {
    if (element === "F") return false
  }
  return true
}

function is_contradiction(array) {
  //Checa se a ultima coluna da tabela-resposta é uma contradição
  for (let element of array) {
    if (element === "V") return false
  }
  return true
}

function is_contigency(array) {
  //Checa se a ultima coluna da tabela-resposta é uma contigência
  let v_count = 0
  let f_count = 0

  for (let element of array) { // Checa se a ultima coluna da tabela-resposta é uma contigência
    if (element === "V") v_count++
    if (element === "F") f_count++ 
    if (v_count > 0 && f_count > 0) return true
  }
  return false
}

// ===== Cálculos ==================================================================================

function correct_expression(texto) { 
  // Corrige a expressão
  texto = `${texto}${ // Adiciona os parenteses que faltam
    expression.replace(/[^\(]/g, "").length > 
    expression.replace(/[^\)]/g, "").length 
      ? ")".repeat( 
          expression.replace(/[^\(]/g, "").length -
            expression.replace(/[^\)]/g, "").length
        )
      : ""
  }`

  while ( // Corrige a expressão
    texto.match( 
      /([A-Z]|\[Verdadeiro\]|\[Falso\]|0|1|\))([A-Z]|\[Verdadeiro\]|\[Falso\]|0|1|∼|\()/ // Testa a expressão
    )
  ) {
    texto = texto.replaceAll( 
      /([A-Z]|\[Verdadeiro\]|\[Falso\]|0|1|\))([A-Z]|\[Verdadeiro\]|\[Falso\]|0|1|∼|\()/g, // Corrige a expressão
      "$1∧$2"
    )
  }

  return texto
}

function sort_variables(texto) {
  // Organiza as variáveis
  let array = [] // Cria um array para as variáveis
  for (let item of new Set( // Adiciona as variáveis ao array
    texto.replaceAll("[Verdadeiro]", "1").replaceAll("[Falso]", "0") // Substitui os valores Verdadeiro e Falso por 1 e 0
  ))
    array.push(item) // Adiciona o item ao array

  return array
    .filter(x => { // Filtra as variáveis
      return ord(x) > 64 && ord(x) < 91 // Retorna as variáveis
    })
    .sort() // Organiza as variáveis
}

function structure_answer() {
  // Estrutura a resposta
  expression = correct_expression(expression) // Corrige a expressão
  let variaveis = sort_variables(expression) // Organiza as variáveis
  let qtde_linhas_tabela = 2 ** variaveis.length // Calcula a quantidade de linhas da tabela
  let bin = "0".repeat(variaveis.length) // Cria uma string de com o valor 0 em binário
  let array_answer_table = {} // Cria um array para a tabela de resposta

  for (let i = 0; i < qtde_linhas_tabela; i++) { // Preenche a tabela de resposta
    let valores = {} // Cria um array para os valores das variáveis
    for (let j = 0; j < variaveis.length; j++) { // Preenche os valores das variáveis
      valores[variaveis[j]] = bin[j] === "0" ? "1" : "0"

      if (typeof array_answer_table[variaveis[j]] === "undefined") { // Cria um array para os valores das variáveis
        array_answer_table[variaveis[j]] = []
      }
      array_answer_table[variaveis[j]].push(bin[j] === "0" ? "V" : "F") // Converte os valores da string do número binário, 0→V e 1→F para inverter os valores iniciais da tabela.
    }

    resposta = calculate_expression(expression, valores)
    for (let expressao of resposta[1].split("|")) { // Preenche a tabela de resposta
      let exp = expressao.split(":")
      if (exp[0] != "" && !is_repeated_var(exp[0], variaveis)) {  // Preenche a tabela de resposta
        if (typeof array_answer_table[exp[0]] === "undefined") { // Cria um array para os valores das variáveis
          array_answer_table[exp[0]] = []
        }
        array_answer_table[exp[0]].push(exp[1] === "1" ? "V" : "F") // Converte os valores da string do número binário, 0→V e 1→F para inverter os valores iniciais da tabela.
      }
    }
    bin = add_binary(bin, "1") // Adiciona 1 ao valor binário
  }

  build_answer_truth_table(array_answer_table, qtde_linhas_tabela) // Constrói a tabela-verdade

  expression_result_array = expression_to_array() // Converte a expressão para um array

  document.getElementById("table-test").innerHTML = `${expression} é uma 
		${is_tautology(expression_result_array) ? "tautologia" : ""}
		${is_contradiction(expression_result_array) ? "contradição" : ""}
		${is_contigency(expression_result_array) ? "contigência" : ""}
	`

  window.location.href = "#table-test" // Vai para a tabela de resultados
}

function expression_to_array() { // Converte a expressão para um array
  table = document.querySelector("#answer-table") // Pega a tabela
  array = []
  for (let r of table.rows) { // Pega as linhas da tabela
    lastCell = r.cells[r.cells.length - 1]
    if (lastCell.nodeName === "TD") { // Pega a última célula da linha
      // if (lastCell.innerHTML === 'F') return false
      array.push(lastCell.innerHTML) // Adiciona o valor da última célula ao array
    }
  }
  return array 
}

function calculate_inner_expression(exp) { // Calcula a expressão
  while (exp.match(/∼(0|1)/g)) { // Testa o 'NÃO p'
    exp = exp.replaceAll(/∼(0|1)/g, (match, p) => { // Substitui o 'NÃO p' por 1 ou 0
      //Teste do 'NÃO p'
      return p === "0" ? "1" : "0"
    })
  }

  while (exp.match(/(0|1)∧(0|1)/g)) { // Testa o 'p E q' 
    exp = exp.replaceAll(/(0|1)∧(0|1)/g, (match, p, q) => { // Substitui o 'p E q' por 1 ou 0
      //Teste do 'p E q'
      return p === "1" && q === "1" ? "1" : "0"
    })
  }

  while (exp.match(/(0|1)⊻(0|1)/g)) { // Testa o 'OU p OU q'
    exp = exp.replaceAll(/(0|1)⊻(0|1)/g, (match, p, q) => { // Substitui o 'OU p OU q' por 1 ou 0
      //Teste do 'OU p OU q'
      return (p === "0" && q === "1") || (p === "1" && q === "0") ? "1" : "0"
    })
  }

  while (exp.match(/(0|1)∨(0|1)/g)) { // Testa o 'p OU q'
    exp = exp.replaceAll(/(0|1)∨(0|1)/g, (match, p, q) => { // Substitui o 'p OU q' por 1 ou 0
      //Teste do 'p OU q'
      return p === "1" || q === "1" ? "1" : "0"
    })
  }

  while (exp.match(/(0|1)→(0|1)/g)) { // Testa o 'SE p ENTÃO q'
    exp = exp.replaceAll(/(0|1)→(0|1)/g, (match, p, q) => { // Substitui o 'SE p ENTÃO q' por 1 ou 0
      //Teste do 'SE p ENTÃO q'
      return p === "1" && q === "0" ? "0" : "1"
    })
  }

  while (exp.match(/(0|1)↔(0|1)/g)) { // Testa o 'p SE SOMENTE SE q'
    exp = exp.replaceAll(/(0|1)↔(0|1)/g, (match, p, q) => { // Substitui o 'p SE SOMENTE SE q' por 1 ou 0
      //Teste do 'p SE SOMENTE SE q'
      return (p === "1" && q === "1") || (p === "0" && q === "0") ? "1" : "0"
    })
  }

  return exp
}

function calculate_expression(exp, obj, string_result = "") { 
  // Calcula a expressão
  let cont = 0
  let exp_dicio = {}
  let result = `(${exp})`

  while (result.match(/\(([^\(\)]*)\)/g)) {
    // arquiva os valores dentro de parenteses em um dicionario
    cont++
    result = result.replace(/\(([^\(\)]*)\)/, (match, p) => {
      //Teste do Parenteses
      exp_dicio[`[P${cont}]`] = {}
      exp_dicio[`[P${cont}]`]["exp"] = p
      return `[P${cont}]`
    })
  }

  for (let inner_exp in exp_dicio) { // Calcula as expressões dentro dos parenteses
    let raw_inner_exp = exp_dicio[inner_exp]["exp"]
    let modified_inner_exp = exp_dicio[inner_exp]["exp"]

    while (raw_inner_exp.match(/(\[P\d+\])/)) {
      raw_inner_exp = raw_inner_exp.replaceAll(/(\[P\d+\])/g, (match, p) => {
        return `(${exp_dicio[p]["exp"]})`
      })
    }

    while (modified_inner_exp.match(/(\[P\d+\])/)) { // Substitui os valores das expressões dentro dos parenteses
      modified_inner_exp = modified_inner_exp.replaceAll(
        /(\[P\d+\])/g,
        (match, p) => {
          return exp_dicio[p]["value"]
        }
      )
    }

    modified_inner_exp = modified_inner_exp // Substitui os valores Verdadeiro e Falso por 1 e 0
      .replaceAll("[Verdadeiro]", "1")
      .replaceAll("[Falso]", "0")

    for (let variable in obj) { 
      //Troca variaveis por seus valores
      modified_inner_exp = modified_inner_exp.replaceAll(
        variable,
        obj[variable]
      )
    }

    exp_dicio[inner_exp]["value"] =
      calculate_inner_expression(modified_inner_exp)
    string_result = `${string_result}|${raw_inner_exp}:${exp_dicio[inner_exp]["value"]}` // Adiciona a expressão e o resultado
  }

  return [result, string_result] // Retorna a expressão e o resultado
}

function build_answer_truth_table(obj, qtde_linhas) { // Constrói a tabela-verdade
  clear_result() //Limpa os resultados anteriores

  let table = document.createElement("table") // Cria uma nova tabela que exibirá os resultados
  table.classList.add("table")
  table.classList.add("table-striped")

  table.id = "answer-table" // Adiciona um id à tabela

  let thead = table.createTHead() // Cria o cabeçalho da tabela

  {
    //Título da tabela
    let row = thead.insertRow() // Cria a linha do cabeçalho do título
    let th = document.createElement("th")
    th.innerHTML = "Tabela-Verdade"
    th.colSpan = Object.keys(obj).length
    row.appendChild(th)
  }

  let row = thead.insertRow() // Cria a linha do cabeçalho com as variáveis

  for (let header in obj) { 
    // Preenche o cabeçalho
    let th = document.createElement("th")
    th.innerHTML = header
    row.appendChild(th)
  }

  table.appendChild(thead) // Adiciona o cabeçalho à tabela

  let tbody = table.createTBody() // Cria o corpo da tabela-verdade
  tbody.classList.add("table-group-divider") // Adiciona uma classe ao corpo da tabela

  for (let i = 0; i < qtde_linhas; i++) { // Preenche o corpo da tabela
    let row = tbody.insertRow()
    for (let header in obj) {
      let td = document.createElement("td")
      td.innerHTML = obj[header][i]
      row.appendChild(td)
    }
  }

  table.appendChild(tbody)

  document.querySelector("#result").appendChild(table) // Adiciona a tabela à div de resultados
}

function add_binary(a, b) { // Função para somar binários
  var i = a.length - 1
  var j = b.length - 1
  var carry = 0
  var result = ""
  while (i >= 0 || j >= 0) {
    var m = i < 0 ? 0 : a[i] | 0
    var n = j < 0 ? 0 : b[j] | 0
    carry += m + n // soma de dois dígitos
    result = (carry % 2) + result // concatena a string
    carry = (carry / 2) | 0 // remove os decimais,  1 / 2 = 0.5, pega apenas o 0
    i--
    j--
  }
  if (carry !== 0) {
    result = carry + result
  }
  return result
}

